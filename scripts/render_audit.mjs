#!/usr/bin/env node
// render_audit.mjs: render a page in headless Chrome at several widths, save screenshots,
// and run a DOM-level visual audit (overflow, clipping, contrast, tap size, type/colour/radius
// inventory, template tells, CJK typesetting). Zero dependencies: Node 22+ (global WebSocket)
// and a local Chrome / Chromium / Edge.
//
//   node render_audit.mjs <file.html|url> [--widths 1440,768,390] [--out shots] [--chrome PATH]
//                         [--no-full] [--wait 400]
// Exit code 1 when any FAIL is found. Report: <out>/report.json; screenshots: <out>/first-<w>.png
// (first screen, for the squint test) and <out>/full-<w>.png (whole page).
import { spawn, execSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const argv = process.argv.slice(2);
const opt = { widths: [1440, 768, 390], out: 'shots', chrome: process.env.CHROME_PATH || '', full: true, wait: 400 };
let target = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--widths') opt.widths = argv[++i].split(',').map(Number).filter(Boolean);
  else if (a === '--out') opt.out = argv[++i];
  else if (a === '--chrome') opt.chrome = argv[++i];
  else if (a === '--no-full') opt.full = false;
  else if (a === '--wait') opt.wait = Number(argv[++i]);
  else if (!target) target = a;
}
if (!target) { console.log('usage: node render_audit.mjs <file.html|url> [--widths 1440,768,390] [--out shots] [--chrome PATH]'); process.exit(2); }
if (typeof WebSocket === 'undefined') { console.error('render_audit: needs Node 22+ (global WebSocket).'); process.exit(2); }
const HEIGHTS = { 1440: 900, 1280: 800, 1024: 768, 820: 1180, 768: 1024, 390: 844, 375: 812, 320: 640 };

