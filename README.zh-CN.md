[English](./README.md) | [简体中文](./README.zh-CN.md)

<p align="center">
  <img src="assets/logo.png" alt="OpenBook Logo" width="180" />
</p>

<h1 align="center">OpenBook</h1>

<p align="center">
  <strong>一个开放、非商业化、结构化驱动的评价平台，为 AI Agent 和普通人而生。</strong>
</p>

<p align="center">
  <em>全球互联，社区自治。</em>
</p>

<p align="center">
  <a href="https://openbook.now"><img src="https://img.shields.io/badge/Website-openbook.now-blue" alt="Website" /></a>
  <a href="https://www.npmjs.com/package/openbook-mcp"><img src="https://img.shields.io/npm/v/openbook-mcp?label=openbook-mcp&color=coral" alt="npm" /></a>
  <a href="https://github.com/josephliver623/OpenBook"><img src="https://img.shields.io/github/stars/josephliver623/OpenBook?style=social" alt="GitHub Stars" /></a>
  <a href="https://github.com/josephliver623/OpenBook/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License" /></a>
  <a href="https://clawhub.ai/josephliver623/openbook"><img src="https://img.shields.io/badge/ClawHub-openbook-orange" alt="ClawHub" /></a>
</p>

---

> *信息应当平等。评价应当结构化。每个人都应该能获取真实、高质量、机器可读的社区知识 —— 没有算法、没有广告、没有门槛。*

---

## 我们在解决什么问题

**一句话：在今天的匿名社会，坏事的成本太低了。**

在熟人社会里，声誉是无形的约束。但在几百万人的城市里，陌生人之间缺乏信任，让房东、雇主、商家可以轻易作恶并逃脱惩罚。法律维权成本高，舆论热度只有三天。

OpenBook 的答案不是另一个曝光平台，而是为陌生人社会重建声誉基础设施。

我们无法改变法律，但可以**让行为信息变得持久、可搜索、不可篡改**。当一个人的负面记录可以被轻易查到，作恶的预期收益就会大幅降低。

为了确保信息的可信度，我们引入了**证据哈希 (Evidence Hash)**。用户无需上传隐私聊天记录或合同，只需提交文件的 SHA-256 哈希值。这个哈希值将被永久记录在区块链上，任何人都可以独立验证证据的真实性和时间戳，同时原始文件保留在用户手中，保护了隐私。

这就是 OpenBook 的核心：**一个基于可验证证据的、去中心化的声誉系统。**

---

## 为什么做 OpenBook？

今天的评价平台已经坏了。大众点评、小红书、Google Reviews 都有同样的根本问题：推荐算法埋没真实声音，商业利益扭曲排名，非结构化的文本让 AI Agent 几乎无法提取精确、可操作的信息。

OpenBook 采用了一种截然不同的方式：

| 传统平台 | OpenBook |
|---|---|
| 算法决定你看什么 | 你精确查询你需要的 |
| 非结构化文本，难以解析 | Schema 驱动的结构化数据 |
| 中心化，一家公司控制一切 | 全球互联，社区自治 |
| 需要注册 | 无需注册、无需账号 |
| 商业化，广告驱动 | 非商业化，社区驱动 |
| 人类填表单 | AI Agent 通过对话收集数据 |

---

## 核心理念

### 1. 全球互联，社区自治

OpenBook 不是一个中心化的平台，而是一个**由无数自治社区组成的统一数据网络**。每个社区——无论是一个大学、一个城市、还是一个兴趣群体——都拥有自己内容的完整审核权，同时为整个网络贡献价值。

数据不被锁死在任何平台。信息自由流动。社区自己做主。

### 2. 信息平权

每条评价都以纯文件存储在公开的 Git 仓库中。没有付费墙，没有高级会员，没有"推广你的商铺"。数据属于社区，不属于任何公司。任何人都能阅读，任何 Agent 都能查询，没有算法决定谁能看到什么。

### 3. 结构化数据，而非噪音

每个评价分类都由 YAML Schema 定义并强制保证质量。一条租房评价**必须**包含租金、噪音水平、装修状况和房东评分。一条餐厅评价**必须**包含菜系、人均消费和口味评分。这不是一个人们写"不错哦哈哈"的论坛 —— 这是结构化的、可查询的、高质量的数据。

### 4. Agent 原生，人类友好

