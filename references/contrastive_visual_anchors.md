# 正反对照校准集（Contrastive Visual Anchors）

用法：动笔前读与当前载体最接近的 2–3 组；评审时把成品与 Before 列逐项比对——命中 Before 的任何一条，就按 After 的**决策逻辑**重做，而不是照抄 After 的数值。所有色值对比度均已实算；示例文案中的事实一律标为示例，真实项目必须换成客户资料。

每组结构：**Before**（典型 AI 模板解）→ **After**（设计决策 + 实现）→ **解剖**（为什么更好，对应哪条规则）→ **验收**。

---

## 1. 软件官网首屏：AI 代码评审工具（Persuade，原型 D）

**Before**
```html
<section class="hero" style="background:linear-gradient(135deg,#6366F1,#8B5CF6);text-align:center">
  <span class="pill">✨ NEW · V2.0 BETA</span>
  <h1>Supercharge your workflow with <span class="gradient-text">AI-powered</span> code review</h1>
  <p>Unlock seamless collaboration. Trusted by 10,000+ teams worldwide.</p>
  <a class="btn glow">Get Started →</a><a class="btn ghost">Learn More</a>
  <div class="fake-dashboard"><div class="bar"></div><div class="bar"></div><div class="chart"></div></div>
</section>
```

**After**
- Design Read：`Persuade × 代码评审 × 原型 D（软件）× 锚点 = 一段真实的红绿 diff 与它的 Accept 按钮`。
- 色（冷灰钴蓝）：底 `#EEF0F3`、墨 `#0B0C0E`（17.1:1）、次要 `#5D6470`（5.2:1）、强调 `#1F2DE6`（7.1:1；按钮白字 8.2:1）。diff 的红绿属于产品界面的数据语义，不算第二强调色。拒绝：紫、渐变、发光、BETA 胶囊。
- 字：IBM Plex Sans（400/500）+ Plex Mono（只给 diff 里的真实代码）。h1 72/38px，字距 −0.03em，行高 1.05。
- 构图：12 栏，文字占 1–5 栏，产品窗口占 6–12 栏，与 h1 顶部对齐，窗口下缘被画板边缘裁切（暗示更大的整体）。
- 文案：h1 说品类与买家；一条硬事实；按钮 = 动词 + 宾语；一个实心按钮 + 一个文字链接。
```html
<section class="hero" data-enter>
  <div class="wrap grid">
    <div class="hero-text">            <!-- grid-column: 1 / span 5 -->
      <h1>Code review for backend teams on GitHub</h1>
      <p class="lead">Leaves line comments on every pull request and proposes the fix. Works with self-hosted GitHub Enterprise and GitLab.</p>  <!-- 示例事实 -->
      <div class="btn-row"><a class="btn btn--primary" href="/trial">Start a free trial</a>
        <a class="link" href="/sample">See a sample review</a></div>
    </div>
    <figure class="panel">            <!-- grid-column: 6 / span 7 -->
      <div class="app-frame"><!-- 真实组件：diff + 评论 + Accept，按真实尺寸 --></div>
    </figure>
  </div>
</section>
```
```css
.hero{padding-top:calc(var(--nav) + 96px); min-height:100svh}
.hero h1{font:500 clamp(2.375rem,4vw + 1rem,4.5rem)/1.05 var(--font-sans); letter-spacing:-.03em; max-width:14ch}
.panel{border-radius:20px; overflow:hidden; background:var(--surface)}
.app-frame{border-radius:12px; margin:8px 8px 0; transform:translateY(24px)} /* 内圆角 = 20 − 8 */
```

**解剖**：Before 的每个元素都能原样搬到任何 AI 产品上（宪章 #2 失败）；After 的锚点只属于"代码评审"这一题材。颜色从"装饰"退回"预算"：唯一的饱和色是主按钮。div 假仪表盘被真实界面片段取代（红线：假截图）。

**验收**：遮住 logo 换成任意竞品名，h1 与产品窗口不再成立 → 通过；首屏缩略图第一眼落在 diff 上。

---

## 2. 特性区：三张等宽图标卡（Persuade）

**Before**：三张 `border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,.1)` 的白卡，每张一个渐变圆里的图标 + "Lightning Fast / Secure by Default / Easy Integration" + 两行灰字；hover 全部 `scale(1.05)`。

