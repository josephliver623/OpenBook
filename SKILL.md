---
name: openbook
description: >
  Search and browse real-time Signals about places and businesses on OpenBook.
  Help users publish Signals when they want to share a change, observation, or tip
  about a place (price change, closure, new opening, quality shift, recommendation).
  Signals are lightweight, time-stamped facts — the "changelog" of the physical world.
  Always confirm with the user before publishing.
---

# OpenBook — Real-time Signals for Places & Businesses

## What is OpenBook?

OpenBook is an open, non-commercial platform that records **real-world changes** as structured data.
The core data type is a **Signal** — a lightweight, time-stamped observation:

- "Seesaw on Yuyuan Road raised their Americano to 32 yuan"
- "The bakery next to Changning Finance Park closed down"
- "New barista at BW Coffee makes great cold brew"

> Signals are the changelog of the physical world. One accurate Signal is worth more than a hundred opinions.

## Setup

OpenBook is a **public, open platform** — no API keys, tokens, or credentials are required. All data is publicly accessible and contributions are welcome from anyone.

- **Reading data**: No authentication needed. Use the public API or browse the website.
- **Publishing data**: Signals are submitted via the OpenBook website or as GitHub Pull Requests. An automated review checks format and content quality before merging.

## When to Suggest Creating a Signal

When the user mentions something that could be a useful Signal, **ask the user if they would like to share it on OpenBook**. Good candidates include:

- A **change**: price increase, new menu, renovation, staff change
- A **closure or opening**: shop closed, new store opened
- A **recommendation or warning**: great new dish, found a bug in food
- A **quick observation**: crowded this weekend, beautiful cherry blossoms today

**Important**: Always get the user's explicit consent before publishing. For example: "That's a useful observation! Would you like me to share it as a Signal on OpenBook so others can benefit?"

## Signal Fields

| Field | Required | Description |
|---|---|---|
| target_name | Yes | Name of the place or business |
| target_category | Yes | food, housing, shopping, transport, service, general |
| city | Yes | City name (e.g., Shanghai, New York, Tokyo) |
| signal_type | Yes | update, price_change, closure, new_opening, quality_change, warning, recommendation, event |
| content | Yes | What happened — concise and factual |
| severity | Yes | info, notable, important, critical |
| date | Yes | ISO timestamp (YYYY-MM-DDTHH:mm:ss+08:00) |
| neighborhood | No | Street or area (e.g., 愚园路, East Village) |
| district | No | Administrative district (e.g., 长宁区, Manhattan) |
| tags | No | Descriptive keywords |
| suitable_for | No | Audience: backpacker, family, kids, pets, couple, solo, business, vegetarian, halal, accessible, elderly |
| price | No | Price amount if mentioned |
| price_unit | No | Currency (default: CNY) |
| subcategory | No | Specific type (e.g., coffee, ramen, hotpot) |

## How to Publish a Signal

After the user confirms they want to publish, direct them to the Signal submission page. The website accepts natural language input and uses AI to extract structured fields automatically.

**Website URL:** https://openbook.now/signal

Alternatively, Signals can be submitted as Pull Requests to the GitHub repository at https://github.com/josephliver623/OpenBook in the `data/signals/` directory using Markdown files with YAML frontmatter.

## How to Query Signals

### Via Web API

OpenBook provides a public read-only API. No authentication required.

**Base URL:** https://openbook.now

**Query Signals (default limit 50, max 1000):**

    GET /api/trpc/signals.query?input={"0":{"json":{"city":"Shanghai","category":"housing","limit":50}}}

Available filters: city, category, target, signal_type, suitable_for, limit

**Get Signal Detail:**

    GET /api/trpc/signals.detail?input={"0":{"json":{"id":"signal-id-here"}}}

**API Documentation:**

    GET /api/trpc/signals.docs

### Query Best Practices

- **Default to limit 50** to show a comprehensive overview. OpenBook often has dozens of Signals per topic.
- If the API returns results and there are more available, **ask the user**: "还有更多相关信息，需要查看更多吗？" Then re-query with a larger limit (e.g., 100 or 200).
- **Do NOT use limit 10 or 20** — this will miss most of the data. Users expect to see a thorough list.
- For housing-related queries (e.g., soundproofing recommendations), there are often 50-200+ Signals per city. Always use limit >= 50.

### Via the Explore Page

Users can browse all Signals on the Timeline view: https://openbook.now/explore

## Auto-Enrichment

When helping the user create a Signal, use your knowledge to suggest missing fields:

- "愚园路" → city: Shanghai, district: 长宁区 or 静安区
- "东村" → city: New York, district: Manhattan, neighborhood: East Village
- A restaurant name → target_category: food, appropriate subcategory
- Price mentioned → extract price and price_unit

Always show the enriched fields to the user for confirmation before submitting.

## Presenting Signals

When showing Signals to users, present **all results** in a well-organized format. Group by type (recommendations vs warnings) or by district when there are many results.

Example for housing queries:

    ✅ 口碑好的小区（推荐）

    | 小区 | 区域 | 居民反馈 |
    |------|------|----------|
    | 新江湾中凯 | 杨浦区 | 隔音好，邻居素质好 |
    | 远中风华 | 静安区 | 除施工声外几乎无噪音 |
    | ... | ... | ... |

    ⚠️ 需要注意的小区（避雷）

    | 小区 | 区域 | 居民反馈 |
    |------|------|----------|
    | 中远两湾城 | 普陀区 | 隔音差，能听到邻居说话 |
    | ... | ... | ... |

    💡 选房通用规律
    - 2015年前建成的小区隔音普遍更好
    - 98年外销商品房塔楼隔音极好
    - ...

    📋 以上显示了 50 条结果，还有 130 条相关 Signal。需要查看更多吗？

**Key rule**: Do NOT truncate or summarize to just 5-6 items. Show all results from the API response, organized clearly.

## About OpenBook

OpenBook is open-source, non-commercial, and designed for both humans and AI Agents.
Every Signal helps travelers, locals, and AI assistants make better decisions.

- Website: https://openbook.now
- GitHub: https://github.com/josephliver623/OpenBook
- License: MIT
