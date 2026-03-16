<p align="center">
  <img src="assets/logo.png" alt="OpenBook Logo" width="180" />
</p>

<h1 align="center">OpenBook</h1>

<p align="center">
  <strong>An open, non-commercial, schema-driven review platform built for AI Agents and humans.</strong><br>
  <strong>一个开放、非商业化、结构化驱动的评价平台，为 AI Agent 和普通人而生。</strong>
</p>

<p align="center">
  <em>Globally Connected, Locally Owned.</em><br>
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

> *Information should be equal. Reviews should be structured. Everyone deserves access to honest, high-quality, machine-readable community knowledge — without algorithms, ads, or gatekeepers.*
>
> *信息应当平等。评价应当结构化。每个人都应该能获取真实、高质量、机器可读的社区知识 —— 没有算法、没有广告、没有门槛。*

---

## Why OpenBook? | 为什么做 OpenBook？

Today's review platforms are broken. Yelp, Xiaohongshu (Little Red Book), and Google Reviews all share the same fundamental problems: recommendation algorithms bury honest voices, commercial interests distort rankings, and unstructured text makes it nearly impossible for AI Agents to extract precise, actionable information.

今天的评价平台已经坏了。大众点评、小红书、Google Reviews 都有同样的根本问题：推荐算法埋没真实声音，商业利益扭曲排名，非结构化的文本让 AI Agent 几乎无法提取精确、可操作的信息。

OpenBook takes a radically different approach:

OpenBook 采用了一种截然不同的方式：

| Traditional Platforms | OpenBook |
|---|---|
| Algorithms decide what you see | You query exactly what you need |
| Unstructured text, hard to parse | Schema-driven structured data |
| Centralized, one company controls all | Globally Connected, Locally Owned |
| Registration required | No registration, no accounts |
| Commercial, ad-driven | Non-commercial, community-driven |
| Humans fill forms | AI Agents collect data through conversation |

| 传统平台 | OpenBook |
|---|---|
| 算法决定你看什么 | 你精确查询你需要的 |
| 非结构化文本，难以解析 | Schema 驱动的结构化数据 |
| 中心化，一家公司控制一切 | 全球互联，社区自治 |
| 需要注册 | 无需注册、无需账号 |
| 商业化，广告驱动 | 非商业化，社区驱动 |
| 人类填表单 | AI Agent 通过对话收集数据 |

---

## Core Principles | 核心理念

### 1. Globally Connected, Locally Owned | 全球互联，社区自治

OpenBook is not a centralized platform — it is a **unified data network composed of self-governing communities**. Each community — whether a university, a city, or an interest group — has full editorial authority over its own content, while contributing value to the entire network.

OpenBook 不是一个中心化的平台，而是一个**由无数自治社区组成的统一数据网络**。每个社区——无论是一个大学、一个城市、还是一个兴趣群体——都拥有自己内容的完整审核权，同时为整个网络贡献价值。

Data is not locked in any platform. Information flows freely. Communities own their voice.

数据不被锁死在任何平台。信息自由流动。社区自己做主。

### 2. Information Equality | 信息平权

Every review is stored as a plain file in a public Git repository. No paywalls, no premium tiers, no "boost your listing" schemes. The data belongs to the community, not a corporation. Anyone can read it, any Agent can query it, and no algorithm decides who sees what.

每条评价都以纯文件存储在公开的 Git 仓库中。没有付费墙，没有高级会员，没有"推广你的商铺"。数据属于社区，不属于任何公司。任何人都能阅读，任何 Agent 都能查询，没有算法决定谁能看到什么。

### 3. Structured Data, Not Noise | 结构化数据，而非噪音

Every review category is defined by a YAML Schema that enforces quality. A housing review **must** include rent, noise level, renovation condition, and landlord rating. A restaurant review **must** include cuisine, price per person, and taste rating. This is not a BBS where people write "nice place lol" — this is structured, queryable, high-quality data.

每个评价分类都由 YAML Schema 定义并强制保证质量。一条租房评价**必须**包含租金、噪音水平、装修状况和房东评分。一条餐厅评价**必须**包含菜系、人均消费和口味评分。这不是一个人们写"不错哦哈哈"的论坛 —— 这是结构化的、可查询的、高质量的数据。

### 4. Agent-Native, Human-Friendly | Agent 原生，人类友好

OpenBook is designed from the ground up for AI Agents (OpenClaw, Manus, and any future Agent). The `SKILL.md` file teaches any Agent how to read schemas, collect data through natural conversation, validate entries, and perform precise structured queries. Ordinary users never touch Git, JSON, or YAML — they just talk to their Agent.