**After**
- 结构从"三等分"改为"一主两辅"：主卡占 7 栏，放一个真实片段（评审评论线程）；右侧两张占 5 栏上下堆叠：一张是真实集成 logo（GitHub、GitLab、Slack 原色），一张是一条可配置的规则片段。
- 卡片几乎不存在：`background: var(--surface); border:1px solid color-mix(in srgb, var(--ink) 10%, transparent); border-radius:20px; padding:32px`，静止无阴影。
- 标题一行 20px/500，下方 8px 接两行 16/24 的墨色正文（≤46ch），不写灰色小字。只有带链接的卡片 hover 上浮 2px（180ms ease-out），其余不动。
- 标题写能力的名词，不写形容词："Line comments with a proposed patch"，而不是 "Lightning Fast"。

**解剖**：等宽阵列告诉读者"这三件事一样重要"，这几乎从不为真（宪章 #1、#3）。不对称组合把层级写进几何；真实片段让卡片承载证据而非形容词（宪章 #6）。

**验收**：区块布局词不是"三卡网格"；每张卡片能指出它展示的真实对象。

---

## 3. 高端消费品：铸铁/碳钢锅具品牌（Persuade，原型 D 产品）

**Before**：奶油底 `#F5F1EA` + 黄铜 `#B08947` + 咖啡黑 `#1A1714`，Fraunces 斜体标题 "Crafted for the *modern* kitchen"，生活方式图库照片，10 行逐行描边的规格表。

**After**
- 从材料取色——钢与火：底 `#EEEEEB`、表面 `#E1E1DD`、墨 `#1C1D1F`（14.5:1）、次要 `#5C5E62`（5.6:1）、强调"火色" `#C2501B`。实算发现 `#C2501B` 在底色上仅 4.1:1，所以它**只**做主按钮底色（白字 4.7:1）与大尺寸元素，不做小字链接。
- 字：Archivo（宽而硬，器具感）400/500，sans 展示；不因为"高端"就上衬线。
- 产品整体大图：Hero 用产品侧面满版照片，产品占内容宽 ≥80%，照片上不叠字；标题放在照片下方的纯底上。
- 规格：挑 3–4 个真实规格做大字磁贴（厚度、重量、可用热源），其余收进"查看完整规格"折叠，不做逐行描边表。
- h1："Carbon-steel pans for people who cook every night"（品类 + 买家）。

**解剖**：Before 是 AI 的"高端消费品"默认色族，品牌因此隐形（DT 色族禁令）。After 的颜色能被题材解释——"钢与火"，所以它属于这个客户。强调色的对比度不足被实算抓出来并限制了用途（宪章 #4、#8）。

**验收**：说得出每个颜色来自哪种材料；强调色没有出现在任何 <24px 的文字上。

---

## 4. Dashboard 指标行（Operate，原型 C）

**Before**
```html
<div class="kpi" style="background:linear-gradient(135deg,#8B5CF6,#EC4899);border-radius:24px;box-shadow:0 20px 40px rgba(139,92,246,.4)">
  <div class="icon-circle">💰</div><h2>$1,234,567</h2><p>Total Revenue <b>+12.5% 🚀</b></p>
</div>  <!-- ×4，全部同尺寸 -->
```

**After**
```html
<section class="metrics" aria-label="本周指标">
  <div class="metric metric--primary">
    <span class="metric__label">净收入</span>
    <span class="metric__value">¥1,284,350</span>
    <span class="delta delta--up"><svg aria-hidden="true"><!-- 上箭头 --></svg>4.2% <span class="muted">较上周</span></span>
  </div>
  <div class="metric"><span class="metric__label">新签客户</span><span class="metric__value">37</span>…</div>
</section>
```
```css
.metrics{display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:0 32px; padding-block:24px; border-block-end:1px solid var(--line)}
.metric__label{font:500 13px/1.4 var(--font-sans); color:var(--ink-muted)}          /* #5D6470 on #FFF = 6.0:1 */
.metric__value{font:500 20px/1.2 var(--font-sans); font-variant-numeric:tabular-nums; color:var(--ink)}
.metric--primary .metric__value{font-size:28px}                                     /* 应用页上限 28px */
.delta--up{color:var(--success)}  .delta--down{color:var(--danger)}                 /* 5.4:1 / 5.7:1 */
```
- 指标不是卡片阵列：一行对齐的数字，靠栏宽表达主次（2fr 对 1fr），一条底线收住整组。
- 增减三重编码：符号/箭头图标 + 数值 + 颜色；去掉颜色仍可读。
- 数字等宽、右侧不跳动；示例数字非整齐的"漂亮数"，并在开发数据中标注为示例。

