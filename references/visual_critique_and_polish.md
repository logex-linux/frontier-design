# 设计总监视觉验收（Visual Critique & Polish）

第一版是草稿，存在的意义是被挑刺。〔DT〕只评判画面里真实存在的东西；证据 > 感觉；每轮只修排名前三的问题，最多三轮；某一轮找不到"细节级以上"的问题即停。〔VD〕

## 1. 验收流程

1. **渲染**：网页截 1440×900、768×1024、390×844 三张首屏 + 1440 整页；每个区块/幻灯片/镜头取一张稳定帧排成联系表；海报看 25% 缩略与 100% 原尺寸。〔TS〕〔VD〕〔UD〕
2. **机检**：`node <skill-dir>/scripts/render_audit.mjs <file|url> --out shots/` 与 `python3 <skill-dir>/scripts/slop_scan.py <src>`。机检回答"能量化的问题"，不回答"好不好看"。
3. **九遍目检**（每遍只看一件事，不混在一起看）〔VD critique〕：
   - **P1 一秒**：扫一眼移开视线，你看到了什么？必须只有一个答案（一个颜色故事、一个数字、一个形状）。"好多卡片"= 没有主角。
   - **P2 眯眼与灰度**：模糊 4px 或缩到 25%：第一落点 = Design Read 声明的锚点；转灰度：层级仍成立，相邻大面积色块明度可区分。
   - **P3 边线**：数一数不同的左边缘（全页文字块），≤3 为佳；左右内容边线是否全页一致；有没有东西"只出血到一侧"。
   - **P4 字**：数字号种类（≤8，Operate ≤6）、字重（≤4）、家族（≤2+mono）；找三行标题、孤字、被截断的字；最小字号。
   - **P5 色**：在每一屏指出强调色——只应落在一个东西上；找"没选过的颜色"（底色的淡染、浑浊的混色、默认蓝）；正文对比。
   - **P6 同质化**：给每个区块的布局起一个词（陈述 / 分栏 / 网格 / 图表 / 满版图……），同一个词连续出现 3 次 = 模板在露馅。
   - **P7 套路**：对照 §7 目录逐条匹配。
   - **P8 手机**：390 截图与 1/3 缩略：每个标题和数字仍可读；图表的要点不看标签也能看出。
   - **P9 实质**：每个区块是否真的承载了它声称的内容，数字是否有来源；等着文案填充的空画面是"洞"，不是"留白"。
4. **打分**（§2）→ **修前三个问题**，顺序：不真实的内容 → 结构与色彩分配 → 层级 → 字 → 细节。〔VD〕
5. **收尾**：Chanel 规则——摘掉一件配饰；只精修已有元素，不新增图形。〔AFD〕〔ACD〕

## 2. 打分与封顶

**作品评分**（1–10）：`overall = 0.4·设计（构图、字、色） + 0.3·清晰（在可见时间内、在手机上能读懂每块的要点） + 0.2·想法（有一个属于此题材的视觉想法并贯彻） + 0.1·内容（文字与数字具体且真实）`。真正获奖级作品约 7.5–8；给自己的作品打出 9，就以陌生人身份重打。〔VD〕

**封顶规则（覆盖算术）**：
- 任一画面出现三行标题、一排相同方块、渐变或发光、静止投影、成批的 eyebrow 小标签（超过 ⌈区块数/3⌉ 个）：overall ≤6.5。
- 颜色变化没有对应叙事转折（每屏换一个底色）：设计分 ≤6.5。
- 用户需要读的文字低于最小字号或对比不达标：清晰分 ≤6。
- 屏幕上的数字没有数据支撑：内容分 ≤4，且必须最先修。
- 首屏/封面看不出卖什么或说什么：清晰分 ≤5。【补强】
- 机检有任何 FAIL 未处理：不得交付。

**代码/界面审计的严重度**（用于评审他人或既有界面）〔AU〕：

