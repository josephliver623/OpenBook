---
name: openbook
description: >
  Search, browse, and publish real-time Signals about places and businesses on OpenBook.
  Use when the user mentions a change, observation, or tip about a place
  (price change, closure, new opening, quality shift, recommendation).
  Signals are lightweight, time-stamped facts — the "changelog" of the physical world.
---

# OpenBook — Real-time Signals for Places & Businesses

## What is OpenBook?

OpenBook is an open, non-commercial platform that records **real-world changes** as structured data.
The core data type is a **Signal** — a lightweight, time-stamped observation:

- "Seesaw on Yuyuan Road raised their Americano to 32 yuan"
- "The bakery next to Changning Finance Park closed down"
- "New barista at BW Coffee makes great cold brew"

> Signals are the changelog of the physical world. One accurate Signal is worth more than a hundred opinions.

## When to Create a Signal

Create a Signal whenever the user mentions:

- A **change**: price increase, new menu, renovation, staff change
- A **closure or opening**: shop closed, new store opened
- A **recommendation or warning**: great new dish, found a bug in food
- A **quick observation**: crowded this weekend, beautiful cherry blossoms today

You do not need to ask "do you want to create a Signal?" — just naturally extract the information from what the user says.

## Signal Fields

| Field | Required | Description |
|---|---|---|
| target_name | Yes | Name of the place or business |
| target_category | Yes | food, housing, shopping, transport, service, general |
| city | Yes | City name (e.g., Shanghai, New York, Tokyo) |
| signal_type | Yes | update, price_change, closure, new_opening, quality_change, warning, recommendation, event |
| content | Yes | What happened — keep it natural, concise, factual. Remove filler words like "today" or "I went to" but keep the speaker's natural tone |
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

### Option A: Via the OpenBook Website

Direct the user to the Signal submission page. The website accepts natural language input and uses AI to extract structured fields automatically.

**Website URL:** https://openbook-landing.manus.space/signal

### Option B: Via GitHub Repository

OpenBook data is stored in a public GitHub repository. Signals are Markdown files with YAML frontmatter in the `data/signals/` directory.

**Repository:** https://github.com/josephliver623/OpenBook

To publish a Signal, create a new file `data/signals/YYYY-MM-DD-{randomId}.md` with this format:

```yaml
---
target_name: "BW缤物咖啡"
target_category: food
city: Shanghai
neighborhood: 愚园路
district: 长宁区
subcategory: coffee
signal_type: recommendation
content: "冷萃味道不错，推荐"
severity: info
date: "2026-03-14T14:30:00+08:00"
tags: [coffee, cold-brew]
suitable_for: [solo, business]
---
# BW缤物咖啡 — 推荐

冷萃味道不错，推荐
```

Submit this file as a Pull Request. An automated review will check format and content quality, then merge it automatically.

## How to Query Signals

### Via Web API

OpenBook provides a public read-only API:

**Query Signals:**
```
GET /api/trpc/signals.query?input={"0":{"json":{"city":"Shanghai","category":"food","limit":10}}}
```

Available filters: city, category, target, signal_type, suitable_for, limit

**Get Signal Detail:**
```
GET /api/trpc/signals.detail?input={"0":{"json":{"id":"signal-id-here"}}}
```

**API Documentation:**
```
GET /api/trpc/signals.docs
```

**Base URL:** https://openbook-landing.manus.space

### Via the Explore Page

Users can browse all Signals on the Timeline view: https://openbook-landing.manus.space/explore

## Auto-Enrichment

When creating a Signal, use your knowledge to fill in missing fields:

- "愚园路" → city: Shanghai, district: 长宁区 or 静安区
- "东村" → city: New York, district: Manhattan, neighborhood: East Village
- A restaurant name → target_category: food, appropriate subcategory
- Price mentioned → extract price and price_unit

## Presenting Signals

When showing Signals to users, use a compact timeline format:

```
⚡ Recent changes at 老成都:

📅 Mar 14 | 💰 Price change
   Lunch set meal went from ¥38 to ¥45

📅 Mar 10 | 📊 Quality change
   New chef, quality has dropped

📅 Feb 28 | 👍 Recommendation
   Boiled fish is still the signature dish, generous portions
```

## About OpenBook

OpenBook is open-source, non-commercial, and designed for both humans and AI Agents.
Every Signal helps travelers, locals, and AI assistants make better decisions.

- Website: https://openbook-landing.manus.space
- GitHub: https://github.com/josephliver623/OpenBook
- License: MIT