**解剖**：Before 把营销 Hero 的语法（大字、渐变、发光、emoji）塞进高频工具界面（Operate 红线）。After 让数字成为主角，界面退场；渐变卡在密度 >7 的界面一律禁用（DT core-rules）。

**验收**：灰度截图仍分得清涨跌；组件标题 ≤24px，最大数字 ≤28px。

---

## 5. 数据图表：区域销售对比（原型 C / 编辑出版）

**Before**：标题"2024 年各区域月度销售额柱状图"；七种颜色的柱子，每根柱子渐变填充 + 投影；纵轴从 800 起（断轴，差距被放大三倍）；右上角图例；网格线 10 条。

**After**
- 标题写结论："华东在第三季度反超华南"；副标题写口径："单位：万元；2024 年 7–9 月合计；深色为华东"。
- 图型：横向条形（类目名较长），按数值降序；基线从 0 开始；数值直接标在条尾，删掉图例与纵向网格线。
- 颜色：灰 `#85847E` 承担所有非主角（对纸 `#F0EFEB` 3.3:1，满足数据标记 ≥3:1；对主角墨色 4.6:1，主次可分），主角华东用墨 `#1C1C1A`（对纸 14.8:1）；只有一个主角。实算淘汰了更浅的 `#B0AFA9`（对纸仅 1.9:1，条形会"消失"）。
- 来源行：句首大写的 12px 小字"来源：公司 ERP 导出，2024-10-08"，不用全大写加字距。
```svg
<svg viewBox="0 0 640 260" role="img" aria-labelledby="t1 d1">
  <title id="t1">华东在第三季度反超华南</title>
  <desc id="d1">2024 年 7–9 月各区销售额：华东最高，华南次之。</desc>   <!-- 示例数据 -->
  <!-- 每根条：<rect x="120" y="…" width="value * scale" height="24" fill="#85847E"/>；华东 fill="#1C1C1A" -->
  <!-- 条尾标注：<text x="…" font-size="13" font-variant-numeric="tabular-nums">1,284</text> -->
</svg>
```

**解剖**：Before 的标题告诉读者"这是什么图"，After 告诉读者"该看见什么"（LF：标题写结论）。断轴违背"长度 ∝ 数值"的契约；七种颜色让颜色失去"这里"的含义。明度即数据：最重要的最深。

**验收**：遮住标题，读者仍能从明度与排序看出主角；任何柱长都与数值成正比。

---

## 6. 中文 SaaS 落地页：财务对账工具（Persuade，原型 A/D）

**Before**：微软雅黑一个字重到底；蓝紫渐变 + 粒子连线背景；h1"赋能企业数字化转型，开启智能财务新篇章"；每个区块上方"关于我们 ABOUT US"；三张卡片"高效 · 安全 · 稳定"；行高 1.5，标题字距 −0.02em。

**After**
```html
<html lang="zh-CN">
<h1>给 50 人以下财务团队的自动对账工具</h1>
<p class="lead">连接网银流水与开票系统，每天早上把前一天的账对平，差异逐笔列出。</p>  <!-- 示例能力描述 -->
<a class="btn btn--primary" href="/trial">免费试用 14 天</a>                        <!-- 示例条款 -->
```
```css
:root{ --font-sans:"Hanken Grotesk","Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif; }
body{ font:400 17px/1.8 var(--font-sans); letter-spacing:.02em; line-break:strict; color:#111111; background:#FFFFFF; }
h1{ font-weight:500; font-size:clamp(2rem,3vw + 1rem,3.5rem); line-height:1.25; letter-spacing:0; max-width:16em; }  /* 原型 D：字重 400/500 */
.lead{ max-width:36em; color:#5D6470; }   /* 6.0:1 */
```
- 色：纸与圆珠笔色族（墨 `#111111` 18.9:1，强调 `#1A4BE0` 6.7:1）。拒绝：渐变、粒子、双语装饰标题。
- 首屏画面：一张真实的"对账差异列表"界面片段，列出三笔差异及其"标记已处理"按钮；数字列右对齐、等宽。
- 区块标题只用中文、写名词短语（"差异逐笔可追溯"），不加英文小标签，不加编号。

**解剖**：Before 的 h1 可以套在任何中国 B 端产品上；After 的 h1 用"品类 + 买家"把产品钉死。中文排版参数（行高 1.8、字距 0.02em、标题零字距、`lang`、避头尾）修正了中文页面最常见的"挤、黑、像机翻"的观感。