| 级别 | 定义 | 扣分 |
|---|---|---|
| 🚫 Blocker | 法律级无障碍失败（正文对比 <4.5:1、无可访问名称的控件、键盘陷阱） | −12 |
| 🔴 Critical | 破坏可用性或无障碍（缺焦点态、触控 <44px、无错误态、占位内容上线） | −8 |
| 🟡 Warning | 削弱设计（刻度外间距、字阶过平、硬编码颜色、套路命中） | −4 |
| 🟢 Tip | 打磨级 | −1 |

`Score = 100 − 12·B − 8·C − 4·W − 1·T`，报告里写出算式。只凭截图审计时，依赖精确数值的 Warning/Tip 扣分减半，并标"中等置信度"。〔AU〕

## 3. 维度清单（检查 → 方法 → 不过时的修复动作）

| # | 维度 | 检查 | 方法 | 修复动作 |
|---|---|---|---|---|
| 1 | 焦点与层级 | 一个主角；主次之间对比大、同级之间对比小 | P1、P2；数"高对比 + 饱和 + 加粗"同时出现的元素 | 不把主角调得更响，而是把竞争者调安静：降饱和、减字重、缩面积〔TU〕 |
| 2 | 对齐与边线 | 文字块落在栏线；混排字号按基线对齐 | 叠 12 栏参考线；DevTools 量 `left` | 合并到一条左线；故意破格只保留一处〔TU〕 |
| 3 | 间距与分组 | ≥3 档；组内<组外；无刻度外数值 | 关闭 border/背景看分组；`render_audit` 间距盘点 | 先放大组外间距，再收紧组内；删掉被间距取代的分割线〔TU〕 |
| 4 | 字 | 一套模数；相邻级 ≥1.2×；无三行标题/孤字 | 字号盘点；1440/390 两档看断行 | 改文案长度或手动断行，不缩字号硬塞〔TS〕 |
| 5 | 色与对比 | 一个强调色；中性占 90–95%；所有文字配对实算 | `slop_scan contrast`；`render_audit` 对比表 | 小字换深前景，品牌色留给大面积〔UD〕 |
| 6 | 表面与深度 | 一族圆角；嵌套圆角公式；阴影=高度；不叠线+大模糊 | 盘点 `border-radius`/`box-shadow` 种类 | 删除装饰阴影；改用明度差；内圆角 = 外圆角 − 内边距〔TU〕〔AU〕 |
| 7 | 组件与状态 | 8 态齐全；相邻按钮同高；按钮不换行；输入框可见 | 键盘 Tab 一遍；逐态截图 | 补齐缺失态；从按钮高度派生输入框高度〔TU〕〔DT〕 |
| 8 | 图像与图标 | 真实素材；一个图标族；无 emoji 图标；无图下说明 | 看图片来源与 `alt`；数图标风格 | 换真图或留明确的素材槽位并在报告中列出〔DT〕〔TS〕 |
| 9 | 动效 | 每个动画一句话说出目的；<300ms；无 `ease-in`；减弱动效可用 | 2–5× 慢放；系统开启减弱动效 | 删掉装饰动画；换 `--ease-out`；hover 加媒体查询〔EK〕 |
| 10 | 文案 | 按钮 = 动词+宾语；同一动作同名；错误说清怎么修 | 读出声；对照 §7.3 | 改写为用户语言；删掉过程话术（"下面你会看到"）〔AFD〕〔TS〕 |
| 11 | 响应式 | 320 无横向滚动；无重叠、无被固定栏遮挡 | `render_audit` 溢出/重叠项；390 截图 | 先改结构（堆叠、换行），最后才改字号〔UD〕 |
| 12 | 无障碍 | 焦点可见；颜色非唯一线索；触控 ≥44；可缩放 | 键盘走查；灰度截图 | `:focus-visible` 统一焦点环；状态加图标/文字〔TU〕 |
| 13 | 中文排版 | `lang`；行高 ≥1.7；无负字距/伪斜体；标点全角且避头尾 | 看长段落与标题；检查引号字形 | 按 `typography_color_and_grid.md` §2 修正 |
| 14 | 数据图 | 结论式标题；不断轴；一个强调；颜色不唯一 | 遮住图例还能读吗 | 直接标注；删图例与网格线；明度即数据〔LF〕 |
| 15 | 系统一致性 | 一种按钮对、卡片、链接样式、圆角族、主题 | `render_audit` 盘点（家族/字号/圆角/阴影/颜色计数） | 合并近似值到 token；删掉第二种样式〔TS〕 |
| 16 | 性能 | LCP<2.5s、CLS<0.1；图片有尺寸；WebGL ≤1 | Lighthouse / Performance 面板 | 预留 `aspect-ratio`；子集字体；离屏暂停〔DT〕〔XP〕 |

