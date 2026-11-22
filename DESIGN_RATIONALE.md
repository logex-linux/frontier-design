# DESIGN_RATIONALE：这套 Skill 留下了什么、砍掉了什么、怎么验货

本文件不在常驻上下文里，只在追溯来源、复核取舍或做 A/B 测试时读。

## 0. 包结构

```
frontier-design/
  SKILL.md                                   常驻：宪章 8 条 + 红线 + 设计到自检闭环 + 路由（83 行）
  DESIGN_RATIONALE.md                        本文件
  references/
    aesthetic_archetypes.md                  8 个泾渭分明的原型 + 跨原型冲突裁决表
    typography_color_and_grid.md             字体/中文排版/色彩/网格/圆角阴影/动效参数 + Token 骨架
    domain_playbooks.md                      落地页、Dashboard、图表与示意图、海报印刷 SVG、幻灯片、视频、移动端、品牌
    visual_critique_and_polish.md            九遍目检、打分与封顶、症状→修复表、压测内容、完整套路目录
    contrastive_visual_anchors.md            13 组 Before/After/解剖/验收
  scripts/
    render_audit.mjs                         零依赖：本机 Chrome 无头渲染、多宽度截图、DOM 视觉体检
    slop_scan.py                             标准库：源码套路扫描 + contrast 子命令
```
安装：把 `frontier-design/` 整个目录放进 Agent 的 skills 目录（如 `~/.claude/skills/`）。它与用户已有的 `design/` Skill 并存，名称不冲突，未改动 `design/` 的任何文件。

## 1. 出处代码