**验收**：中文段落每行 28–40 字；页面无英文装饰标签；`slop_scan` 中文套话为 0。

---

## 7. 文化活动海报：唱片聆听会（Experience，原型 F）

**Before**：所有元素居中；整张图库照片 + 黑色渐变遮罩；五种字体（含手写体与描金衬线）；标题外发光；日期、地点、票价同一字号；四角装饰花纹。

**After**
```
3:4  承印物 #FAFAF7   主版 钴蓝 #2148B8（约 80%）  副版 信号红 #C83232（约 20%：只给日期与一个圈注）
┌───────────────────────────────┐
│ L                              │  ← 外边距 = 页宽 7%
│ I   ◐◐◐ 半调网点：一只手搭在唱片边缘 │  ← 主体占 60%，右缘与下缘被裁切
│ S        （主版）               │
│ T  ← 巨字 "LISTEN" 竖向贯穿，被手部图像压住一半（字与物碰撞）
│ E                              │
│ N   ──────────────────────     │  ← 一条细线，所有事实左对齐于此
│     11.23 周六 19:30  ◯（红色手绘圈注，唯一手工动作） │
│     一间旧书店的二楼  免费，需预约    │  ← 功能声部，最大字/最小字 ≈ 12×
│                       （释放区：约 35% 空纸）  │
└───────────────────────────────┘
```
- 一个焦点事件（巨字与手的碰撞）+ 一个释放区；两种字：展示声部（宽 grotesk）+ 功能声部（等宽数字的 grotesk）。
- 墨的用途写清楚：信号红在纸上 5.1:1，可承担日期小字；钴蓝 7.5:1。
- 瑕疵预算 1 个：主版 1mm 套准偏移，只作用于图像与巨字，不碰事实信息。

**解剖**：Before 的居中 + 遮罩 + 多字体是"什么都想要"的结果；After 只做一件事并做到底（MC：一个物、字与物碰撞、纸穿过图像、一个手工动作）。没有渐变遮罩，可读性靠把事实放在空纸上解决。

**验收**：缩到邮票大小仍能认出"LISTEN"与那只手；数墨色：除纸外 2 种。

---

## 8. 表单：账户设置（Operate，原型 C）

**Before**：标签与字段、字段与下一标签都是 16px；占位符当标签；错误只把边框变红；"Submit"按钮 36px 高，旁边输入框 44px 高；`outline:none`。

**After**
```css
.field{ display:grid; gap:6px; }                    /* 标签 → 自己的字段 */
.field + .field{ margin-top:24px; }                  /* 字段 → 下一组 */
.input, .btn{ height:44px; }                         /* 同一行等高，以按钮 token 为准 */
.input{ background:#FFFFFF; border:1px solid #8A919C; border-radius:8px; padding-inline:12px; } /* 边框 ≥3:1 */
.input:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }
.field__error{ display:flex; gap:8px; color:var(--danger); font-size:14px; }  /* 图标 + 文字，非仅颜色 */
.btn{ white-space:nowrap; flex-shrink:0; }
```
```html
<div class="field">
  <label for="email">工作邮箱</label>
  <input id="email" class="input" aria-describedby="email-err" aria-invalid="true">
  <p id="email-err" class="field__error"><svg aria-hidden="true">…</svg>这个邮箱已绑定另一个账户。换一个邮箱，或去登录页找回该账户。</p>
</div>
<button class="btn btn--primary">保存更改</button>
```
- 错误文案说清发生了什么、怎么修，不道歉；按钮写"保存更改"，成功提示写"已保存"（同一动作同一名字）。

**解剖**：Before 的等距让读者无法判断标签属于哪个字段（TU 邻近原则）；仅靠红色的错误对色弱用户不可见。After 的 6/24 间距比把分组写进空间。

**验收**：去掉所有边框后，标签与字段的归属仍一目了然；输入框边框对白底 ≥3:1。

---

## 9. 卡片本身（所有原型）

**Before**
```css
.card{ background:linear-gradient(180deg,#FFFFFF,#F3F4F6); border:1px solid #E5E7EB;
       box-shadow:0 20px 40px rgba(0,0,0,.1); border-radius:32px; padding:16px; }
.card img{ border-radius:32px; }              /* 内外同圆角：内角"戳出"外框 */
.card:hover{ transform:scale(1.05) rotate(-1deg); }
```