## 4. 症状 → 诊断 → 修复（把"感觉不对"翻译成动作）

| 听到/看到的症状 | 最常见的根因 | 修复动作（按顺序试） |
|---|---|---|
| "看着廉价" | 阴影/渐变/发光太多；圆角过大且统一；字重过重；颜色过饱和 | 删全部静止阴影与渐变 → 圆角按尺寸比例 → 正文降到 400 → 强调色降饱和到 <80% 〔DT〕〔AU〕 |
| "很 AI / 模板感" | 结构可替换：任何产品放进来都成立；eyebrow+标题+三卡片的区块模板；收敛字体与配色 | 跑两阶类目反射 → 换掉一个区块的结构为题材特有的（真实界面片段、题材自身的结构图）→ 换字体与色族 〔DT〕〔UD〕 |
| "太挤" | 组内组外间距相同；正文行长过长；装饰占位 | 先删同义信息 → 拉开组外间距 → 收窄行长 → 最后才动字号 〔UD composition〕 |
| "太空 / 太稀" | 区块内容不足却独占一屏；一个元素居中漂在空白里 | 并入上一区块，或补上它缺的那张真实图片；顶部对齐而非垂直居中 〔TS layout-v4〕 |
| "什么都在喊" | 多个元素同时用了高对比、边框、饱和色、粗体 | 指定唯一主角，其余降一档；颜色只留给主操作 〔UD refine〕 |
| "平 / 没重点" | 字阶比例 <1.2；所有块同尺寸；没有锚点 | 换更陡的比例；让一个元素占据 ≥2 倍面积；锚点写进 Design Read 〔AU〕 |
| "两栏像两页" | 两栏不共享基线、外边距、层级 | 统一顶部对齐与首行基线；共用同一套字阶 〔UD〕 |
| "不够高级" | 通常不是缺装饰，而是间距不准、对齐松、字体普通 | 校准边线 → 收敛到一族字 → 删掉一件配饰；**不要**加渐变/玻璃/金色 〔AFD〕 |
| "不够大胆" | 大胆被平均分摊在每个区块 | 把全部大胆集中到一处（一个巨字、一张满版图、一个真实交互），其余更安静 〔AFD〕 |
| "图文打架" | 文字压在照片繁忙处；两者争主角 | 先定谁承担主信息；文字移到照片安静的暗部或照片外的实底上；不用渐变遮罩 〔TS〕〔UD〕 |
| "深色模式发闷/发脏" | 用阴影表达高度；纯黑底；文字纯白；强调色未调 | 表面明度分级 `#121212→#2C2C2C`；字 `#E6E6E6`；强调色提亮一档 〔AU〕〔TU〕 |
| "动效显得慢、飘" | `ease-in` 或默认 `ease`；时长 >300ms；从 0 缩放；所有元素同时动 | 换强 ease-out；150–250ms；从 0.95 起；只动一个东西 〔EK〕 |
| "小图标糊、不统一" | 多个图标族；描边不一；非整数像素 | 统一一个族与 1.5–2px 描边；按 16/24 实际尺寸检查 〔UX〕〔UD〕 |
| "表格难扫" | 数字左对齐；比例字体；每行双描边 | 数字右对齐 + tabular-nums；只留一种分隔 〔UX〕〔DT〕 |
| "Hero 弱" | 画面是氛围（色块、光斑），不是真东西；口号式标题 | 换成产品/场所/作品本身；h1 改写为"品类 + 买家"的朴素断言 〔TS〕 |
| "中文看着别扭" | 无 `lang`；西文字体渲染中文标点；行高 1.5；负字距 | `lang="zh-CN"`；引号字形修正；行高 1.75；字距 0.02em 〔XP〕【补强】 |

