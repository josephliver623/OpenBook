[English](./README.md) | [简体中文](./README.zh-CN.md)

<p align="center">
  <img src="assets/logo.png" alt="OpenBook Logo" width="180" />
</p>

<h1 align="center">OpenBook</h1>

<p align="center">
  <strong>An open, non-commercial, schema-driven review platform built for AI Agents and humans.</strong>
</p>

<p align="center">
  <em>Globally Connected, Locally Owned.</em>
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

---

## The Problem We're Solving

**In short: in today's anonymous society, the cost of bad behavior is too low.**

In a close-knit community, reputation is an invisible constraint. But in a city of millions, a lack of trust between strangers allows landlords, employers, and businesses to act maliciously and escape consequences. The cost of legal action is high, and public outrage lasts only three days.

OpenBook's answer isn't another exposure platform, but rather **rebuilding the reputation infrastructure for an anonymous society**.

We can't change the law, but we can **make information about behavior persistent, searchable, and immutable**. When a person's negative record can be easily found, the expected gain from misconduct drops significantly.

To ensure the credibility of information, we introduce the **Evidence Hash**. Users don't need to upload private chat logs or contracts; they simply submit the SHA-256 hash of the file. This hash is permanently recorded on the blockchain, allowing anyone to independently verify the authenticity and timestamp of the evidence, while the original file remains in the user's hands, protecting their privacy.

This is the core of OpenBook: **a decentralized reputation system based on verifiable evidence.**

---

## Why OpenBook?

Today's review platforms are broken. Yelp, social platforms, and Google Reviews all share the same fundamental problems: recommendation algorithms bury honest voices, commercial interests distort rankings, and unstructured text makes it nearly impossible for AI Agents to extract precise, actionable information.

OpenBook takes a radically different approach:

| Traditional Platforms | OpenBook |
|---|---|
| Algorithms decide what you see | You query exactly what you need |
| Unstructured text, hard to parse | Schema-driven structured data |
| Centralized, one company controls all | Globally Connected, Locally Owned |
| Registration required | No registration, no accounts |
| Commercial, ad-driven | Non-commercial, community-driven |
| Humans fill forms | AI Agents collect data through conversation |

---

## Core Principles

### 1. Globally Connected, Locally Owned

OpenBook is not a centralized platform — it is a **unified data network composed of self-governing communities**. Each community — whether a university, a city, or an interest group — has full editorial authority over its own content, while contributing value to the entire network.

Data is not locked in any platform. Information flows freely. Communities own their voice.

### 2. Information Equality

Every review is stored as a plain file in a public Git repository. No paywalls, no premium tiers, no "boost your listing" schemes. The data belongs to the community, not a corporation. Anyone can read it, any Agent can query it, and no algorithm decides who sees what.

### 3. Structured Data, Not Noise

Every review category is defined by a YAML Schema that enforces quality. A housing review **must** include rent, noise level, renovation condition, and landlord rating. A restaurant review **must** include cuisine, price per person, and taste rating. This is not a BBS where people write "nice place lol" — this is structured, queryable, high-quality data.

### 4. Agent-Native, Human-Friendly

OpenBook is designed from the ground up for AI Agents (OpenClaw, Manus, and any future Agent). The `SKILL.md` file teaches any Agent how to read schemas, collect data through natural conversation, validate entries, and perform precise structured queries. Ordinary users never touch Git, JSON, or YAML — they just talk to their Agent.

### 5. Non-Commercial Forever

OpenBook is and will always be non-commercial. No ads, no sponsored reviews, no data selling. The code is MIT licensed. The data is community-owned. This is a public good, not a business.

---

## Distributed Governance

OpenBook uses a **"Unified Repository + Distributed Governance"** model. We do not recommend creating independent forks for each school or city, as this would create data silos. Instead, every community becomes a self-governing node within the unified OpenBook network.

### How It Works

1. **Apply to join**: Open a discussion in [GitHub Discussions](../../discussions) and rally early contributors from your school or city.
2. **Get your own space**: The core team creates a dedicated data directory (e.g., `/data/mit/`) and a maintainer team (e.g., `@mit-maintainers`).
3. **Self-govern**: Through GitHub's `CODEOWNERS`, your maintainer team has full review and merge authority over your directory. Your turf, your rules.

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

---

## Core Concepts

### Signal: A Timestamped Observation

A Signal is a single, structured observation about a place, a person, or an event. It's the basic unit of data in OpenBook. Each Signal is a Markdown file with a YAML frontmatter, containing structured data like ratings, location, and other relevant fields.

### Entity: A Profile for People, Places, and Organizations

An Entity is a profile that aggregates multiple Signals related to a single person (e.g., a landlord), organization (e.g., a company), or place. This allows us to build a longitudinal history of behavior and reputation over time. For example, all signals related to a specific landlord are linked to their Entity profile, creating a verifiable track record.

### Evidence Hash: Verifiable Proof

To enhance the credibility of Signals, especially for sensitive claims like a landlord withholding a deposit, we introduce the concept of an Evidence Hash. Instead of uploading sensitive documents (like chat screenshots or contracts), users can provide a cryptographic hash (e.g., SHA-256) of the evidence file. This hash is stored publicly.

