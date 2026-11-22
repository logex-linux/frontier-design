#!/usr/bin/env python3
"""slop_scan.py: static scan for template / "AI slop" tells in front-end source.

Usage:
  python3 slop_scan.py <file-or-dir> [...]          scan HTML/CSS/JS/JSX/TSX/Vue/Svelte/MD
  python3 slop_scan.py contrast "#FG" "#BG"          WCAG contrast ratio of two hex colours
Exit code 1 when any FAIL is found. Standard library only.
Rules come from frontier-design/SKILL.md section 2; a hit means "look at it", and a deliberate,
brief-pinned exception is waived in the report with its reason, never by editing this script.
"""
import math
import os
import re
import sys

EXTS = {".html", ".htm", ".css", ".scss", ".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte", ".md", ".mdx", ".astro"}
SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next", "out", "coverage", ".taste-skill", "vendor"}
CJK = re.compile(r"[\u3400-\u9fff\uf900-\ufaff]")

# (severity, id, regex, message); regexes run per line, case-insensitive unless noted
LINE_RULES = [
    ("WARN", "transition-all", r"transition\s*:\s*all\b|\btransition-all\b", "transition: all; name the properties (transform/opacity)"),
    ("WARN", "scale-zero", r"scale\(\s*0\s*\)|\bscale-0\b", "entry from scale(0); start at scale(0.95) + opacity 0"),
    ("WARN", "ease-in-ui", r"(?<![\w-])ease-in(?![\w-])", "ease-in on UI; use a strong ease-out"),
    ("WARN", "stripes", r"repeating-linear-gradient", "decorative stripe background"),
    ("WARN", "fake-paper", r"feTurbulence|feDisplacementMap", "fake paper grain / sketch filter"),
    ("FAIL", "gradient-text", r"background-clip\s*:\s*text|-webkit-background-clip\s*:\s*text|\bbg-clip-text\b", "gradient text"),
    ("WARN", "glass", r"backdrop-filter|\bbackdrop-blur", "glass / backdrop-filter: only for floating chrome over scrolling content"),
    ("WARN", "side-stripe", r"border-(left|right|inline-start|inline-end)\s*:\s*([2-9]|\d{2,})px|\bborder-[lr]-(?:[2-8])\b", "side-stripe accent border"),
    ("WARN", "big-radius", r"border-radius\s*:\s*(3[2-9]|[4-9]\d)px|\brounded-(3xl|\[(3[2-9]|[4-9]\d)px\])", "radius >= 32px; cards top out at 12-20px"),
    ("WARN", "magic-z", r"z-index\s*:\s*(999|9999|99999)\b|\bz-\[9{3,}\]", "magic z-index; use a semantic scale"),
    ("FAIL", "zoom-disabled", r"user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b", "zoom disabled"),
    ("WARN", "pure-black", r"(?<![\w-])(color|background(-color)?)\s*:\s*(#000(000)?|black)\b", "pure #000; use the ink token (near-black #0A0A0A-#1A1A1A)"),
    ("WARN", "violet-class", r"\b(?:bg|text|from|via|to|border|ring|shadow)-(?:purple|violet|indigo|fuchsia)-\d{2,3}\b", "violet/indigo utility class"),
    ("WARN", "placeholder-img", r"picsum\.photos|placeholder\.com|via\.placeholder|placehold\.co|dummyimage", "placeholder image service in final work"),
    ("FAIL", "residue", r"lorem ipsum|\[company name\]|\bjohn doe\b|\bjane doe\b|\bacme\b|certainly!|i hope this helps|\[NEED\]", "template / conversation residue"),
    ("WARN", "outline-none", r"outline\s*:\s*(none|0)\b|\boutline-none\b", "outline removed; ensure a :focus-visible replacement"),
    ("WARN", "arrow-link", r"→\s*</(a|button)>|->\s*</(a|button)>", "arrow appended to link/button text"),
    ("WARN", "version-pill", r">\s*(v\d+\.\d+(\.\d+)?|beta|alpha|early access|invite-only)\s*<", "version / beta label as decoration"),
    ("WARN", "scroll-cue", r">\s*(scroll( to explore| down)?|↓ ?scroll)\s*<", "scroll cue"),
    ("WARN", "step-label", r">\s*(stage|phase|step)\s*0?\d\b", "generic step label; name the action instead"),
    ("WARN", "numbered-eyebrow", r">\s*0\d\s*(/|·|—|-)\s*\w", "numbered section marker (01 / ...); only for real sequences"),
]