## 5. 极端内容压测（交付前必塞一遍）〔EK break-ui〕【补强：中文条目】

| 类别 | 测试值 | 容易坏的地方 |
|---|---|---|
| 姓名 | `Aleksandra Wiśniewska-Kowalczyk`、`J`、`王秀英`、`欧阳娜娜娜娜`、`👩🏽‍💻 Priya` | 单行溢出、首字母头像逻辑、emoji 切半 |
| 不可断字串 | `bartholomew.fitzgerald@northwind-industries-holdings.example.com`、长 URL、UUID、`Benachrichtigungseinstellungen` | 撑破行，需要 `overflow-wrap: anywhere` |
| 中文长句 | 45 字无标点的产品名；中英数混排 `iPhone 16 Pro Max 256GB 深空黑色`；全角括号与引号连续出现 | 行尾标点、引号字形、行长 |
| 数字 | `0`、`1`、`1284`、`1000000`、`-42.5`、`0.1+0.2`、`142%`、`null` | 复数、千分位、负号与颜色、溢出进度条、原样显示 null |
| 时间 | 刚刚、12 天前、跨时区的 `23:30-08:00`、`1970-01-01` | 相对时间阈值、时区换日 |
| 集合 | 0 项、1 项、恰好一页、一页+1、1000+ 项、某项是其他项 10 倍大 | 空状态、"1 of 1"、分页、网格被拉高 |
| 媒体 | 404 头像、4000×200 全景图、透明 PNG 黑 logo 放深色底、慢加载图 | 破图标、变形、隐形、布局偏移 |
| 状态 | 加载、API 报错、部分数据、所有枚举状态同屏、无权限 | 骨架与终态不一致、原始错误信息外露、徽章宽度不齐 |
| 文案翻译 | 法/德文 +30% 长度；按钮文字翻倍 | 按钮换行（禁止）、标签溢出 |

## 6. 输出格式

**评审代码时**：一个 Markdown 表格，每行一个问题。〔EK〕〔DT〕

| Before | After | Why |
|---|---|---|
| `transition: all 300ms` | `transition: transform 200ms var(--ease-out)` | 指明属性；UI <300ms |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | 现实中没有东西从无中出现 |
| `.card{border:1px solid #eee; box-shadow:0 10px 30px rgba(0,0,0,.1)}` | `.card{border:1px solid var(--line)}` | 线与大模糊阴影二选一（幽灵卡） |
| `color:#999` on `#FFFFFF` | `color:#6B6B6B` | 2.8:1 → 5.3:1 |

**每轮记录**：
```
ROUND n：<交付物>
一秒看到：…
锚点是否首先被看到：是/否（证据：缩略图）
区块布局词：hero=… / s2=… / s3=…
机检：render_audit FAIL n / WARN n；slop_scan FAIL n / WARN n
评分：设计 _ / 清晰 _ / 想法 _ / 内容 _ → 总分 _._（封顶：…）
前三问题（最显眼在前，各附位置与修法）：1… 2… 3…
```

**最终交付说明**：Design Read 一行 → token 摘要（色/字/网格）→ 检查结果逐项 `passed / failed / not_run`（附截图路径或测量值）→ 有意偏离红线之处与理由 → 假设的事实与示例数据 → 客户需要补的真实素材清单。〔UD review〕〔TS〕

## 7. 套路目录（P7 逐条匹配；brief 明确要求者除外）