---

## How It Works

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

## Built-in Categories

| Category | Schema | Key Fields |
|---|---|---|
| Housing Reviews | `schemas/housing.yml` | rent, noise, light, renovation, landlord, amenities |
| Restaurant Reviews | `schemas/food.yml` | cuisine, price, taste, service, environment, must-try dishes |
| Job Interviews | `schemas/jobs.yml` | company, position, difficulty, result, salary, tips |

---

## Quick Start

### Option A: MCP Server via npm (Recommended)

One command to run the OpenBook MCP Server. Works with Claude Desktop, Cursor, and any MCP-compatible client.

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

Then just talk to Claude: "I want to review my apartment".

### Option B: Agent Skills via ClawHub

OpenBook is published on [ClawHub](https://clawhub.ai/josephliver623/openbook) — the skill registry for AI Agents. Install with one command:

```bash
clawhub install openbook
```

For Agent platforms that support Skills (Manus, OpenClaw, etc.), the Agent will automatically read `SKILL.md` and gain the ability to search and publish reviews.

Alternatively, clone this repo manually:

```bash
git clone https://github.com/josephliver623/OpenBook.git
```

### Option C: Join an Existing Community

Want to contribute to your school or city? Check if a community already exists in `data/`, or start a new one:

1. Open a discussion in [GitHub Discussions](../../discussions)
2. Rally 3+ contributors from your school/city
3. Get your own `data/{community}/` directory and maintainer team
4. Start contributing with full editorial autonomy

---

## Why Structured Data Beats Algorithms

When you search for an apartment on traditional platforms, you get a wall of text filtered by an opaque algorithm. You have to read through dozens of reviews to figure out if a place is quiet, if the landlord is responsive, if the rent is reasonable.

With OpenBook, your Agent can do this in one query:

```bash
# Find quiet apartments in East Village under $3000
jq '[.[] | select(._schema=="housing" and .neighborhood=="East Village" 
    and .noise_level<=2 and .rent_monthly<3000)]' _index.json
```

The result is instant, precise, and complete — because every review is structured data, not a blob of text that an LLM has to guess at.

---

## Signals: Real-time Atomic Updates

**Reviews tell you what a place is like. Signals tell you what just changed.**

Traditional reviews are one-time snapshots. But the real world changes daily — a café gets a new barista, a restaurant raises prices, construction starts outside an apartment. These small but critical changes are exactly what Agents need for decision-making.

### What is a Signal?

A Signal is an **atomic, time-stamped observation** — a single fact about a change or discovery:

```
Review:  "This cafe is generally good, great pour-over, quiet environment" (written once)
Signal:  "New Yirgacheffe beans as of 2026-03-10, more fruity notes" (added anytime)
Signal:  "Very few people on Thursday afternoons, good for work" (added anytime)
Signal:  "Americano price increased from ¥28 to ¥32" (added anytime)
```

### Signal Types

| Type | Example |
|------|---------|
| `price_change` | "Americano price increased from ¥28 to ¥32" |
| `staff_change` | "New barista, latte art improved" |
| `menu_change` | "Added oat milk latte" |
| `quality_change` | "Recent output has been unstable" |
| `hours_change` | "Now opens at 10:00 AM on weekends" |
| `address_change` | "Moved next door, address updated" |
| `closure` | "Temporarily closed for renovation" |
| `opening` | "New specialty coffee shop opened on Yuyuan Road" |
| `tip` | "Buy one get one free on Wednesdays" |
| `warning` | "Cleanliness has declined, be aware" |
| `update` | "WiFi password has changed" |

### Why Signals Matter for Agents

```
Agent Query: "Any good cafes near Yuyuan Road in Shanghai?"

Traditional way: Returns a 6-month-old review → possibly outdated
OpenBook way: Returns review + signals from the last 30 days → real-time and accurate

Agent sees:
  Review: "Seesaw Coffee has good pour-over, 4.5/5" (2025-12)
  Signal: "New barista, latte art improved" (2026-03-10) ← Latest change
  Signal: "Americano price increased to ¥32" (2026-03-15) ← Price update
```

Signals are the **heartbeat** of OpenBook — they keep data alive and current.

### Contributing Signals

Signals are designed to be ultra-low-friction. You can contribute a Signal in one sentence:

> "Seesaw on Yuyuan Road got new beans, very floral"

That's it. The system extracts the structured fields automatically.

---

## Add Custom Categories

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

## The OpenBook Ecosystem

Every community in OpenBook shares the same `SKILL.md` protocol and schema system. This means any Agent that understands OpenBook can operate across all communities:

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

## Project Structure

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

## Contributing

OpenBook is a community project. You can contribute by:

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
  <strong>OpenBook</strong> — Globally Connected, Locally Owned.<br><br>
  <a href="https://openbook.now">Website</a> · <a href="https://www.npmjs.com/package/openbook-mcp">npm</a> · <a href="https://github.com/josephliver623/OpenBook">GitHub</a>
</p>
