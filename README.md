# OpenBook

**An open, non-commercial, schema-driven review platform built for AI Agents and humans.**

**一个开放、非商业化、结构化驱动的评价平台，为 AI Agent 和普通人而生。**

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
| Centralized, one company controls all | Decentralized, everyone owns their instance |
| Registration required | No registration, no accounts |
| Commercial, ad-driven | Non-commercial, community-driven |
| Humans fill forms | AI Agents collect data through conversation |

| 传统平台 | OpenBook |
|---|---|
| 算法决定你看什么 | 你精确查询你需要的 |
| 非结构化文本，难以解析 | Schema 驱动的结构化数据 |
| 中心化，一家公司控制一切 | 去中心化，每个人拥有自己的实例 |
| 需要注册 | 无需注册、无需账号 |
| 商业化，广告驱动 | 非商业化，社区驱动 |
| 人类填表单 | AI Agent 通过对话收集数据 |

---

## Core Principles | 核心理念

### 1. Information Equality | 信息平权

Every review is stored as a plain JSON file in a public Git repository. No paywalls, no premium tiers, no "boost your listing" schemes. The data belongs to the community, not a corporation. Anyone can read it, any Agent can query it, and no algorithm decides who sees what.

每条评价都以纯 JSON 文件存储在公开的 Git 仓库中。没有付费墙，没有高级会员，没有"推广你的商铺"。数据属于社区，不属于任何公司。任何人都能阅读，任何 Agent 都能查询，没有算法决定谁能看到什么。

### 2. Structured Data, Not Noise | 结构化数据，而非噪音

Every review category is defined by a YAML Schema that enforces quality. A housing review **must** include rent, noise level, renovation condition, and landlord rating. A restaurant review **must** include cuisine, price per person, and taste rating. This is not a BBS where people write "nice place lol" — this is structured, queryable, high-quality data.

每个评价分类都由 YAML Schema 定义并强制保证质量。一条租房评价**必须**包含租金、噪音水平、装修状况和房东评分。一条餐厅评价**必须**包含菜系、人均消费和口味评分。这不是一个人们写"不错哦哈哈"的论坛 —— 这是结构化的、可查询的、高质量的数据。

### 3. Agent-Native, Human-Friendly | Agent 原生，人类友好

OpenBook is designed from the ground up for AI Agents (OpenClaw, Manus, and any future Agent). The `SKILL.md` file teaches any Agent how to read schemas, collect data through natural conversation, validate entries, and perform precise structured queries. Ordinary users never touch Git, JSON, or YAML — they just talk to their Agent.

OpenBook 从底层就为 AI Agent（OpenClaw、Manus 以及任何未来的 Agent）设计。`SKILL.md` 文件教会任何 Agent 如何读取 Schema、通过自然对话收集数据、校验条目、执行精确的结构化查询。普通用户永远不需要接触 Git、JSON 或 YAML —— 他们只需要跟自己的 Agent 对话。

### 4. Everyone Can Build Their Own | 每个人都能创建自己的 OpenBook

OpenBook is a **template**, not a platform. Click "Use this template" on GitHub, and you have your own OpenBook instance in seconds. Want to review gyms? Daycares? Doctors? Coworking spaces? Just add a `.yml` schema file. The Agent adapts automatically.

OpenBook 是一个**模板**，不是一个平台。在 GitHub 上点击 "Use this template"，几秒钟就拥有了自己的 OpenBook 实例。想评价健身房？幼儿园？医生？共享办公空间？只需添加一个 `.yml` schema 文件。Agent 自动适配。

### 5. Non-Commercial Forever | 永远非商业化

OpenBook is and will always be non-commercial. No ads, no sponsored reviews, no data selling. The code is MIT licensed. The data is community-owned. This is a public good, not a business.

OpenBook 现在是、将来也永远是非商业化的。没有广告，没有赞助评价，没有数据出售。代码采用 MIT 许可证。数据归社区所有。这是一个公共产品，不是一门生意。

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

### For OpenClaw Users | OpenClaw 用户

```bash
# Clone to your workspace
cd ~/.openclaw/workspace
git clone https://github.com/josephliver623/OpenBook.git

# OpenClaw automatically reads SKILL.md. Just talk:
# "I want to review my apartment"
# "Help me find quiet 1BR apartments in NYC under $3000"
# "我想评价一下我租的房子"
# "帮我找纽约安静的一室一厅，月租3000以下"
```

### For Manus Users | Manus 用户

Add this repository as a project skill. Manus will automatically read `SKILL.md` and understand how to publish and search reviews.

将此仓库作为项目的 skill 使用，Manus 会自动读取 `SKILL.md` 并理解如何发布和搜索评价。

### Create Your Own OpenBook | 创建你自己的 OpenBook

1. Click **"Use this template"** on GitHub
2. Name your repository (e.g., `openbook-nyc-food`, `openbook-gym-reviews`)
3. Optionally add custom categories by creating new `.yml` files in `schemas/`
4. Start publishing reviews through your Agent!

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

Every OpenBook instance is an independent GitHub repository, but they all share the same `SKILL.md` protocol. This means any Agent that understands OpenBook can operate any instance:

每个 OpenBook 实例都是一个独立的 GitHub 仓库，但它们共享同一套 `SKILL.md` 协议。这意味着任何理解 OpenBook 的 Agent 都能操作任何实例：

```
openbook-template (this repo)
    │
    ├── openbook-nyc-housing    (NYC rental community)
    ├── openbook-sf-food        (SF food guide)
    ├── openbook-cs-jobs        (CS interview experiences)
    ├── openbook-gym-reviews    (Gym reviews)
    ├── openbook-daycare        (Daycare reviews)
    ├── openbook-doctor         (Doctor reviews)
    └── ... your OpenBook here
```

---

## Project Structure | 项目结构

```
├── SKILL.md              # Agent instruction manual
├── README.md             # This file
├── schemas/              # Category definitions (YAML Schema)
│   ├── housing.yml       # Housing review schema
│   ├── food.yml          # Restaurant review schema
│   └── jobs.yml          # Job interview schema
├── data/                 # Review data (JSON files)
│   ├── housing/
│   ├── food/
│   └── jobs/
├── _index.json           # Global index (auto-generated)
├── scripts/
│   ├── build_index.py    # Index builder
│   └── validate.py       # Data validator
└── .github/
    └── workflows/
        └── on-push.yml   # CI: validate + rebuild index
```

---

## Contributing | 参与贡献

OpenBook is a community project. You can contribute by:

OpenBook 是一个社区项目。你可以通过以下方式参与贡献：

1. **Publishing reviews** — Share your honest experiences through your Agent
2. **Creating your own OpenBook** — Fork this template for your community
3. **Adding schemas** — Define new review categories
4. **Improving the codebase** — PRs welcome for scripts, CI, and SKILL.md
5. **Spreading the word** — Tell others about information equality

---

## License

MIT — Use it, fork it, build on it. Free forever.

---

<p align="center">
  <strong>OpenBook</strong> — Structured reviews by the people, for the people.<br>
  <strong>OpenBook</strong> — 来自人民的结构化评价，服务于人民。
</p>