SLOP_EN = ["delve", "tapestry", "testament to", "realm", "embark", "beacon", "multifaceted", "paradigm", "myriad",
           "plethora", "meticulous", "intricate", "interplay", "garner", "boasts", "elevate", "unlock", "unleash",
           "empower", "harness", "supercharge", "seamless", "effortless", "cutting-edge", "revolutionary",
           "transformative", "holistic", "next-level", "world-class", "game-changer", "state-of-the-art", "bespoke",
           "synergy", "leverage", "reimagine", "nestled", "unparalleled",
           "in today's fast-paced world", "unlock the power of", "say goodbye to", "join thousands of",
           "trusted by teams worldwide", "imagine a world where", "look no further", "one-stop shop",
           "at your fingertips", "in just a few clicks", "it's not just", "let that sink in", "here's the thing"]
SLOP_ZH = ["赋能", "助力", "打造", "一站式", "全方位", "全链路", "极致", "匠心", "引领", "颠覆", "重塑", "无缝",
           "生态闭环", "降本增效", "数字化转型", "开启新篇章", "新篇章", "为你而生", "重新定义", "在这个快速变化的时代"]
CONVERGENCE_FONTS = ["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Space Grotesk",
                     "Plus Jakarta Sans", "Geist", "Fraunces", "Instrument Serif"]

HEX = re.compile(r"#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")
EMOJI = re.compile("[\U0001F300-\U0001FAFF\u2600-\u27BF]")


def hex_rgb(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def lum(rgb):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = lum(hex_rgb(a)), lum(hex_rgb(b))
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def oklch(h):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(c) for c in hex_rgb(h))
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    big_l = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return big_l, math.hypot(a, bb), math.degrees(math.atan2(bb, a)) % 360


def is_violet(h):
    """Violet / indigo / lavender: OKLCH hue 270-330 with visible chroma (cobalt blues sit at ~264)."""
    big_l, c, hue = oklch(h)
    return 270 <= hue <= 330 and c >= 0.04 and 0.2 <= big_l <= 0.95


def css_blocks(text):
    """Yield (start_line, block_body) for simple `selector { ... }` blocks."""
    for m in re.finditer(r"\{([^{}]*)\}", text):
        yield text.count("\n", 0, m.start()) + 1, m.group(1)