### 7.1 视觉生产测试中的高频 tell〔DT anti-slop〕〔AFD〕
- 首屏：版本号/BETA/邀请制胶囊；`Brand · No. 01` 式副 eyebrow；滚动提示（"Scroll ↓"、鼠标滚轮动画）；Hero 底部装饰字带；城市+时间+天气条。
- 编号与小标签：区块编号 eyebrow（`001 · Capabilities`）；图片或磁贴上的 `01 / 4` 分页；"Stage 1 / Phase 01 / Step 1"式通用步骤名（直接用动作名："安装""配置""上线"）；每屏一个全大写 eyebrow（数量 > ⌈区块数/3⌉ 即失败）。
- 分隔与点：一行元信息超过 1 个 `·`；列表/导航/徽章前的装饰性彩色圆点（只允许真实状态，且每区块 ≤1 处）。
- 字形把戏：`<br>` 断开后斜体的标题后半句；拉丁文旋转 90° 竖排；装饰十字线/发丝网格；标题中单词换色。
- 假预览：div 拼的任务列表/终端/Dashboard；假截图里的 `v0.6.2-rc.1`、`last sync 4s ago`。
- 卡片与表面：同尺寸图标卡阵列；幽灵卡（1px 线 + ≥16px 模糊阴影）；≥32px 圆角卡片；侧边彩条；卡中卡；毛玻璃卡。
- 图片：图上叠标签胶囊（`Plate · Brand`）；装饰性摄影署名（`Field study no. 12`）；占位图服务（picsum/placeholder）当终稿；同一张图用两次。
- 列表与比较：每行上下双描边的规格表；带灰色满轨道的评分条；>5 项仍用默认项目符号列表。
- 区块头：左大标题 + 右上角飘一小段说明；连续 3 个 Z 字分栏；两个意图相同的 CTA。
- 颜色：紫/薰衣草；紫蓝渐变；渐变文字；霓虹外发光；奶油+黄铜+咖啡黑；近黑+单一荧光色。

### 7.2 英文文案 tell〔TS copy-tells〕
- **禁用词**（每个都在冒充一个事实）：delve, tapestry, testament to, realm, embark, beacon, multifaceted, paradigm, myriad, plethora, meticulous, intricate, interplay, garner, boasts, elevate, unlock, unleash, empower, harness, supercharge, seamless, effortless, cutting-edge, revolutionary, transformative, holistic, next-level, world-class, game-changer, state-of-the-art, bespoke, synergy, leverage, reimagine, powerful, robust, nestled, unparalleled。行业字面义保留（攀岩 harness、定制西装 bespoke）。
- **套话**：In today's fast-paced world / Unlock the power of / The future of X is here / Say goodbye to / Whether you're A or B / Join thousands of / Trusted by teams worldwide / Imagine a world where / Look no further / one-stop shop / X made simple / at your fingertips / in just a few clicks / It's not just X, it's Y / Here's the thing / Let that sink in；"X theater"。
- **残留（最强单一 tell）**："Certainly!"、"I hope this helps"、`[Company Name]`、lorem ipsum、`{{token}}`、页面上渲染出的 Markdown `**` 或 `##`、遗留的 `[NEED]`。
- **句形**：-ing 尾巴（", ensuring a smooth start"）；自问自答与冒号揭晓；"serves as / stands as / plays a key role"代替 is/has；正文感叹号；emoji 项目符号；每个链接后的箭头；死隐喻（landscape、ecosystem、journey、"where X meets Y"）。
- **第二代 tell（看起来像好文案）**：千篇一律的"温暖/机智/谦逊"腔；**编造的具体细节**（"早上 6:12，从 9 号房的窗口"、"批次 No. 047"）；数据条（3–4 个数字配一词标签）；双碎片标题（"十二间房。三种住法。"）；对照框架（"新鲜不是口号"）及其替身（rather than / instead of / without the）；自夸美德词（honest、calm、quiet、thoughtful、intentional——页面从不自称诚实）；干巴巴的收尾俏皮话；"Since [year]"；"3x faster / 10,000+ teams"；过程话术（"This section shows"、"Below, you'll find"）；过时年份。
- **过度矫正**（禁令催生的新套路，同样要避免）：不用破折号 → 逗号粘连句；不用 not X but Y → 满篇 rather than；不吹嘘 → 满篇平静美德词；避免三连 → 一切成对；要具体 → 编数字；要短促 → 碎片鼓点；要有力收尾 → 每段一个俏皮话。每条禁令旁都必须有一个正向动作。
- **不是 tell（别误伤）**：语法正确；朴素的 is/has；客户自己的文案与固定标题格式；确有三件事时的三项列举；有意重复的口号。