OpenBook 从底层就为 AI Agent（OpenClaw、Manus 以及任何未来的 Agent）设计。`SKILL.md` 文件教会任何 Agent 如何读取 Schema、通过自然对话收集数据、校验条目、执行精确的结构化查询。普通用户永远不需要接触 Git、JSON 或 YAML —— 他们只需要跟自己的 Agent 对话。

### 5. Non-Commercial Forever | 永远非商业化

OpenBook is and will always be non-commercial. No ads, no sponsored reviews, no data selling. The code is MIT licensed. The data is community-owned. This is a public good, not a business.

OpenBook 现在是、将来也永远是非商业化的。没有广告，没有赞助评价，没有数据出售。代码采用 MIT 许可证。数据归社区所有。这是一个公共产品，不是一门生意。

---

## Distributed Governance | 分布式治理

OpenBook uses a **"Unified Repository + Distributed Governance"** model. We do not recommend creating independent forks for each school or city, as this would create data silos. Instead, every community becomes a self-governing node within the unified OpenBook network.

OpenBook 采用**"统一仓库 + 分布式治理"**的模式。我们不推荐为每个学校或城市创建独立的 Fork，因为这会造成数据孤岛。相反，每个社区都成为 OpenBook 统一网络中的一个自治节点。

### How It Works | 工作模式

1. **Apply to join | 申请加入**: Open a discussion in [GitHub Discussions](../../discussions) and rally early contributors from your school or city.
2. **Get your own space | 获得专属空间**: The core team creates a dedicated data directory (e.g., `/data/mit/`) and a maintainer team (e.g., `@mit-maintainers`).
3. **Self-govern | 社区自治**: Through GitHub's `CODEOWNERS`, your maintainer team has full review and merge authority over your directory. Your turf, your rules.

```
# .github/CODEOWNERS

# MIT community owns their content
/data/mit/          @mit-maintainers

# Stanford community owns their content
/data/stanford/     @stanford-maintainers

# Seattle community owns their content
/data/seattle/      @seattle-maintainers
```

This way, your community maintains full autonomy while contributing to the global OpenBook data network. **No data silos. No central bottleneck. Maximum network effect.**

这样，你的社区既能保持高度自治，又能为整个 OpenBook 数据网络贡献价值。**没有数据孤岛。没有中央瓶颈。网络效应最大化。**

---

## How It Works | 工作原理

```
┌──────────────────────────────────────────────────────────────┐
│                     User (普通用户)                            │
│         "I want to review my apartment"                      │
│         "帮我找法拉盛好吃的火锅"                                │
└──────────────────┬───────────────────────────────────────────┘
                   │ Natural language conversation
                   ▼
┌──────────────────────────────────────────────────────────────┐
│                   AI Agent (OpenClaw / Manus)                │
│  1. Reads SKILL.md → understands how to operate OpenBook     │
│  2. Reads schemas/*.yml → knows what data to collect         │
│  3. Guides user through conversation → collects structured   │
│  4. Validates data → saves as JSON → commits to repo         │
│  5. Queries _index.json → returns precise results            │
└──────────────────┬───────────────────────────────────────────┘
                   │ Structured JSON read/write
                   ▼
┌──────────────────────────────────────────────────────────────┐
│                GitHub Repository (数据仓库)                    │
│  schemas/housing.yml    → defines what to collect            │
│  data/housing/*.json    → structured review data             │
│  _index.json            → searchable index                   │
│  SKILL.md               → Agent instruction manual           │
└──────────────────────────────────────────────────────────────┘
```

---

## Built-in Categories | 内置分类

| Category | Schema | Key Fields |
|---|---|---|
| Housing Reviews 租房评价 | `schemas/housing.yml` | rent, noise, light, renovation, landlord, amenities |
| Restaurant Reviews 餐厅评价 | `schemas/food.yml` | cuisine, price, taste, service, environment, must-try dishes |
| Job Interviews 求职面经 | `schemas/jobs.yml` | company, position, difficulty, result, salary, tips |

---

## Quick Start | 快速开始

### Option A: MCP Server via npm (Recommended | 推荐)

One command to run the OpenBook MCP Server. Works with Claude Desktop, Cursor, and any MCP-compatible client.

一行命令启动 OpenBook MCP Server。支持 Claude Desktop、Cursor 及任何 MCP 兼容客户端。

```bash
# Clone this repo first
git clone https://github.com/josephliver623/OpenBook.git
cd OpenBook

# Run with npx (no install needed)
npx openbook-mcp
```

Add to your MCP client config (e.g. `claude_desktop_config.json`):

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
<summary>Alternative: Python MCP Server</summary>

```bash
pip install "mcp[cli]" pyyaml
python mcp-server/openbook_mcp.py ./OpenBook
```

