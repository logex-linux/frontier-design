# frontier-design

一套用于**视觉设计产出与冷血验收**的 Agent Skill。

它不教"保持简洁、注意留白、现代高级"这类说了等于没说的话，只做一件事：**让模型在动笔前锁定一个方向，按可计算的阈值去做，再用截图和脚本证明自己做对了**，并精准拦下紫蓝渐变、三张等宽图标卡、渐变文字、满屏小标签、div 假截图、"赋能数字化转型"这类 AI 视觉默认值。

## 它解决什么

大模型做出来的页面通常没有明显错误，但有五个固定病灶：

- **方向是默认值，不是选择**：奶油底配赤陶色、近黑底配荧光绿、紫蓝渐变，换任何行业都长一样；
- **层级靠盒子撑**：内容被切成同尺寸圆角卡片，阴影、边框、渐变一起上，没有主角；
- **结构在装饰**：每个区块头顶一个全大写小标签，不是序列也标 01/02/03，分割线画满屏；
- **动效在表演**：每个区块滚动淡入，每张卡 hover 都动，弹窗从 `scale(0)` 用 `ease-in` 慢慢弹出来；
- **没人验收**：对比度靠目测，手机上横向溢出，中文没设 `lang`、行高 1.5、标题负字距。

本 Skill 把这些病灶全部翻译成**能量、能数、能跑脚本检查的规则**，而不是审美愿望。

## 结构（渐进式披露）

```
SKILL.md                                  常驻主文件（约 9 KB）
├─ 视觉宪章 8 条                           每条附"不过即未完成"的验收方法
├─ 反 AI 廉价感红线                        命中即重写结构，每条附替代做法
├─ Design-to-Verify 六步闭环               Read → 锁 token → 构建 → 截图机检 → 精修 → 报告
└─ 按需加载路由表

references/                               按需挂载，不要全量加载
├─ aesthetic_archetypes.md        22 KB   8 个互相隔离的美学原型 + 跨原型冲突裁决表
├─ typography_color_and_grid.md   28 KB   字阶行高、中西混排、色彩预算、实算色族与传统色、网格圆角阴影、动效曲线、Token 骨架
├─ domain_playbooks.md            25 KB   落地页、Dashboard/表单/AI 界面、图表与示意图、海报印刷 SVG、幻灯片、视频、移动端、品牌
├─ visual_critique_and_polish.md  22 KB   九遍目检、加权评分与封顶、症状→修复表、极端内容压测、中英文套路词表
└─ contrastive_visual_anchors.md  24 KB   13 组 Before / After / 解剖 / 验收

scripts/
├─ render_audit.mjs                       零依赖：用本机 Chrome 多宽度渲染、截图、做 DOM 视觉体检
└─ slop_scan.py                           只用标准库：源码套路扫描 + contrast 子命令

DESIGN_RATIONALE.md                       留了什么、砍了什么、流派仲裁、出处代码表、3 个 A/B 盲测 Prompt
```

主文件常驻只有 9 KB，其余按当前任务加载：定方向读原型词典，调参数读字色网格，做具体载体读实战手册，验收读评审清单，审美跑偏读正反对照。

## 八个原型，不准串味

| 原型 | 一句话 | 最适合 |
|---|---|---|
| A 瑞士国际主义 | 网格就是内容的秩序 | 机构、报告、B2B 官网 |
| B 编辑出版 | 读者愿意花 30 秒 | 长文、出版、文化机构 |
| C 精工工具 | 工具消失在任务里 | Dashboard、开发者工具、后台 |
| D 实物官网 | 每一屏都给看真东西 | 软件、硬件、实体产品、服务的官网 |
| E 有机安静 | 照片与留白主导，字在耳语 | 餐饮、手作、民宿、健康 |
| F 单/双色印刷 | 纸 + 一两种油墨 + 字与物的碰撞 | 海报、zine、文化公告 |
| G 先锋平面 | 字就是建筑 | 宣言、展览、音乐、发布主视觉 |
| H 东方器物 | 一种器物、一段文脉、一张纸 | 茶、陶瓷、文博、传统工艺 |

衬线、毛玻璃、深色页面、hover 动效、发丝线、大圆角这六个争议点，在原型词典末尾逐条裁决。

## 几条样例规则

规则必须能被验证，不是愿望。对比一下：

> ❌ 配色要和谐、有高级感。
>
> ✅ 界面 90–95% 中性；唯一强调色只给主操作、当前状态、被讲述的数据，Persuade 页面其余位置 <3% 屏幕面积。所有文字配对实算对比度，`4.499:1` 判不合格。