### 7.3 中文文案 tell【补强】
- **空心动词与大词**：赋能、助力、打造、构建、引领、颠覆、重塑、深耕、聚焦、驱动、无缝、一站式、全方位、全链路、极致、匠心、生态闭环、降本增效、数字化转型、智慧 XX（非行业字面义时）。
- **套话**：在这个快速变化的时代 / 让 XX 更简单 / 开启 XX 新篇章 / 不止于 XX / 为 XX 而生 / 只为更好的你 / 重新定义 XX / 一切，从 XX 开始。
- **句形**：四字格排比堆叠（"高效、安全、稳定、可靠"）；"不是……而是……"对照框架滥用；每段末尾的升华句；中英双语装饰小标题；感叹号与 emoji 项目符号。
- **伪精确**：没有来源的"效率提升 300%""服务 10000+ 企业"。
- **修法**：用"谁 + 做什么 + 得到什么具体结果"重写；动词换成能拍成画面的动作（"导出""对账""预约"）；数字必须有出处，否则删掉或标为示例。

## 8. 机检工具与无脚本时的替代

- `node <skill-dir>/scripts/render_audit.mjs page.html --widths 1440,768,390 --out shots/`：本地起静态服务（不走 `file://`），用本机 Chrome 无头渲染；输出每个宽度的整页截图与 `report.json`。检查项：横向溢出（按精确的 CSS 宽度渲染，不让手机模式缩放掩盖溢出）、元素越出视口、文字被裁切、<12px 文字、可点目标 <24px（FAIL，WCAG 2.5.8）与手机宽度 <44px（WARN）、文字对比（按实际背景逐层合成；背景是图片/渐变时标为 info"需人工看最不利像素"）、固定页眉遮挡首个 h1 或贴得过近、h1 数量与标题跳级、缺 `alt` 与破图、缺 viewport meta 或禁止缩放、减弱动效下仍有位移动画（记录 `@keyframes` 名）、样式盘点（声明的字体家族/字号/字重/圆角/阴影/颜色种类）、套路命中（渐变文字、紫色及含紫渐变、幽灵卡、侧边彩条、大圆角卡、毛玻璃、全大写小标签计数、英文 em dash、`transition: all`、中文负字距/伪斜体/行高不足/行过长、emoji 图标、收敛字体）。退出码 1 = 有 FAIL。
- `python3 <skill-dir>/scripts/slop_scan.py src/`：源码级扫描（HTML/CSS/JS/JSX/TSX/Vue/Svelte/MD）：`transition: all`、`scale(0)`、`ease-in`、条纹渐变、`feTurbulence`、收敛字体、紫色 hex 与 Tailwind 紫系类名、纯黑白、侧边彩条、≥32px 圆角、幽灵卡、全大写+字距、禁用缩放、无减弱动效分支、残留占位、中英文套话。`python3 <skill-dir>/scripts/slop_scan.py contrast "#FG" "#BG"` 计算对比度。
- 无 Node/Chrome 时：在浏览器 DevTools Console 粘贴下面的盘点片段，至少拿到系统一致性数据：
  ```js
  (()=>{const c={ff:new Set,fs:new Set,fw:new Set,br:new Set,bs:new Set,col:new Set};
  for(const el of document.querySelectorAll('body *')){const s=getComputedStyle(el);
  if(el.childNodes.length&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())){
  c.ff.add(s.fontFamily.split(',')[0]);c.fs.add(s.fontSize);c.fw.add(s.fontWeight);c.col.add(s.color);}
  if(s.borderRadius!=='0px')c.br.add(s.borderRadius);if(s.boxShadow!=='none')c.bs.add(s.boxShadow);}
  console.table(Object.fromEntries(Object.entries(c).map(([k,v])=>[k,{count:v.size,values:[...v].slice(0,12).join(' | ')}])));
  console.log('horizontal overflow:',document.documentElement.scrollWidth>innerWidth);})();
  ```
- 机检判为误报：在报告中写明理由后豁免；**不得**为通过检查而修改检测脚本、给元素加 `aria-hidden` 或嗅探无头浏览器。〔TS gate〕