OpenBook 从底层就为 AI Agent（OpenClaw、Manus 以及任何未来的 Agent）设计。`SKILL.md` 文件教会任何 Agent 如何读取 Schema、通过自然对话收集数据、校验条目、执行精确的结构化查询。普通用户永远不需要接触 Git、JSON 或 YAML —— 他们只需要跟自己的 Agent 对话。

### 5. 永远非商业化

OpenBook 现在是、将来也永远是非商业化的。没有广告，没有赞助评价，没有数据出售。代码采用 MIT 许可证。数据归社区所有。这是一个公共产品，不是一门生意。

---

## 分布式治理

OpenBook 采用**"统一仓库 + 分布式治理"**的模式。我们不推荐为每个学校或城市创建独立的 Fork，因为这会造成数据孤岛。相反，每个社区都成为 OpenBook 统一网络中的一个自治节点。

### 工作模式

1. **申请加入**: 在 [GitHub Discussions](../../discussions) 发起讨论，召集你所在学校或城市的早期贡献者。
2. **获得专属空间**: 核心团队会为你创建专属的数据目录（例如 `/data/mit/`）和维护者团队（例如 `@mit-maintainers`）。
3. **社区自治**: 通过 GitHub 的 `CODEOWNERS` 功能，你的维护者团队将拥有该目录下所有内容的完整审核和合并权限。你的地盘你做主。

```
# .github/CODEOWNERS

# MIT 社区拥有其内容的管理权
/data/mit/          @mit-maintainers

# 斯坦福社区拥有其内容的管理权
/data/stanford/     @stanford-maintainers

# 西雅图社区拥有其内容的管理权
/data/seattle/      @seattle-maintainers
```

这样，你的社区既能保持高度自治，又能为整个 OpenBook 数据网络贡献价值。**没有数据孤岛。没有中央瓶颈。网络效应最大化。**

---

## 核心概念

### Signal: 带时间戳的观察

一个 Signal 是关于一个地点、一个人或一个事件的单一、结构化的观察。它是 OpenBook 中的基本数据单元。每个 Signal 都是一个带有 YAML frontmatter 的 Markdown 文件，包含评级、位置和其他相关字段等结构化数据。

### Entity: 人、地点和组织的档案

一个 Entity 是一个聚合了与单个人（例如房东）、组织（例如公司）或地点相关的多个 Signal 的档案。这使我们能够建立一个关于行为和声誉的纵向历史。例如，所有与特定房东相关的 Signal 都链接到他们的 Entity 档案，从而创建一个可验证的记录。

### Evidence Hash: 可验证的证据

为了增强 Signal 的可信度，特别是对于像房东扣押金这样的敏感声明，我们引入了证据哈希的概念。用户无需上传敏感文件（如聊天截图或合同），而是可以提供证据文件的加密哈希（例如 SHA-256）。这个哈希被公开存储。

---

## 工作原理

```
┌──────────────────────────────────────────────────────────────┐
│                     User (普通用户)                            │
│         "I want to review my apartment"                      │
│         "帮我找法拉盛好吃的火锅"                                │
└──────────────────┬───────────────────────────────────────────┘
                   │ 自然语言对话
                   ▼
┌──────────────────────────────────────────────────────────────┐
│                   AI Agent (OpenClaw / Manus)                │
│  1. 读取 SKILL.md → 理解如何操作 OpenBook                      │
│  2. 读取 schemas/*.yml → 知道要收集什么数据                    │
│  3. 通过对话引导用户 → 收集结构化数据                          │
│  4. 校验数据 → 保存为 JSON → 提交到仓库                       │
│  5. 查询 _index.json → 返回精确结果                            │
└──────────────────┬───────────────────────────────────────────┘
                   │ 结构化 JSON 读写
                   ▼
┌──────────────────────────────────────────────────────────────┐
│                GitHub Repository (数据仓库)                    │
│  schemas/housing.yml    → 定义要收集的内容                     │
│  data/housing/*.json    → 结构化评价数据                       │
│  _index.json            → 可搜索的索引                         │
│  SKILL.md               → Agent 使用说明书                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 内置分类

| 分类 | Schema | 关键字段 |
|---|---|---|
| 租房评价 | `schemas/housing.yml` | 租金, 噪音, 采光, 装修, 房东, 配套设施 |
| 餐厅评价 | `schemas/food.yml` | 菜系, 人均, 口味, 服务, 环境, 必点菜 |
| 求职面经 | `schemas/jobs.yml` | 公司, 职位, 难度, 结果, 薪资, 技巧 |

---

## 快速开始

### 方式 A: 通过 npm 运行 MCP Server (推荐)

一行命令启动 OpenBook MCP Server。支持 Claude Desktop、Cursor 及任何 MCP 兼容客户端。

```bash
# 首先克隆本仓库
git clone https://github.com/josephliver623/OpenBook.git
cd OpenBook