**After**
```css
.card{ background:var(--surface); border:1px solid color-mix(in srgb, var(--ink) 10%, transparent);
       border-radius:20px; padding:32px; }   /* 1024 以下 28px，手机 24px */
.card__media{ margin:-24px -24px 24px; border-radius:12px; }  /* 距卡边 8px：20 − 8 = 12 */
a.card{ transition:transform 180ms var(--ease-out); }
@media (hover:hover) and (pointer:fine){ a.card:hover{ transform:translateY(-2px); } }
```
- 边界只定义一次（1px 线，墨色 10%），静止无阴影；渐变底删除。
- 圆角按嵌套公式计算；只有真正是链接的卡片回应指针，位移 2px，不缩放、不倾斜。

**解剖**：Before 同时用了渐变、线、大模糊阴影、超大圆角和缩放倾斜——五种"高级感"信号叠加，结果是廉价（幽灵卡 + 过圆角 + 装饰动效三条红线）。After 让卡片"几乎不存在"，颜色留给卡里的真实内容（TS cards）。

**验收**：`render_audit` 不报幽灵卡与大圆角；内外圆角差 = 内边距。

---

## 10. 动效：页面与弹窗（所有原型）

**Before**
```css
.section{ opacity:0; transform:translateY(40px); transition:all .8s ease-in; }  /* 每个区块滚动触发 */
.card:hover, .btn:hover, .icon:hover{ transform:scale(1.1); }
@keyframes pop{ from{ transform:scale(0); } to{ transform:scale(1); } }
.modal{ animation:pop .5s ease-in; }
```

**After**
```css
/* 1. 全页只有 Hero 在加载时入场一次 */
[data-enter]>*{ animation:enter 600ms var(--ease-out) both; }
[data-enter]>*:nth-child(2){ animation-delay:60ms; } [data-enter]>*:nth-child(3){ animation-delay:120ms; }
@keyframes enter{ from{ opacity:0; transform:translateY(12px); } }
/* 2. 弹窗：从 0.96 起，ease-out，进 260ms 出 180ms */
dialog[open]{ animation:dlg-in 260ms var(--ease-out); }
@keyframes dlg-in{ from{ opacity:0; transform:scale(.96); } }
/* 3. 弹出层从触发点展开 */
.popover{ transform-origin:var(--transform-origin, top left); transition:opacity 180ms var(--ease-out), transform 180ms var(--ease-out); }
/* 4. 按下反馈 */
.btn:active{ transform:scale(.97); transition:transform 140ms var(--ease-out); }
/* 5. 减弱动效：保留不透明度，去掉位移与缩放 */
@media (prefers-reduced-motion:reduce){
  [data-enter]>*, dialog[open]{ animation:fade 200ms ease both; }
  @keyframes fade{ from{ opacity:0; } }
  .btn:active{ transform:none; }
}
```
- 命令面板、快捷键触发的面板：零动画。

**解剖**：Before 的动效在"装饰"——每个区块都在表演，所以没有一个被记住；`ease-in` 与 500ms 让界面显得迟钝；`scale(0)` 违反物理直觉（EK）。After 只保留一个编排时刻与回应用户动作的反馈（AFD）。

**验收**：开启系统"减弱动态效果"后无位移动画且无内容被隐藏；所有 UI 过渡 <300ms。

---

## 11. 长文排版层级（Read，原型 B）

**Before**：正文 16px `#888888` on `#F7F7F7`（3.3:1，不合格）；标题 18/20/22/24px 全部 700 且染品牌蓝；行宽铺满 1200px；段落之间 `<br><br>`。

**After**
```css
article{ max-width:68ch; margin-inline:auto; font:400 19px/1.65 "Source Serif 4", "Noto Serif SC", serif; color:#1A1A1A; } /* 17.4:1 on #FFF */
article h2{ font:600 1.75rem/1.15 "Schibsted Grotesk","Noto Sans SC",sans-serif; margin:2.5em 0 .6em; letter-spacing:-.01em; }
article h3{ font:600 1.35rem/1.25 "Schibsted Grotesk","Noto Sans SC",sans-serif; margin:2em 0 .5em; }
article p + p{ margin-top:1em; }
article figure{ margin-inline:calc(50% - min(45vw, 600px)); }  /* 图片跨出正文栏，两侧对称 */
```
- 一个模数（≈1.25–1.414）推出全部字号；字重只有 400/600；颜色只有墨色，层级靠尺寸与字重。
- 标题与下文的距离（0.5–0.6em）远小于与上文的距离（2–2.5em）：标题属于下文。

**解剖**：Before 的四个标题字号相差 2px，眼睛分不出层级；颜色被拿来补层级，结果全页都在"喊"。After 的陡峭比例与间距不对称让结构不言自明（TU、AU）。