| 代码 | 来源（owner/repo/path） | 档位 |
|---|---|---|
| AFD | anthropics/skills / skills/frontend-design/SKILL.md | S |
| ACD | anthropics/skills / skills/canvas-design/SKILL.md | A |
| TS | Leonxlnx/taste-skill / skills/taste-skill/{SKILL.md, references/layout-v4.md, cards.md, backgrounds.md, system.md, copy-tells.md, gate.md, library/type.json, library/palettes.json} | S |
| TU | bergside/typeui.sh / skills/fundamentals/{ui,typography,spacing,accessibility}-principles.md | S |
| DT | h3nryprod01/design-taste / SKILL.md, reference/{anti-slop.md, core-rules.md, pre-flight.md} | A |
| EK | adriannoes/awesome-agentic-ai / cursor-claude-codex/skills/emilkowalski/skills/{review-animations/STANDARDS.md, apple-design/SKILL.md, emil-design-eng/SKILL.md, break-ui/CATALOG.md} | S |
| LF | larashero3-dotcom/lieflat-charts / SKILL.md, mono-tokens.js, templates/reports/*.zh.html | S |
| DD | adriannoes/awesome-agentic-ai / cursor-claude-codex/skills/diagram-design/{SKILL.md, references/style-guide.md} | S |
| DM | csthink/dashmotion / skills/dashmotion/SKILL.md | S |
| VD | digitalsamba/claude-code-video-toolkit / .claude/skills/video-design/{SKILL.md, critique.md} | S |
| MC | yanliudesign/mono-color-skill / SKILL.md, design-system/{typography,compositions}.json | A |
| PP | K-Dense-AI/claude-scientific-skills / skills/pptx-posters/references/poster_design_principles.md | A |
| AU | Ashutos1997/claude-design-auditor-skill / SKILL.md, references/{corner-radius,elevation}.md | A |
| UX | aicodedecode/awesome-muse-skills / skills-imported/ui-ux-pro-max/references/{pro-rules,quick-reference}.md | A |
| DR | design-references/SKILL.md（本地 CC0） | A |
| PLM | AbubakrChan/product-launch-motion / SKILL.md | A |
| CBF | nutllwhy/code-brand-film / SKILL.md | A |
| GM | gongnyang/awesome-ai-motion / references/decision-tables.md | A |
| XP | xiaopu-ai/web-design / SKILL.md（仅取"中文页面专属要求"与"性能红线"） | A |
| UD | 用户现有 `design/`：capabilities/{typography,color,composition,interaction,vector-imagery}.md、capabilities/color-sop/0{1..6}-*.md、references/typography-cjk.md、rules/0{1..8}-*.md、usage/*.md | 用户资产 |
| 【补强】 | 语料未覆盖、由本次锻造补入的规则（见 §4），均已在正文就地标注 | 无 |

## 2. 保留的最高杠杆基因（按"改变输出的力度"排序）

1. **两遍法 + 反默认自审**（AFD）：先写 4–6 个具名 hex、字体角色、ASCII 线框、原则，再问"同类 brief 我是不是也会这么做"，是就改。这是把模型从"默认审美"拽出来的第一杠杆，写进 SKILL.md §3 第 2 步。
2. **五大 AI 默认簇 + 两阶类目反射**（AFD、DT）：把"像 AI"从感觉变成可匹配的清单，并用第二阶反射堵住"反套路的套路"（如"不要 SaaS 奶油 → 编辑出版风"）。
3. **结构即信息**（AFD）：编号、eyebrow、分割线、边框必须编码内容。一条规则同时消灭 01/02/03、满屏小标签、装饰发丝线三类套路。
4. **可计算的硬阈值**（TU）：对比度公式（4.499 判负）、嵌套圆角 `inner = outer − padding`、`heroPaddingTop = nav + 96`、Dashboard 标题 28/24 上限、组内 < 组外、4pt 刻度、标题尺寸 ≠ 语义级别。
5. **一屏一区块与等边线**（TS）：区块高度 1 或 2 屏、首屏只有 Hero、单一 `.wrap`；把"节奏感"变成能截图验证的几何。限定在官网原型 D 与落地页手册中使用，不当作通用法则。
6. **卡片"几乎不存在"与两层封顶**（TS）：card > 有光的画板 > 真实片段；片段最小宽度表；一片段一强调。
7. **色彩预算与锁定**（TS、DT）：界面 90–95% 中性、强调 <3%/≤10%、全页一个强调色、一个主题、一个圆角族；奶油+黄铜禁区色族的精确 hex 与 7 个替代色族。
8. **动效频率表与强曲线**（EK）：100+ 次/天不动；`cubic-bezier(0.23,1,0.32,1)`；<300ms；从 0.95 而非 0；可打断；减弱动效"更少更柔而非全无"。
9. **明度即数据、不断轴、结论式标题、交互三问**（LF）：数据可视化的整套"诚实契约"。
10. **单/双色印刷的构图四步**（MC）：一个物主导、字物碰撞、纸穿过图像、一个手工动作；焦点事件 + 释放区；空白 25–55%；墨版角色比例。
11. **联系表评审 + 加权评分 + 封顶**（VD）：把"总监的眼睛"变成可重复的流程，并用封顶规则防止给自己打高分。
12. **用户自有资产**（UD）：中西混排的字体栈逻辑与断行警告、中国传统色/瓷色（附实算后的可用配对）、灰阶构图三候选、`passed / failed / not_run` 验收记录、八站流程的"回到对应站修正"思想（压缩进 SKILL.md §3）。

## 3. 果断砍掉的噪音（及理由）

| 被砍内容 | 来源 | 理由 |
|---|---|---|
| "首页 3 个卧槽爆点 + 1 个巧思"、L2+ 必须 6 类签名动效、Aurora/Silk 背景、SpotlightCard、3D 倾斜卡、关键字渐变流动 | XP | 与"把大胆花在一处"正面冲突，正是要拦截的模板化"炫技"；只保留其中文排版要求与性能红线 |
| 反复强调"meticulously crafted / master-level"等工艺形容词 | ACD | 零信息增益；保留其可执行部分："精修不加东西""不溢出、不意外重叠" |
| 设计思维五阶段、"UI ≠ UX"、约束类别科普等长篇原理 | TU | 不改变任何布局/排版/配色决策 |
| "accent borders 增加视觉趣味"、"柔和渐变打破单调" | TU §6.5–6.6 | 与侧边彩条、装饰渐变红线冲突；裁决为禁用 |
| 发牌脚本（deal.mjs/start.mjs）、kit 类名、地址格式等站点工具专属规则 | TS | 依赖其私有资产，不可迁移；保留其背后的几何与原则 |
| 67 个注册风格（含 `colorful = #3B82F6 + #8B5CF6`） | bergside/awesome-design-skills | 模板生成、品味低，且多款自带紫蓝禁区色 |
| 模板目录锁定（L1–L20/F1–F17 编号）、Inter 作为图表唯一字体、全大写加字距的来源行 | LF | 编号依赖其模板库；后两者与收敛字体/全大写红线冲突，图表来源行改为句首大写 |
| picsum 占位图兜底、"用 47.2% 这种不规整假数字显得真实"、跑马灯/轮播替代长列表 | DT core-rules | 与"不编造具体细节"（TS 第二代 tell）和"不用轮播"冲突；改为"示例数据显式标注、缺图列清单" |
| "Dark mode by default" | DT | 与 TS"深色页只给科技类"冲突；裁决为按载体模式决定（Operate 双主题，Persuade 锁定单主题并写场景理由） |
| 导航/工具栏默认毛玻璃 | EK apple-design | 裁决为仅限原型 C 中"浮在滚动内容之上的 chrome"，卡片永不毛玻璃 |
| 网格渐变（mesh gradient）生成流程 | 9929y/genai-mesh-gradient | 渐变当装饰正是红线 |
| 科学幻灯片的"现代配色、强层级、充足留白" | K-Dense scientific-slides | 纯形容词 |
| 图表 SVG 最小字 6.5/5.5（viewBox 单位） | LF | 单位不随渲染尺寸成立；改为"渲染后 ≥11px" |
| Figma MCP 审计流程、组件描述模板、token 导出脚本 | natdexterra、AU 的 Figma 部分 | 属于宿主工具操作，不属于视觉判断；Skill 边界中写明"只给视觉规格" |

## 4. 补盲（【补强】清单）

- **中文排版**：`lang` 与汉字字形；"西文在前、中文在后"的字体栈及弯引号陷阱的 `unicode-range` 解法；中文无斜体与着重号；全角标点、`line-break: strict`、`text-spacing-trim`、`text-autospace` 的渐进增强写法；中文行高 1.7–1.9、字距 0.02–0.05em、行长 28–40 字、标题不负字距；竖排作为原生书写方向的唯一破格；破折号与间隔号的语法用法 vs 装饰用法（英文 em dash 禁令不误伤中文）；免费可商用中文字体清单。
- **中文 AI 套路**：空心动词清单、"让 XX 更简单"式 h1、中英双语装饰小标题、红金国潮皮肤、科技蓝紫渐变+粒子。
- **对比度实算与语料缺陷修正**：lieflat 原 muted `#8F8E88` 在纸色上仅 2.86:1；石材蓝图色族次要文字在表面色上 4.36:1；石墨与橙色族的白字按钮 3.36:1；赤陶墨 `#C65F38` 在承印物上 3.94:1；汝窑天青、永乐甜白、郎窑红组内无可排正文的配对；示例图表的浅灰条 `#B0AFA9` 对纸 1.9:1（改为 `#85847E`，3.3:1）。所有写进正文的色值配对都附了实算比值。
- **紫色检测改用 OKLCH 色相 270–330°**：钴蓝（约 264°）不误报，Tailwind indigo-500 `#6366F1`（277°）被捕获；HSL 色相会把它算成 239° 而漏掉。
- **可执行的自检闭环**：两支零依赖脚本；可点目标 <24px 按 WCAG 2.5.8 判 FAIL；手机输入框 ≥16px；作品评分新增"首屏看不出卖什么 → 清晰 ≤5"的封顶；断言式幻灯片标题；信息图阅读路径。

## 5. 流派仲裁要点

| 冲突 | 裁决 | 依据 |
|---|---|---|
| 系统字体默认（TU）vs 禁用系统观感（TS） | 按载体模式：Persuade/Experience 禁收敛集默认；Operate/Read 可用，须写理由 | DT 的模式路由 |
| 衬线 | 仅原型 B、H 与 F 的文学角色默认可用 | DT 衬线纪律 + 编辑出版范式 |
| 卡片圆角 16（DT）vs 20（TS）vs 24（LF） | 卡片 ≤20（soft 族上限）；24 只给 ≥400px 容器；≥32 全禁 | AU 尺寸比例表 |
| hover 动效：TS 要求 vs AFD 视为 AI 味 | 只有真实可点击元素回应指针，位移 ≤2px | 两者交集 |
| 标题→正文 32px（TU）vs 卡片标题→正文 8px（TS） | 以"标题与下文距离 < 与上文距离"为不变量，给分角色数值 | TU 邻近原则 |
| 英文 em dash 全禁 vs 中文破折号 | 英文与装饰用法全禁；中文语法用法按 GB/T 15834 保留 | 【补强】 |

## 6. Stage 4 自审五问（交付前结论）

1. **SKILL.md 是否精干且每条都改变输出？** 83 行；宪章 8 条每条附可执行验收；红线每条写明"替代动作"；删去了所有无法证伪的形容词句。
2. **流派之间是否打架？** 通用公理只留跨流派成立的 8 条；风格专属规则全部隔离在原型卡片中；6 处已知冲突在 `aesthetic_archetypes.md` 末尾与本文件 §5 给出裁决。
3. **反 AI 味清单是否具体到能拦截？** 颜色给到 hex 与 OKLCH 色相区间，组件给到 CSS 属性阈值，文案给到词表；两支脚本在构造的"坏页面"上分别报出 6 个 FAIL + 39 个 WARN（slop_scan）与每个宽度 6 个 FAIL（render_audit），在构造的"好页面"上 0 FAIL / 0 WARN。
4. **是否具备可执行的自检环节？** 设计到自检六步 + 九遍目检 + 加权评分与封顶 + 机检 + 报告格式；无渲染环境时要求标注 `not_run`。
5. **参数与对照案例是否克制？** 13 组对照中所有色值配对均实算；After 方案全部遵守"一个锚点、一个强调色、一个圆角族"，并在两处主动降级了自己的强调色用途（锅具品牌的火色、青瓷品牌的点缀色）。

## 7. A/B 盲测验货 Prompt（加载 Skill 前后各跑一次，隐藏来源后评分）

评分方法：两份产出各跑 `render_audit.mjs` 与 `slop_scan.py` 记 FAIL/WARN 数；再由不知来源的评审按 `visual_critique_and_polish.md` §2 打分（设计 40 / 清晰 30 / 想法 20 / 内容 10，含封顶）。

**Prompt A（中文 B2B 官网，Persuade）**
> 为一家做"工程项目现场巡检"的中国 SaaS 公司设计官网首页，输出单文件 HTML。客户：建筑总包企业的项目经理与安全总监。产品功能：手机拍照打卡巡检、隐患自动派单与整改闭环、每周安全周报。客户没有提供品牌色、字体和照片。首页需要：首屏、三项核心功能、客户证言、价格方案、页脚。要求桌面与手机都好看，"不要那种 AI 做的网站感"。

验货要点：未加载时常见紫蓝渐变或"科技蓝 + 赋能数字化转型"、三张等宽图标卡、伪造的"服务 1000+ 企业"、中英双语小标题；加载后应看到：h1 写品类+买家、首屏有真实的巡检/整改界面片段或明确的素材槽位、证言与客户名不编造（以槽位代替）、中文行高 ≥1.7、一个从工地材料推导的强调色（如安全橙并实算对比后限制用途）。

**Prompt B（高密度工具界面，Operate）**
> 为冷链物流调度中心设计一个"温控异常监控" Dashboard，单文件 HTML，含浅色与深色两套主题。内容：今日在途车辆、温度越界告警列表（车牌、线路、当前温度、阈值、持续时长、处理人、状态）、某一辆车过去 6 小时的温度曲线、处理告警的抽屉面板。调度员一天要处理上百条告警。

验货要点：未加载时常见渐变 KPI 卡、图标装彩色圆、营销级大标题、告警只靠红色、抽屉 500ms ease-in、深色模式纯黑底 + 霓虹；加载后应看到：标题 ≤28px、等宽数字右对齐、状态 = 图标 + 文字 + 颜色、曲线标题写结论并标出阈值线、键盘可处理告警且高频操作无动画、深色以表面明度分层。

**Prompt C（东方题材印刷物，Experience）**
> 为一个名为"日常青瓷：宋元龙泉窑小展"的博物馆小型特展设计主视觉：一张 3:4 竖版海报（SVG）和同系列的 1080×1350 社交媒体图。展期 2026 年 3 月 1 日至 5 月 31 日，地点：城南博物馆二层 3 号厅，免费参观，需预约。

验货要点：未加载时常见红金配色、祥云/水墨晕染、书法大标题加金色描边、所有元素居中、日期地点同一字号；加载后应看到：色板只取自龙泉青釉并注明屏幕近似、一个焦点事件（单件器物大裁切或竖排展名）+ 明显的释放区、事实信息贴一条边线、展名与日期的字阶跃迁 ≥5×、两张图同一套系统但构图不同、无渐变无描边字。