</details>

Then just talk to Claude: "帮我找纽约安静的一室一厅" or "I want to review my apartment".

### Option B: Agent Skills via ClawHub

OpenBook is published on [ClawHub](https://clawhub.ai/josephliver623/openbook) — the skill registry for AI Agents. Install with one command:

OpenBook 已发布到 [ClawHub](https://clawhub.ai/josephliver623/openbook) — AI Agent 的技能市场。一行命令安装：

```bash
clawhub install openbook
```

For Agent platforms that support Skills (Manus, OpenClaw, etc.), the Agent will automatically read `SKILL.md` and gain the ability to search and publish reviews.

对于支持 Skills 的 Agent 平台（Manus、OpenClaw 等），Agent 会自动读取 SKILL.md 并获得搜索和发布评价的能力。

Alternatively, clone this repo manually:

```bash
git clone https://github.com/josephliver623/OpenBook.git
```

### Option C: Join an Existing Community | 加入现有社区

Want to contribute to your school or city? Check if a community already exists in `data/`, or start a new one:

1. Open a discussion in [GitHub Discussions](../../discussions)
2. Rally 3+ contributors from your school/city
3. Get your own `data/{community}/` directory and maintainer team
4. Start contributing with full editorial autonomy

---

## Why Structured Data Beats Algorithms | 为什么结构化数据胜过推荐算法

When you search for an apartment on traditional platforms, you get a wall of text filtered by an opaque algorithm. You have to read through dozens of reviews to figure out if a place is quiet, if the landlord is responsive, if the rent is reasonable.

在传统平台上找房子时，你得到的是一堵被不透明算法过滤的文字墙。你必须读完几十条评价才能搞清楚一个地方安不安静、房东好不好、租金合不合理。

With OpenBook, your Agent can do this in one query:

而用 OpenBook，你的 Agent 一条查询就搞定：

```bash
# Find quiet apartments in East Village under $3000
jq '[.[] | select(._schema=="housing" and .neighborhood=="East Village" 
    and .noise_level<=2 and .rent_monthly<3000)]' _index.json
```

The result is instant, precise, and complete — because every review is structured data, not a blob of text that an LLM has to guess at.

结果是即时的、精确的、完整的 —— 因为每条评价都是结构化数据，而不是 LLM 需要猜测的一团文字。

---

## Signals: Real-time Atomic Updates | 信号：实时原子更新

**Reviews tell you what a place is like. Signals tell you what just changed.**

传统评价是一次性的快照。但现实世界每天都在变化——咖啡馆换了咖啡师、餐厅涨了价、公寓楼下开始施工。这些琐碎但关键的变化，正是 Agent 做决策时最需要的信息。

Traditional reviews are one-time snapshots. But the real world changes daily — a café gets a new barista, a restaurant raises prices, construction starts outside an apartment. These small but critical changes are exactly what Agents need for decision-making.

### What is a Signal? | 什么是 Signal？

A Signal is an **atomic, time-stamped observation** — a single fact about a change or discovery:

```
Review:  "这家咖啡馆整体不错，手冲水平高，环境安静" （写一次）
Signal:  "2026-03-10 换了新的耶加雪菲，偏果酸"      （随时追加）
Signal:  "2026-03-13 周四下午人很少，适合办公"        （随时追加）
Signal:  "2026-03-15 美式从 ¥28 涨到 ¥32"            （随时追加）
```

### Signal Types | 信号类型

| Type | 中文 | Example |
|------|------|---------|
| `price_change` | 价格变动 | "美式从 ¥28 涨到 ¥32" |
| `staff_change` | 人员变动 | "换了新咖啡师，拉花水平提升" |
| `menu_change` | 菜单变动 | "新增了燕麦拿铁" |
| `quality_change` | 品质变化 | "最近出品不太稳定" |
| `hours_change` | 营业时间 | "周末改为 10:00 开门" |
| `address_change` | 地址变更 | "搬到隔壁门面，门牌号变了" |
| `closure` | 关店 | "暂停营业装修中" |
| `opening` | 新开 | "愚园路新开了一家精品咖啡" |
| `tip` | 小贴士 | "周三下午有买一送一" |
| `warning` | 警告 | "卫生状况下降，注意" |
| `update` | 一般更新 | "WiFi 密码改了" |

### Why Signals Matter for Agents | 为什么 Signal 对 Agent 重要

```
Agent 查询: "上海愚园路附近有好的咖啡馆吗？"

传统方式: 返回 6 个月前的评价 → 可能已经过时
OpenBook: 返回评价 + 最近 30 天的 Signals → 实时准确

Agent 看到:
  Review: "Seesaw Coffee 手冲不错，4.5/5" (2025-12)
  Signal: "换了新咖啡师，拉花水平提升" (2026-03-10) ← 最新变化
  Signal: "美式涨价到 ¥32" (2026-03-15) ← 价格更新
```

Signals are the **heartbeat** of OpenBook — they keep data alive and current.
Signal 是 OpenBook 的**心跳** —— 让数据保持鲜活和准确。

### Contributing Signals | 贡献 Signal

Signals are designed to be ultra-low-friction. You can contribute a Signal in one sentence:

> "Seesaw 愚园路店换了新豆子，花香很重"

That's it. The system extracts the structured fields automatically.

---

## Add Custom Categories | 添加自定义分类

```bash
# Copy an existing schema as template
cp schemas/food.yml schemas/gym.yml

# Edit schemas/gym.yml to define your fields
# Create the data directory
mkdir data/gym
```

Schema fields support:

| Property | Description |
|---|---|
| `type` | Data type: `string`, `number`, `list`, `text`, `date` |
| `required` | Whether the field is mandatory |
| `agent_prompt` | The question the Agent asks the user |
| `enum` / `options` | Allowed values for constrained fields |
| `min` / `max` | Numeric range constraints |
| `labels` | Human-readable labels for enum values |

---

## The OpenBook Ecosystem | OpenBook 生态

Every community in OpenBook shares the same `SKILL.md` protocol and schema system. This means any Agent that understands OpenBook can operate across all communities:

每个 OpenBook 社区共享同一套 `SKILL.md` 协议和 Schema 系统。这意味着任何理解 OpenBook 的 Agent 都能跨社区操作：

```
OpenBook (unified repository)
    │
    ├── data/seattle/       (Seattle community — @seattle-maintainers)
    ├── data/nyc/           (NYC community — @nyc-maintainers)
    ├── data/mit/           (MIT community — @mit-maintainers)
    ├── data/stanford/      (Stanford community — @stanford-maintainers)
    ├── data/housing/       (Global housing reviews)
    ├── data/food/          (Global food reviews)
    ├── data/jobs/          (Global job interviews)
    └── data/signals/       (Real-time signals)
```

---

## Project Structure | 项目结构

```
├── SKILL.md                  # Agent instruction manual (top-level)
├── README.md                 # This file
├── schemas/                  # Category definitions (YAML Schema)
│   ├── housing.yml           # Housing review schema
│   ├── food.yml              # Restaurant review schema
│   └── jobs.yml              # Job interview schema
├── data/                     # Review & Signal data (Markdown files)
│   ├── housing/
│   ├── food/
│   ├── jobs/
│   └── signals/              # Real-time atomic signals
├── _index.json               # Global index (auto-generated)
├── assets/                   # Project assets
│   └── logo.png              # OpenBook logo
├── mcp-server/               # MCP Server for Claude/Cursor
│   ├── openbook_mcp.py       # Python MCP server
│   ├── npm-src/index.ts      # TypeScript MCP server (npm)
│   ├── npm-package.json      # npm package config
│   ├── requirements.txt      # Python dependencies
│   └── README.md             # MCP setup guide
├── skills/                   # Agent Skills
│   └── openbook/
│       └── SKILL.md          # Detailed skill for Agent platforms
├── scripts/
│   ├── build_index.py        # Index builder
│   └── validate.py           # Data validator
├── .github/
│   ├── CODEOWNERS            # Distributed governance rules
│   └── workflows/
│       └── on-push.yml       # CI: validate + rebuild index
└── LICENSE
```

---

## Contributing | 参与贡献

OpenBook is a community project. You can contribute by:

OpenBook 是一个社区项目。你可以通过以下方式参与贡献：

1. **Publishing reviews** — Share your honest experiences through your Agent
2. **Starting a community** — Rally contributors from your school or city and apply for your own space
3. **Becoming a maintainer** — Contribute 10+ reviewed entries, then apply to become a community maintainer
4. **Adding schemas** — Define new review categories
5. **Improving the codebase** — PRs welcome for scripts, CI, and SKILL.md
6. **Spreading the word** — Tell others about information equality

---

## License

MIT — Use it, fork it, build on it. Free forever.

---

<p align="center">
  <img src="assets/logo.png" alt="OpenBook" width="80" /><br>
  <strong>OpenBook</strong> — Globally Connected, Locally Owned.<br>
  <strong>OpenBook</strong> — 全球互联，社区自治。<br><br>
  <a href="https://openbook.now">Website</a> · <a href="https://www.npmjs.com/package/openbook-mcp">npm</a> · <a href="https://github.com/josephliver623/OpenBook">GitHub</a>
</p>