function findChrome() {
  if (opt.chrome && fs.existsSync(opt.chrome)) return opt.chrome;
  const home = os.homedir();
  const cands = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ];
  for (const c of cands) if (fs.existsSync(c)) return c;
  for (const bin of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge']) {
    try { const p = execSync(`command -v ${bin}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); if (p) return p; } catch {}
  }
  for (const base of [path.join(home, 'Library/Caches/ms-playwright'), path.join(home, '.cache/ms-playwright')]) {
    if (!fs.existsSync(base)) continue;
    for (const d of fs.readdirSync(base).filter(d => /^chromium-\d+/.test(d)).sort().reverse()) {
      for (const sub of ['chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium',
        'chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
        'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-linux/chrome', 'chrome-linux64/chrome']) {
        const p = path.join(base, d, sub); if (fs.existsSync(p)) return p;
      }
    }
  }
  return null;
}

const MIME = { '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.ico': 'image/x-icon' };

function serve(root) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = path.join(root, rel);
      if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404); return res.end('not found'); }
        res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
        res.end(buf);
      });
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

async function launch(chromePath) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'render-audit-'));
  const proc = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--hide-scrollbars', '--force-color-profile=srgb', '--remote-debugging-port=0', `--user-data-dir=${dir}`, 'about:blank'],
    { stdio: 'ignore' });
  const portFile = path.join(dir, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) await new Promise(r => setTimeout(r, 100));
  if (!fs.existsSync(portFile)) { proc.kill(); throw new Error('Chrome did not expose a DevTools port'); }
  await new Promise(r => setTimeout(r, 150));
  const port = fs.readFileSync(portFile, 'utf8').split('\n')[0].trim();
  let page = null;
  for (let i = 0; i < 50 && !page; i++) {
    try { page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch {}
    if (!page) await new Promise(r => setTimeout(r, 100));
  }
  if (!page) { proc.kill(); throw new Error('no page target'); }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const listeners = new Map();
  ws.onmessage = ev => {
    const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString());
    if (msg.id && pending.has(msg.id)) { const { res, rej } = pending.get(msg.id); pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
    else if (msg.method && listeners.has(msg.method)) for (const fn of listeners.get(msg.method)) fn(msg.params);
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const once = (method, ms) => new Promise(res => {
    const t = setTimeout(() => res(null), ms);
    const fn = p => { clearTimeout(t); listeners.set(method, (listeners.get(method) || []).filter(f => f !== fn)); res(p); };
    listeners.set(method, [...(listeners.get(method) || []), fn]);
  });
  const on = (method, fn) => { listeners.set(method, [...(listeners.get(method) || []), fn]); return () => listeners.set(method, (listeners.get(method) || []).filter(f => f !== fn)); };
  const close = () => { try { ws.close(); } catch {} proc.kill(); setTimeout(() => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch {} }, 300); };
  return { send, once, on, close };
}

// ---------------------------------------------------------------- in-page audit (serialised)
function pageAudit() {
  const W = document.documentElement.clientWidth || innerWidth, H = innerHeight, mobile = W < 600;
  const groups = new Map();
  const add = (sev, id, msg, sample) => {
    if (!groups.has(id)) groups.set(id, { sev, id, msg, count: 0, samples: [] });
    const g = groups.get(id); g.count++; if (sample && g.samples.length < 5) g.samples.push(sample);
  };
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true }); const cache = new Map();
  const rgba = str => { // any CSS colour -> [r,g,b,a(0..1)]
    if (cache.has(str)) return cache.get(str);
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = str; cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data; const v = [d[0], d[1], d[2], d[3] / 255]; cache.set(str, v); return v;
  };
  const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const over = (top, bot) => { const a = top[3]; return [0, 1, 2].map(i => top[i] * a + bot[i] * (1 - a)).concat(1); };
  const oklch = ([r, g, b]) => {
    const [R, G, B] = [lin(r), lin(g), lin(b)];
    const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
    const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
    const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
    const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
    return [L, Math.hypot(A, Bb), (Math.atan2(Bb, A) * 180 / Math.PI + 360) % 360];
  };
  const violet = c => { if (c[3] < 0.2) return false; const [L, C, h] = oklch(c); return h >= 270 && h <= 330 && C >= 0.04 && L >= 0.2 && L <= 0.95; };
  const hex = c => '#' + c.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  const visible = el => {
    const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false;
    const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0;
  };
  const desc = el => {
    let d = el.tagName.toLowerCase(); if (el.id) d += '#' + el.id; if (el.classList.length) d += '.' + [...el.classList].slice(0, 2).join('.');
    const t = (el.innerText || el.getAttribute('alt') || '').trim().replace(/\s+/g, ' ').slice(0, 36); return t ? `${d} "${t}"` : d;
  };
  const CJK = /[\u3400-\u9fff\uf900-\ufaff]/;
  const all = [...document.body.querySelectorAll('*')].filter(el => !['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(el.tagName));
  const vis = all.filter(visible);
  const ownText = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
  const textEls = vis.filter(el => ownText(el).length > 0);

  // 1. overflow
  const sw = document.documentElement.scrollWidth;
  let off = vis.filter(el => {
    const s = getComputedStyle(el); if (s.position === 'fixed') return false;
    const r = el.getBoundingClientRect(); if (r.right <= W + 1 && r.left >= -1) return false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (/(hidden|clip|auto|scroll)/.test(getComputedStyle(p).overflowX)) { const pr = p.getBoundingClientRect(); if (pr.right <= W + 1 && pr.left >= -1) return false; }
    }
    return true;
  });
  off = off.filter(el => !off.some(o => o !== el && o.contains(el)));
  if (sw > W + 1) { add('FAIL', 'h-overflow', `page scrolls sideways: ${sw}px wide at ${W}px`); off.forEach(el => add('FAIL', 'h-overflow', '', desc(el))); }
  else off.forEach(el => add('WARN', 'cut-by-viewport', 'element extends past the viewport and is cut off', desc(el)));

  // 2. clipped text
  for (const el of textEls) {
    const s = getComputedStyle(el);
    if (el.scrollWidth > el.clientWidth + 1 && /(hidden|clip)/.test(s.overflowX) && s.textOverflow !== 'ellipsis') add('WARN', 'text-clipped', 'text is wider than its box and clipped', desc(el));
    if (el.scrollHeight > el.clientHeight + 2 && /(hidden|clip)/.test(s.overflowY) && s.webkitLineClamp === 'none' && !/(auto|scroll)/.test(s.overflowY)) add('WARN', 'text-clipped', 'text is taller than its box and clipped', desc(el));
  }

  // 3. type size, 4. contrast, CJK checks
  const baseBg = (() => { for (const el of [document.body, document.documentElement]) { const c = rgba(getComputedStyle(el).backgroundColor); if (c[3] > 0.99) return c; } return [255, 255, 255, 1]; })();
  const bgOf = el => {
    const layers = [];
    for (let p = el; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.backgroundImage && s.backgroundImage !== 'none') return null;
      const c = rgba(s.backgroundColor); if (c[3] > 0) layers.push(c); if (c[3] > 0.99) break;
    }
    return layers.reverse().reduce((acc, c) => over(c, acc), baseBg);
  };
  for (const el of textEls) {
    const s = getComputedStyle(el); const fs = parseFloat(s.fontSize); const fw = parseInt(s.fontWeight, 10) || 400;
    const txt = ownText(el);
    if (fs < 12) add('FAIL', 'tiny-text', 'text under 12px', `${desc(el)} ${fs}px`);
    else if (fs < 14 && el.closest('p,li,dd,blockquote') && txt.length > 40) add('WARN', 'small-body', 'running text under 14px', `${desc(el)} ${fs}px`);
    if (el.closest(':disabled,[aria-disabled="true"],[inert]')) continue;
    if (rgba(s.color)[3] === 0 || (s.webkitTextFillColor && rgba(s.webkitTextFillColor)[3] === 0)) continue; // gradient text: reported separately
    const bg = bgOf(el);
    if (!bg) { add('INFO', 'contrast-unknown', 'text over an image/gradient: check the worst pixel by eye', desc(el)); continue; }
    const fg = over(rgba(s.color), bg); const r = ratio(fg, bg); const large = fs >= 24 || (fs >= 18.66 && fw >= 700);
    if (r < (large ? 3 : 4.5)) add('FAIL', 'contrast', `text contrast under ${large ? '3' : '4.5'}:1`, `${desc(el)} ${hex(fg)} on ${hex(bg)} = ${r.toFixed(2)}:1`);
    if (CJK.test(txt)) {
      const ls = parseFloat(s.letterSpacing) || 0; const lh = s.lineHeight === 'normal' ? 1.2 : parseFloat(s.lineHeight) / fs;
      if (ls < -0.001) add('WARN', 'cjk-negative-tracking', 'negative letter-spacing on CJK text', `${desc(el)} ${s.letterSpacing}`);
      if (/italic|oblique/.test(s.fontStyle)) add('WARN', 'cjk-italic', 'synthetic italic on CJK text', desc(el));
      if (el.matches('p,li,dd,blockquote') && txt.length >= 40 && lh < 1.6) add('WARN', 'cjk-leading', 'CJK running text line-height under 1.6', `${desc(el)} ${lh.toFixed(2)}`);
      if (el.matches('p,li,dd') && txt.length >= 120 && el.getBoundingClientRect().width / fs > 42) add('WARN', 'measure', 'CJK line longer than ~40 characters', desc(el));
    } else if (el.matches('p,li,dd') && txt.length >= 200 && el.getBoundingClientRect().width / (fs * 0.5) > 85) add('WARN', 'measure', 'line longer than ~80 characters', desc(el));
    if (/^rgb\(0, 0, 0\)$/.test(s.color) && txt.length > 20) add('WARN', 'pure-black-text', 'pure #000 text', desc(el));
    if (/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(txt) && el.closest('h1,h2,h3,h4,button,a,li')) add('WARN', 'emoji-icon', 'emoji used as icon or bullet', desc(el));
  }
  if (CJK.test(document.body.innerText) && !/^(zh|ja|ko)/i.test(document.documentElement.lang || '')) add('WARN', 'no-lang', 'CJK text without <html lang="zh-…">');
  const body = document.body.innerText;
  const dashLines = body.split('\n').filter(l => l.replace(/\u2014\u2014/g, '').includes('\u2014') || (l.includes('\u2014') && !CJK.test(l)));
  dashLines.slice(0, 5).forEach(l => add('FAIL', 'em-dash', 'em dash as separator/rhythm device', l.trim().slice(0, 60)));

  // 5. tap targets
  for (const el of vis.filter(e => e.matches('a[href],button,input:not([type=hidden]),select,textarea,[role=button],[role=link],summary'))) {
    if (el.matches('a') && el.closest('p,li,dd,td') && getComputedStyle(el).display === 'inline') continue;
    const r = el.getBoundingClientRect(); const m = Math.min(r.width, r.height);
    if (m < 24) add('FAIL', 'tap-size', 'interactive target under 24px (WCAG 2.5.8)', `${desc(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    else if (mobile && m < 44) add('WARN', 'tap-size-mobile', 'touch target under 44px on a phone width', `${desc(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
  }

  // 6. fixed header vs first h1
  const h1s = [...document.querySelectorAll('h1')].filter(visible);
  if (h1s.length !== 1) add('WARN', 'h1-count', `${h1s.length} visible h1 elements`);
  if (h1s[0]) {
    const hr = h1s[0].getBoundingClientRect();
    const bars = vis.filter(el => /fixed|sticky/.test(getComputedStyle(el).position) && !el.contains(h1s[0]) && el.getBoundingClientRect().top <= 1 && el.getBoundingClientRect().height < H / 2 && el.getBoundingClientRect().width > W * 0.5);
    for (const b of bars) {
      const br = b.getBoundingClientRect();
      if (hr.top < br.bottom && hr.bottom > br.top) add('FAIL', 'h1-under-header', 'first h1 sits under a fixed/sticky bar on first paint', desc(b));
      else if (hr.top - br.bottom < 32) add('WARN', 'hero-cramped', `h1 starts ${Math.round(hr.top - br.bottom)}px under the bar (marketing: bar + 96px)`, desc(b));
    }
  }
  let last = 0;
  for (const h of document.querySelectorAll('h1,h2,h3,h4,h5,h6')) { const n = +h.tagName[1]; if (last && n > last + 1) add('WARN', 'heading-skip', `h${last} followed by h${n}`, desc(h)); last = n; }

  // 7. images
  for (const img of document.querySelectorAll('img')) {
    if (!img.hasAttribute('alt')) add('WARN', 'img-no-alt', '<img> without alt', img.currentSrc || img.src);
    if (img.complete && img.naturalWidth === 0) add('FAIL', 'img-broken', 'image failed to load', img.currentSrc || img.src);
  }
  if (/picsum\.photos|placeholder\.com|placehold\.co|dummyimage/.test(document.documentElement.innerHTML)) add('WARN', 'placeholder-img', 'placeholder image service in the page');
  const vp = document.querySelector('meta[name=viewport]');
  if (!vp) add('WARN', 'no-viewport-meta', 'no <meta name="viewport">: phones will render at ~980px');
  else if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/i.test(vp.content)) add('FAIL', 'zoom-disabled', 'viewport meta disables zoom', vp.content);

  // 8. surfaces & tells
  const sections = document.querySelectorAll('section, main > *').length || 1; let eyebrows = 0;
  for (const el of vis) {
    const s = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (s.backgroundClip === 'text' || s.webkitBackgroundClip === 'text') add('FAIL', 'gradient-text', 'gradient / clipped-background text', desc(el));
    if (s.backdropFilter && s.backdropFilter !== 'none') add('WARN', 'glass', 'backdrop-filter in use (allowed only on floating chrome over scrolling content)', desc(el));
    const bw = ['Top', 'Right', 'Bottom', 'Left'].map(k => parseFloat(s[`border${k}Width`]) || 0);
    const blur = s.boxShadow === 'none' ? 0 : Math.max(0, ...(s.boxShadow.match(/-?\d*\.?\d+px/g) || []).map(parseFloat).filter((_, i) => i % 4 === 2));
    if (bw.every(w => w >= 1) && blur >= 16) add('WARN', 'ghost-card', '1px border plus a >=16px blur shadow', desc(el));
    if ((bw[3] >= 2 || bw[1] >= 2) && bw[0] <= 1 && bw[2] <= 1 && rgba(s.borderLeftColor)[3] > 0.5) add('WARN', 'side-stripe', 'side-stripe accent border', desc(el));
    const rad = parseFloat(s.borderTopLeftRadius) || 0;
    if (r.height >= 80 && r.width >= 120 && rad >= 32 && rad < Math.min(r.width, r.height) / 2 - 1) add('WARN', 'big-radius', `radius ${rad}px on a ${Math.round(r.width)}x${Math.round(r.height)} box`, desc(el));
    for (const prop of ['backgroundColor', 'color', 'borderTopColor']) { const c = rgba(s[prop]); if (violet(c) && !(prop === 'borderTopColor' && bw[0] === 0)) { add('WARN', 'violet', 'violet / indigo / lavender in the page design', `${desc(el)} ${prop} ${hex(c)}`); break; } }
    if (s.backgroundImage.includes('gradient')) {
      const cols = s.backgroundImage.match(/rgba?\([^)]*\)|oklch\([^)]*\)|color\([^)]*\)/g) || [];
      if (cols.some(c => violet(rgba(c)))) add('WARN', 'violet-gradient', 'gradient containing violet / indigo', desc(el));
      else add('INFO', 'gradient', 'background gradient (decorative gradients are a red line)', desc(el));
    }
    if (s.transitionProperty.split(',').some(p => p.trim() === 'all') && s.transitionDuration.split(',').some(d => parseFloat(d) > 0)) add('WARN', 'transition-all', 'transition: all', desc(el));
    if (s.textTransform === 'uppercase' && parseFloat(s.fontSize) <= 14 && (parseFloat(s.letterSpacing) || 0) / parseFloat(s.fontSize) > 0.05 && ownText(el)) eyebrows++;
  }
  if (eyebrows > Math.ceil(sections / 3)) add('WARN', 'eyebrows', `${eyebrows} small tracked all-caps labels for ${sections} sections`);

  // 9. inventory
  const inv = { families: new Set(), sizes: new Set(), weights: new Set(), radii: new Set(), shadows: new Set(), textColors: new Set(), bgColors: new Set() };
  for (const el of textEls) { const s = getComputedStyle(el); inv.families.add(s.fontFamily.split(',')[0].replace(/["']/g, '').trim()); inv.sizes.add(Math.round(parseFloat(s.fontSize) * 2) / 2); inv.weights.add(s.fontWeight); inv.textColors.add(hex(rgba(s.color))); }
  for (const el of vis) { const s = getComputedStyle(el); const rr = parseFloat(s.borderTopLeftRadius) || 0; const rect = el.getBoundingClientRect();
    if (rr > 0 && rr < Math.min(rect.width, rect.height) / 2 - 1) inv.radii.add(rr);
    if (s.boxShadow !== 'none') inv.shadows.add(s.boxShadow); const b = rgba(s.backgroundColor); if (b[3] > 0.5) inv.bgColors.add(hex(b)); }
  const fam = [...inv.families].filter(f => !/mono|code|courier|menlo|consolas/i.test(f));
  if (fam.length > 2) add('WARN', 'families', `${fam.length} text families: ${fam.join(', ')}`);
  if (inv.sizes.size > 8) add('WARN', 'type-sizes', `${inv.sizes.size} font sizes (Persuade <=8, Operate <=6)`, [...inv.sizes].sort((a, b) => a - b).join(' '));
  if (inv.weights.size > 4) add('WARN', 'weights', `${inv.weights.size} font weights`, [...inv.weights].join(' '));
  if (inv.radii.size > 5) add('WARN', 'radii', `${inv.radii.size} different corner radii`, [...inv.radii].sort((a, b) => a - b).join(' '));
  if (inv.shadows.size > 4) add('WARN', 'shadows', `${inv.shadows.size} different box-shadows (one per elevation level)`);
  const conv = ['inter', 'roboto', 'open sans', 'lato', 'montserrat', 'poppins', 'space grotesk', 'plus jakarta sans', 'geist', 'fraunces', 'instrument serif'];
  fam.filter(f => conv.includes(f.toLowerCase())).forEach(f => add('WARN', 'convergence-font', `"${f}" in use: state the reason or replace it`));
  const inventory = Object.fromEntries(Object.entries(inv).map(([k, v]) => [k, [...v].slice(0, 24)]));
  return { width: W, height: H, scrollHeight: document.documentElement.scrollHeight, findings: [...groups.values()], inventory };
}

// reduced-motion probe: anything still moving with transform under prefers-reduced-motion
function motionProbe() {
  const moving = document.getAnimations().filter(a => a.playState === 'running' && a.effect && a.effect.getKeyframes &&
    a.effect.getKeyframes().some(k => (k.transform && k.transform !== 'none') || k.translate || k.scale || k.rotate));
  return moving.slice(0, 5).map(a => { const t = a.effect.target; return t ? `${t.tagName.toLowerCase()}${t.className && typeof t.className === 'string' ? '.' + t.className.split(' ')[0] : ''}` : '(pseudo)'; });
}

// which @keyframes (by name) move things: transform / translate / scale / rotate / offsets
function keyframesThatMove(names) {
  const hit = new Set();
  const walk = rules => { for (const r of rules) {
    if (r.type === CSSRule.KEYFRAMES_RULE && names.includes(r.name) && /transform\s*:\s*(?!none)|translate|scale|rotate|\b(top|left)\s*:/.test(r.cssText)) hit.add(r.name);
    if (r.cssRules) walk(r.cssRules);
  } };
  for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch {} }
  return [...hit];
}

// ---------------------------------------------------------------- runner
const chromePath = findChrome();
if (!chromePath) { console.error('render_audit: no Chrome/Chromium/Edge found; pass --chrome PATH or set CHROME_PATH.'); process.exit(2); }
let server = null; let url = target;
if (!/^https?:\/\//.test(target)) {
  const abs = path.resolve(target);
  if (!fs.existsSync(abs)) { console.error(`render_audit: ${abs} not found`); process.exit(2); }
  server = await serve(path.dirname(abs));
  url = `http://127.0.0.1:${server.address().port}/${encodeURIComponent(path.basename(abs))}`;
}
fs.mkdirSync(opt.out, { recursive: true });
const cdp = await launch(chromePath);
const report = { target, url, chrome: chromePath, widths: [] };
let fails = 0;
try {
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  const evalJs = async (expr) => (await cdp.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value;
  for (const [idx, w] of opt.widths.entries()) {
    const h = HEIGHTS[w] || 900;
    // mobile:false keeps the layout viewport exactly w CSS px, so overflow at that width is measured, not zoomed away
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    const loaded = cdp.once('Page.loadEventFired', 20000);
    await cdp.send('Page.navigate', { url }); await loaded;
    await evalJs(`(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => new Promise(r => setTimeout(r, ${opt.wait})))`);
    const res = await evalJs(`(${pageAudit.toString()})()`);
    const first = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(opt.out, `first-${w}.png`), Buffer.from(first.data, 'base64'));
    if (opt.full) {
      const fullH = Math.min(res.scrollHeight, 16000);
      const full = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: fullH, scale: 1 } });
      fs.writeFileSync(path.join(opt.out, `full-${w}.png`), Buffer.from(full.data, 'base64'));
    }
    if (idx === 0) { // one reduced-motion pass at the first width: record every animation that starts
      await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      const started = [];
      const off = cdp.on('Animation.animationStarted', p => started.push(p.animation));
      await cdp.send('Animation.enable');
      const l2 = cdp.once('Page.loadEventFired', 20000); await cdp.send('Page.navigate', { url }); await l2;
      await evalJs('new Promise(r => setTimeout(r, 600))');
      await cdp.send('Animation.disable'); off();
      const names = [...new Set(started.filter(a => a.type === 'CSSAnimation').map(a => a.name))];
      const movingNames = await evalJs(`(${keyframesThatMove.toString()})(${JSON.stringify(names)})`) || [];
      const moves = [...started.filter(a => a.type === 'CSSTransition' && /transform|translate|scale|rotate|top|left/.test(a.name || '')).map(a => `transition ${a.name}`),
        ...movingNames.map(n => `@keyframes ${n}`)];
      const live = await evalJs(`(${motionProbe.toString()})()`);
      const samples = [...new Set([...moves, ...(live || [])])];
      if (samples.length) res.findings.push({ sev: 'WARN', id: 'reduced-motion', msg: 'movement (transform) still animates under prefers-reduced-motion', count: samples.length, samples: samples.slice(0, 5) });
    }
    report.widths.push(res);
  }
} finally { cdp.close(); if (server) server.close(); }

const icon = { FAIL: 'FAIL', WARN: 'WARN', INFO: 'info' };
for (const r of report.widths) {
  const order = { FAIL: 0, WARN: 1, INFO: 2 };
  r.findings.sort((a, b) => order[a.sev] - order[b.sev]);
  const nf = r.findings.filter(f => f.sev === 'FAIL').length; fails += nf;
  console.log(`\n=== ${r.width}x${r.height}  (page height ${r.scrollHeight}px)  ${nf} FAIL / ${r.findings.filter(f => f.sev === 'WARN').length} WARN`);
  for (const f of r.findings) {
    console.log(`${icon[f.sev].padEnd(4)} ${f.id.padEnd(22)} x${String(f.count).padEnd(3)} ${f.msg}`);
    for (const s of f.samples) console.log(`       - ${s}`);
  }
  const inv = r.inventory;
  console.log(`     inventory: families[${inv.families.join(', ')}] sizes[${inv.sizes.sort((a, b) => a - b).join(' ')}] weights[${inv.weights.join(' ')}] radii[${inv.radii.join(' ')}] shadows ${inv.shadows.length} bg ${inv.bgColors.length} text ${inv.textColors.length}`);
}
fs.writeFileSync(path.join(opt.out, 'report.json'), JSON.stringify(report, null, 2));
console.log(`\nrender_audit: screenshots and report.json in ${path.resolve(opt.out)}  ->  ${fails ? 'FAIL' : 'PASS (read the screenshots too)'}`);
process.exit(fails ? 1 : 0);