**验收**：字号相邻级比 ≥1.2；正文对比 ≥7:1；行长 60–72ch。

---

## 12. 东方题材：青瓷茶器品牌（Persuade，原型 H）

**Before**：大红 `#C8102E` + 金色渐变；书法字体 h1"茗香千年"带金色描边与外发光；祥云纹满铺背景；水墨晕染分隔；龙纹剪影；"关于我们 ABOUT US"。

**After**
- 素材：只取**一个**来源——龙泉青釉（茶器本身的釉色）。底 `#DCD9C8`、墨 `#2E4740`（7.1:1）、表面 `#B6C8B9`（墨在其上 5.7:1）、点缀 `#417969`（对底 3.6:1，只用于 ≥24px 字与图形）。不加印章红——它不属于这件器物。
- 字：标题思源宋体 400，展示尺寸字距 +0.08em；正文思源黑体 17px / 1.85 / 0.03em。
- 构图：一只青瓷杯的产品照，单件、偏置在 7–12 栏，大面积留白；品牌名竖排 `writing-mode: vertical-rl` 贴左边线——全页唯一的破格。
- 区块之间只靠底色在 `#DCD9C8` 与 `#B6C8B9` 间整块切换，不用水墨晕染。
```css
.brand-title{ writing-mode:vertical-rl; font:400 clamp(2.5rem,4vw,4rem)/1.3 "Noto Serif SC",serif; letter-spacing:.08em; color:#2E4740; }
body{ background:#DCD9C8; color:#2E4740; font:400 17px/1.85 "Noto Sans SC",sans-serif; letter-spacing:.03em; }
```

**解剖**：Before 把"中国"当成皮肤——红金、祥云、龙、书法，可以套在任何中国品牌上（两阶类目反射第一阶失败）。After 的每个颜色都能指向茶器的釉面；竖排是中文自身的书写方向，不是装饰把戏（原型 H）。

**验收**：说得出色板来自哪件器物；删除全部纹样后版面仍成立；无金色、无渐变、无描边字。

---

## 13. 深色开发者工具（Operate，原型 C）

**Before**：`#000000` 底、`#FFFFFF` 字、霓虹青 `#00FFF0` 外发光按钮、紫色渐变描边卡片、毛玻璃面板叠毛玻璃面板、所有卡片同一个黑色大阴影。

**After**
- 色（夜与天蓝）：底 `#0A0D14`、表面 `#131824`、墨 `#E9EDF3`（16.5:1）、次要 `#8891A1`（对底 6.1:1，对表面 5.6:1）、强调 `#5AB9FC`（对底 9.1:1；按钮上用深色字 `#0A0D14`，9.1:1）。
- 高度用明度：底 → 表面 → 浮层逐级提亮，不用阴影；浮层只加 1px `rgba(255,255,255,.08)` 顶边。
- 毛玻璃只给一处：浮在可滚动代码区之上的顶部工具栏，`backdrop-filter: blur(12px)`，`prefers-reduced-transparency` 时改为不透明 `#131824`。卡片一律不透明。
- 强调色只出现在：主按钮、当前选中的文件、焦点环。日志级别（错误/警告）用语义色 + 图标 + 文字。

**解剖**：纯黑配纯白产生光晕，霓虹发光是"科技感"的廉价替身（TU、DT）。深色界面的高级感来自分层明度的精确与强调色的稀缺，不来自光效。

**验收**：灰度截图中三层表面可区分；强调色出现的位置 ≤3 类；`render_audit` 无纯黑/纯白正文。

---

## 速查：决策逻辑提炼

| Before 的冲动 | After 的问题 |
|---|---|
| "加个渐变更有活力" | 题材的哪种材料是这个颜色？没有就平涂。 |
| "三张卡片把功能列出来" | 这三件事真的一样重要吗？谁是主角？ |
| "高端 = 衬线 + 奶油 + 金" | 这个产品的材料和使用场景是什么颜色？ |
| "数据要显眼就做大卡片" | 读者扫一眼要得到哪个数字？其余能不能退成一行文字？ |
| "图表多几种颜色好区分" | 颜色在编码哪一个维度？主角是谁？ |
| "国风 = 红金祥云" | 哪一件器物、哪一段文脉？ |
| "加点动效更高级" | 这个动作回应了用户的什么操作？一天发生几次？ |
| "加点阴影有层次" | 它真的在更高的层吗？能不能用明度差表达？ |