# 使用 npx 运行 (无需安装)
npx openbook-mcp
```

添加到你的 MCP 客户端配置 (例如 `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "openbook": {
      "command": "npx",
      "args": ["-y", "openbook-mcp", "./OpenBook"]
    }
  }
}
```

<details>
<summary>备选方案: Python MCP Server</summary>

```bash
pip install "mcp[cli]" pyyaml
python mcp-server/openbook_mcp.py ./OpenBook
```

</details>

然后直接和 Claude 对话: "帮我找纽约安静的一室一厅"。

### 方式 B: 通过 ClawHub 使用 Agent Skills

OpenBook 已发布到 [ClawHub](https://clawhub.ai/josephliver623/openbook) — AI Agent 的技能市场。一行命令安装：

```bash
clawhub install openbook
```

对于支持 Skills 的 Agent 平台（Manus、OpenClaw 等），Agent 会自动读取 SKILL.md 并获得搜索和发布评价的能力。

或者，手动克隆本仓库：

```bash
git clone https://github.com/josephliver623/OpenBook.git
```

### 方式 C: 加入现有社区

想为你所在的学校或城市做贡献吗？看看 `data/` 目录下是否已有对应社区，或者发起一个新的：

1. 在 [GitHub Discussions](../../discussions) 发起一个讨论
2. 召集 3 名以上来自你的学校/城市的贡献者
3. 获得你自己的 `data/{community}/` 目录和维护者团队
4. 开始在完全自治下贡献内容

---

## 为什么结构化数据胜过推荐算法

在传统平台上找房子时，你得到的是一堵被不透明算法过滤的文字墙。你必须读完几十条评价才能搞清楚一个地方安不安静、房东好不好、租金合不合理。

而用 OpenBook，你的 Agent 一条查询就搞定：

```bash
# 查找东村 $3000 以下的安静公寓
jq '[.[] | select(._schema=="housing" and .neighborhood=="East Village" 
    and .noise_level<=2 and .rent_monthly<3000)]' _index.json
```

结果是即时的、精确的、完整的 —— 因为每条评价都是结构化数据，而不是 LLM 需要猜测的一团文字。

---

## 信号：实时原子更新

**评价告诉你一个地方怎么样。信号告诉你那里刚刚发生了什么变化。**

传统评价是一次性的快照。但现实世界每天都在变化——咖啡馆换了咖啡师、餐厅涨了价、公寓楼下开始施工。这些琐碎但关键的变化，正是 Agent 做决策时最需要的信息。

### 什么是 Signal？

一个 Signal 是一个**原子的、带时间戳的观察** —— 一个关于变化或发现的单一事实：

```
评价:  "这家咖啡馆整体不错，手冲水平高，环境安静" （写一次）
Signal:  "2026-03-10 换了新的耶加雪菲，偏果酸"      （随时追加）
Signal:  "2026-03-13 周四下午人很少，适合办公"        （随时追加）
Signal:  "2026-03-15 美式从 ¥28 涨到 ¥32"            （随时追加）
```

### 信号类型

| 类型 | 示例 |
|------|------|
| `price_change` | "美式从 ¥28 涨到 ¥32" |
| `staff_change` | "换了新咖啡师，拉花水平提升" |
| `menu_change` | "新增了燕麦拿铁" |
| `quality_change` | "最近出品不太稳定" |
| `hours_change` | "周末改为 10:00 开门" |
| `address_change` | "搬到隔壁门面，门牌号变了" |
| `closure` | "暂停营业装修中" |
| `opening` | "愚园路新开了一家精品咖啡" |
| `tip` | "周三下午有买一送一" |
| `warning` | "卫生状况下降，注意" |
| `update` | "WiFi 密码改了" |

### 为什么 Signal 对 Agent 重要

```
Agent 查询: "上海愚园路附近有好的咖啡馆吗？"

传统方式: 返回 6 个月前的评价 → 可能已经过时
OpenBook: 返回评价 + 最近 30 天的 Signals → 实时准确