def scan_file(path, findings, counters):
    try:
        text = open(path, encoding="utf-8", errors="ignore").read()
    except OSError:
        return
    lines = text.splitlines()
    ext = os.path.splitext(path)[1].lower()
    is_code = ext not in {".md", ".mdx"}

    def add(sev, rule, ln, msg):
        findings.append((sev, rule, path, ln, msg))

    for i, line in enumerate(lines, 1):
        low = line.lower()
        if is_code:
            for sev, rid, rx, msg in LINE_RULES:
                if re.search(rx, line, re.I):
                    add(sev, rid, i, msg)
        # dashes: Chinese "——" is grammatical; a lone em dash or spaced en dash is the English tell
        if "\u2014" in line:
            stripped = line.replace("\u2014\u2014", "")
            if "\u2014" in stripped or not CJK.search(line):
                add("FAIL", "em-dash", i, "em dash (U+2014) used as a separator/rhythm device")
        if re.search(r"\s\u2013\s", line):
            add("WARN", "en-dash-separator", i, "spaced en dash used as a separator")
        if line.count("\u00b7") >= 2 and not CJK.search(line):
            add("WARN", "middot-chain", i, "more than one middle dot in a meta line")
        for w in SLOP_EN:
            if re.search(r"(?<![\w-])" + re.escape(w) + r"(?![\w-])", low):
                add("WARN", "copy-slop-en", i, f'stock word/phrase "{w}"')
        for w in SLOP_ZH:
            if w in line:
                add("WARN", "copy-slop-zh", i, f"中文套话「{w}」：改写为 谁 + 做什么 + 具体结果")
        if re.search(r"<(h[1-6]|button|a|li)[^>]*>[^<]*" + EMOJI.pattern, line):
            add("WARN", "emoji-icon", i, "emoji used as an icon/bullet in heading, button, link or list")
        if is_code:
            for hx in HEX.findall(line):
                if is_violet("#" + hx):
                    add("WARN", "violet-hex", i, f"violet/indigo/lavender colour #{hx} (OKLCH hue 270-330)")
            fm = re.search(r"font-family\s*:\s*([^;]+)|fontFamily\s*[:=]\s*([^,}\n]+)|family=([A-Za-z+]+)", line)
            if fm:
                val = next(g for g in fm.groups() if g).replace("+", " ")
                first = val.split(",")[0].strip().strip("'\"")
                for f in CONVERGENCE_FONTS:
                    if first.lower() == f.lower():
                        add("WARN", "convergence-font", i, f'"{f}" as the primary face: state a reason or replace it')
            if re.search(r"\buppercase\b", line) and re.search(r"tracking-|letter-spacing", line):
                counters["eyebrow"] += 1

    if is_code:
        for ln, body in css_blocks(text):
            b = body.lower()
            if re.search(r"text-transform\s*:\s*uppercase", b) and "letter-spacing" in b:
                counters["eyebrow"] += 1
            shadow = re.search(r"box-shadow\s*:\s*([^;]+)", b)
            if shadow and re.search(r"(?<![\w-])border\s*:\s*1px", b):
                first = re.split(r"rgba?\(|hsla?\(|#|oklch\(|color-mix\(", shadow.group(1))[0]
                lengths = [float(x) for x in re.findall(r"(-?\d*\.?\d+)(?:px)?", first.replace("inset", ""))]
                if len(lengths) >= 3 and lengths[2] >= 16:
                    add("WARN", "ghost-card", ln, "1px border + box-shadow blur >= 16px on the same element; pick one")
        if re.search(r"@keyframes|animation\s*:", text) and "prefers-reduced-motion" not in text:
            add("WARN", "no-reduced-motion", 1, "animations without a prefers-reduced-motion branch in this file")
        if ext in {".html", ".htm"}:
            if not re.search(r"<html[^>]*\blang=", text, re.I):
                add("WARN", "no-lang", 1, "<html> without lang (CJK glyph selection and screen readers need it)")
            for m in re.finditer(r"<img\b(?![^>]*\balt=)[^>]*>", text, re.I):
                add("WARN", "img-no-alt", text.count("\n", 0, m.start()) + 1, "<img> without alt")


def walk(targets):
    for t in targets:
        if os.path.isfile(t):
            yield t
            continue
        for root, dirs, files in os.walk(t):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for f in files:
                if os.path.splitext(f)[1].lower() in EXTS and not f.endswith(".min.js"):
                    yield os.path.join(root, f)


def main(argv):
    if len(argv) >= 1 and argv[0] == "contrast":
        if len(argv) != 3:
            print('usage: slop_scan.py contrast "#FG" "#BG"')
            return 2
        r = contrast(argv[1], argv[2])
        verdicts = [("AA body 4.5", r >= 4.5), ("AA large/UI 3.0", r >= 3.0), ("AAA body 7.0", r >= 7.0)]
        print(f"{argv[1]} on {argv[2]}: {r:.2f}:1  " + "  ".join(f"{n}:{'pass' if ok else 'FAIL'}" for n, ok in verdicts))
        return 0 if r >= 4.5 else 1
    if not argv:
        print(__doc__)
        return 2
    findings, counters = [], {"eyebrow": 0}
    files = list(walk(argv))
    for f in files:
        scan_file(f, findings, counters)
    if counters["eyebrow"] >= 3:
        findings.append(("WARN", "eyebrow-count", "(all files)", 0,
                         f"{counters['eyebrow']} uppercase + letter-spacing labels; at most ceil(sections/3)"))
    order = {"FAIL": 0, "WARN": 1}
    findings.sort(key=lambda x: (order[x[0]], x[2], x[3]))
    for sev, rule, path, ln, msg in findings:
        print(f"{sev:4} {rule:20} {path}:{ln}  {msg}")
    n_fail = sum(1 for f in findings if f[0] == "FAIL")
    n_warn = len(findings) - n_fail
    print(f"\nslop_scan: {len(files)} files, {n_fail} FAIL, {n_warn} WARN")
    return 1 if n_fail else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