> ❌ 卡片要精致。
>
> ✅ 卡片"几乎不存在"：高一级底色 + 墨色 8–14% 的 1px 线 + 32/28/24px 内边距，静止无模糊阴影。内圆角 = 外圆角 − 内边距（20/8 → 12）。`1px 线 + ≥16px 模糊阴影` 叠用是幽灵卡，禁止。

> ❌ 动画要流畅。
>
> ✅ 一天触发 100 次以上的操作不加动画。进出用 `cubic-bezier(0.23, 1, 0.32, 1)`，UI 过渡 <300ms，永不 `ease-in`，从 `scale(0.95)` 而不是 `scale(0)` 出现。减弱动效时保留透明度变化，去掉位移。

> ❌ 中文排版要舒服。
>
> ✅ `<html lang="zh-CN">`；字体栈西文在前、中文在后；正文行高 1.7–1.9、字距 0.02–0.05em、每行 28–40 字；中文标题不负字距、不伪斜体；破折号只在语法需要处使用，不作"标题——副标题"式装饰。

> ❌ 图表要美观。
>
> ✅ 标题写结论不写图型（"华东在第三季度反超华南"，不是"月度销售额柱状图"）；条形图不断轴；明度即数据，最重要的最深；颜色超过 6 类退回灰阶加直接标注。

## 安装

```bash
git clone https://github.com/logex-linux/frontier-design ~/.claude/skills/frontier-design
```

其他 Agent 放进各自的 skills 目录即可。Skill 由 `SKILL.md` 的 frontmatter 触发：新建、改版、精修、评审任何会被人看见的界面或平面产物，或用户说"太像 AI / 模板感 / 不高级"时。

## 自检脚本

```bash
# 1440 / 768 / 390 三个宽度渲染、截图、体检；有 FAIL 时退出码为 1
node scripts/render_audit.mjs path/to/index.html --out shots

# 源码套路扫描
python3 scripts/slop_scan.py src/

# 算对比度
python3 scripts/slop_scan.py contrast "#5D6B72" "#ECF0F2"
# #5D6B72 on #ECF0F2: 4.80:1  AA body 4.5:pass  AA large/UI 3.0:pass  AAA body 7.0:FAIL
```

`render_audit.mjs` 需要 Node 22+ 和本机的 Chrome / Chromium / Edge（也会自动找 Playwright 缓存里的 Chromium），不装任何 npm 包。它按精确的 CSS 宽度渲染，检查横向溢出、文字裁切、小于 12px 的字、小于 24px 的可点目标（WCAG 2.5.8）、逐层合成背景后的文字对比度、固定页眉压住首屏标题、减弱动效下仍在位移的动画、字体/字号/圆角/阴影种类是否过多，以及渐变文字、紫色、幽灵卡、侧边彩条、大圆角卡、中文负字距等套路。

在一个故意写坏的测试页上，`slop_scan` 报 6 FAIL / 39 WARN，`render_audit` 每个宽度报 6 FAIL；在一个按本 Skill 写的中文页面上，两者都是 0 FAIL / 0 WARN。脚本只回答能量化的问题，截图仍要人（或能看图的模型）按评审清单看一遍。

## A/B 验货

`DESIGN_RATIONALE.md` 第 7 节给了 3 个高难度 Prompt（中文 B2B 官网、冷链调度 Dashboard、龙泉青瓷展海报与社交图），每个都写明了未加载 Skill 时通常会出现什么、加载后应该看到什么。建议加载前后各跑一次，隐藏来源后用脚本计数 + 评审清单打分。

## 来源与许可

本 Skill 是对一批公开设计类 Skill 的消化、仲裁与改写，没有复制它们的源码与模板；规则均为重新组织的中文表述，沿用的词表、色值、阈值等数据在正文里用出处代码标注（如〔TS〕〔TU〕〔AFD〕），代码与 `owner/repo/path` 的对照表见 `DESIGN_RATIONALE.md` 第 1 节。主要来源包括 Leonxlnx/taste-skill、bergside/typeui.sh、anthropics/skills（frontend-design、canvas-design，Apache-2.0）、h3nryprod01/design-taste、emilkowalski 系列动效规范、larashero3-dotcom/lieflat-charts、yanliudesign/mono-color-skill、digitalsamba/claude-code-video-toolkit 等。各来源的许可以其原仓库为准；其中 lieflat-charts 对商业使用另有授权说明，若你的用途涉及其模板或代码，请直接查阅原仓库。标【补强】的条目为本库新增。

本库原创的文字与脚本以 [MIT](LICENSE) 许可发布。