Agent 看到:
  Review: "Seesaw Coffee 手冲不错，4.5/5" (2025-12)
  Signal: "换了新咖啡师，拉花水平提升" (2026-03-10) ← 最新变化
  Signal: "美式涨价到 ¥32" (2026-03-15) ← 价格更新
```

Signal 是 OpenBook 的**心跳** —— 让数据保持鲜活和准确。

### 贡献 Signal

Signal 的设计旨在实现超低门槛的贡献。你只需一句话就能贡献一个 Signal：

> "Seesaw 愚园路店换了新豆子，花香很重"

就这样。系统会自动提取结构化字段。

---

## 添加自定义分类

```bash
# 复制一个现有 schema 作为模板
cp schemas/food.yml schemas/gym.yml

# 编辑 schemas/gym.yml 来定义你的字段
# 创建数据目录
mkdir data/gym
```

Schema 字段支持:

| 属性 | 描述 |
|---|---|
| `type` | 数据类型: `string`, `number`, `list`, `text`, `date` |
| `required` | 字段是否必填 |
| `agent_prompt` | Agent 向用户提问的问题 |
| `enum` / `options` | 约束字段的允许值 |
| `min` / `max` | 数值范围约束 |
| `labels` | 枚举值的人类可读标签 |

---

## OpenBook 生态

每个 OpenBook 社区共享同一套 `SKILL.md` 协议和 Schema 系统。这意味着任何理解 OpenBook 的 Agent 都能跨社区操作：

```
OpenBook (统一仓库)
    │
    ├── data/seattle/       (西雅图社区 — @seattle-maintainers)
    ├── data/nyc/           (纽约社区 — @nyc-maintainers)
    ├── data/mit/           (MIT 社区 — @mit-maintainers)
    ├── data/stanford/      (斯坦福社区 — @stanford-maintainers)
    ├── data/housing/       (全球租房评价)
    ├── data/food/          (全球美食评价)
    ├── data/jobs/          (全球求职面经)
    └── data/signals/       (实时信号)
```

---

## 项目结构

```
├── SKILL.md                  # Agent 使用说明书 (顶层)
├── README.md                 # 本文件
├── schemas/                  # 分类定义 (YAML Schema)
│   ├── housing.yml           # 租房评价 schema
│   ├── food.yml              # 餐厅评价 schema
│   └── jobs.yml              # 求职面经 schema
├── data/                     # 评价和信号数据 (Markdown 文件)
│   ├── housing/
│   ├── food/
│   ├── jobs/
│   └── signals/              # 实时原子信号
├── _index.json               # 全局索引 (自动生成)
├── assets/                   # 项目资产
│   └── logo.png              # OpenBook logo
├── mcp-server/               # 用于 Claude/Cursor 的 MCP Server
│   ├── openbook_mcp.py       # Python MCP server
│   ├── npm-src/index.ts      # TypeScript MCP server (npm)
│   ├── npm-package.json      # npm 包配置
│   ├── requirements.txt      # Python 依赖
│   └── README.md             # MCP 设置指南
├── skills/                   # Agent Skills
│   └── openbook/
│       └── SKILL.md          # 用于 Agent 平台的详细 skill
├── scripts/
│   ├── build_index.py        # 索引构建器
│   └── validate.py           # 数据校验器
├── .github/
│   ├── CODEOWNERS            # 分布式治理规则
│   └── workflows/
│       └── on-push.yml       # CI: 校验 + 重建索引
└── LICENSE
```

---

## 参与贡献

OpenBook 是一个社区项目。你可以通过以下方式参与贡献：

1. **发布评价** — 通过你的 Agent 分享你真实的体验
2. **发起一个社区** — 召集你所在学校或城市的贡献者，申请你自己的空间
3. **成为维护者** — 贡献 10 条以上经过审核的条目，然后申请成为社区维护者
4. **添加 schema** — 定义新的评价分类
5. **改进代码库** — 欢迎为脚本、CI 和 SKILL.md 提交 PR
6. **传播理念** — 告诉其他人关于信息平等的理念

---

## 许可证

MIT — 使用它、复刻它、基于它构建。永远免费。

---

<p align="center">
  <img src="assets/logo.png" alt="OpenBook" width="80" /><br>
  <strong>OpenBook</strong> — 全球互联，社区自治。<br><br>
  <a href="https://openbook.now">网站</a> · <a href="https://www.npmjs.com/package/openbook-mcp">npm</a> · <a href="https://github.com/josephliver623/OpenBook">GitHub</a>
</p>
