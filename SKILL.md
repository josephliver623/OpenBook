---
name: openbook
description: >
  Search, browse, and publish structured community reviews AND real-time Signals.
  Use when the user wants to find or share reviews about housing, restaurants, jobs,
  or any category defined in this OpenBook instance.
  Also use when the user mentions a time-sensitive observation about a place
  (price change, closure, new opening, quality shift) — capture it as a Signal.
  This skill reads YAML schema files to understand what structured data
  to collect from users, validates entries, and saves them as JSON (Reviews)
  or Markdown with YAML frontmatter (Signals).
---

# OpenBook — Schema-Driven Community Reviews + Real-time Signals

## Overview

OpenBook is a structured community data platform stored in a Git repository.
It has two data types:

- **Reviews** — comprehensive, structured evaluations (JSON files)
- **Signals** — lightweight, time-stamped observations about changes (Markdown + YAML frontmatter)

> "Reviews are snapshots. Signals are heartbeats."

**Repository root:** `{baseDir}`

---

## Part 1: Reviews

### Step 0: Discover Available Categories

```bash
ls {baseDir}/schemas/*.yml
```

Read any schema to understand what fields are available:
```bash
cat {baseDir}/schemas/housing.yml
```

Each schema file defines:
- `fields`: all data fields with types, constraints, and `agent_prompt` (the question to ask)
- `required`: whether the field must be filled
- `enum` / `options`: allowed values for constrained fields
- `min` / `max`: numeric ranges
- `auto`: fields that are filled automatically (e.g., today's date)

### Publishing a New Review

#### Step 1: Identify the category

Ask the user what they want to review. Match to a schema file in `{baseDir}/schemas/`.

#### Step 2: Read the schema

```bash
cat {baseDir}/schemas/{category}.yml
```

#### Step 3: Conversational data collection

Go through each field defined in the schema:

- Use the `agent_prompt` value as your question to the user
- For `required: true` fields, you MUST get a valid answer before proceeding
- For `enum` fields, present the `labels` as friendly options
- For `list` fields with `options`, let the user pick multiple items
- For `auto: "today"` fields, fill with today's date automatically
- For `default` fields, use the default if the user skips
- Be conversational and natural — batch related questions together when it feels natural
- You may collect information from a single user message that answers multiple fields

Example conversation for housing:
```
Agent: 你想评价哪里的房子？城市、社区、大概位置？
User:  纽约东村 E 10th St
Agent: 月租多少？几室的？
User:  2500 一室一厅
Agent: 噪音怎么样？1分很安静，5分很吵。装修情况呢？
User:  噪音3分，装修一般
...
```

#### Step 4: Validate and confirm

After collecting all required fields, show a formatted summary and ask for confirmation:

```
📝 你的租房评价摘要：
📍 East Village, New York | E 10th St
💰 $2,500/月 | 🛏 1BR | 🏠 装修：一般
⭐ 总评 4/5 | 🔇 噪音 3/5 | 👤 房东 4/5
✅ 优点：交通方便，餐厅多
❌ 缺点：租金偏高

确认发布吗？
```

#### Step 5: Save as JSON

Generate a unique ID and save:

```bash
# ID format: YYYYMMDD-slug (slug from title, lowercase, hyphens, max 40 chars)
cat > {baseDir}/data/{category}/{id}.json << 'JSONEOF'
{
  "_schema": "{category}",
  "_version": 1,
  "_id": "{id}",
  ... all collected fields as key-value pairs ...
}
JSONEOF
```

IMPORTANT: The JSON file MUST include `_schema`, `_version`, and `_id` meta-fields.

#### Step 6: Update index and commit

```bash
python3 {baseDir}/scripts/build_index.py {baseDir}
cd {baseDir}
git add data/ _index.json
git commit -m "Add {category} review: {title}"
git push origin main 2>/dev/null || echo "Saved locally (push when online)"
```

### Searching Reviews

#### Quick search: Use the index

The `_index.json` file contains a summary of ALL reviews (without long text fields).
Load it for fast filtering:

```bash
python3 -c "
import json
with open('{baseDir}/_index.json') as f:
    data = json.load(f)
# Example: housing in NYC under $3000
results = [r for r in data if r.get('_schema') == 'housing'
           and r.get('city','').lower() == 'new york'
           and r.get('rent_monthly', 99999) < 3000]
for r in results:
    print(f\"  {r['title']} | \${r.get('rent_monthly','?')}/mo | ⭐{r.get('overall_rating','?')} | {r.get('neighborhood','')}\")
"
```

#### Field-specific search with jq

```bash
# Quiet apartments (noise <= 2) under $2500
find {baseDir}/data/housing/ -name "*.json" -exec jq -r '
  select(.noise_level <= 2 and .rent_monthly <= 2500) |
  "\(.title) | $\(.rent_monthly)/mo | noise \(.noise_level)/5 | \(.neighborhood)"
' {} \;

# 4+ star restaurants in a specific area
find {baseDir}/data/food/ -name "*.json" -exec jq -r '
  select(.overall_rating >= 4 and (.neighborhood // "" | test("Flushing";"i"))) |
  "\(.restaurant_name) | ⭐\(.overall_rating) | \(.cuisine) | $\(.price_per_person)/person"
' {} \;
```

#### Read a specific review in detail

```bash
cat {baseDir}/data/{category}/{id}.json | python3 -m json.tool
```

### Presenting Review Results

When showing results to users, format as a clear table appropriate to the category:

**Housing:** | Location | Rent | Rating | Noise | Renovation | Landlord |
**Food:** | Restaurant | Cuisine | Price/person | Rating | Taste | Must-try |
**Jobs:** | Company | Position | Difficulty | Result | Salary |

After showing the table, ask if the user wants details on any specific review.

---

## Part 2: Signals — Real-time Atomic Updates

### What is a Signal?

A Signal is a **lightweight, time-stamped observation** about a place or business.
Unlike Reviews (which are comprehensive evaluations), Signals capture **changes and moments**:

- A restaurant raised prices
- A new barista makes better coffee
- A shop is temporarily closed for renovation
- A park is especially beautiful this week
- A neighborhood feels less safe at night

Signals have a natural **time dimension** — they describe what is happening NOW,
not a static rating. Over time, Signals form a "heartbeat" of a place.

### Signal Schema (v1.1)

Signal files are stored in `{baseDir}/data/signals/` as Markdown with YAML frontmatter.

**Core fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `target_name` | string | Yes | Name of the place/business |
| `target_category` | string | Yes | food, housing, shopping, transport, service, general |
| `city` | string | Yes | City name (e.g., Shanghai, New York) |
| `neighborhood` | string | No | Area/street (e.g., 愚园路, East Village) |
| `district` | string | No | Administrative district (e.g., 静安区, Manhattan) |
| `signal_type` | string | Yes | update, price_change, closure, new_opening, quality_change, warning, recommendation, event |
| `content` | string | Yes | What happened or was observed |
| `severity` | string | Yes | info, notable, important, critical |
| `date` | string | Yes | ISO date (YYYY-MM-DD) |
| `tags` | list | No | Descriptive tags |
| `suitable_for` | list | No | Audience tags (see below) |
| `price` | number | No | Price amount |
| `price_unit` | string | No | Currency (default: CNY) |
| `address` | string | No | Specific address |
| `subcategory` | string | No | Specific subcategory (e.g., coffee, sichuan, ramen) |

**Meta fields (auto-generated):**

| Field | Description |
|---|---|
| `_schema` | Always `openbook/signal/v1` |
| `_version` | Always `1` |
| `_confidence` | 0.0-1.0, how confident the data is |
| `_source` | `user_report`, `agent_observation`, `auto_enriched` |
| `_verified` | Whether verified by another source |
| `_access` | `public` or `private` |

**Suitable-for audience tags:**

| Tag | Description |
|---|---|
| `backpacker` | Budget travelers with flexible plans |
| `family` | Family groups (general) |
| `kids` | Specifically child-friendly |
| `pets` | Pet-friendly |
| `couple` | Romantic / date-friendly |
| `solo` | Solo travelers or diners |
| `business` | Business travelers / remote workers |
| `vegetarian` | Vegetarian-friendly |
| `halal` | Halal-friendly |
| `accessible` | Wheelchair / mobility accessible |
| `elderly` | Senior-friendly |

### When to Create a Signal (vs a Review)

**Create a Signal when the user mentions:**
- A change: "they raised prices", "new menu", "closed for renovation"
- A moment: "the cherry blossoms are beautiful today", "super crowded this weekend"
- A quick tip: "go before 11am to avoid the line", "the barista on weekdays is better"
- A warning: "found a bug in my food", "construction noise all day"
- A recommendation: "their new cold brew is amazing"

**Create a Review when the user wants to:**
- Give a comprehensive evaluation of a place
- Rate multiple aspects (taste, service, environment, price)
- Write a detailed pros/cons analysis

**When in doubt, default to Signal** — it's lower friction and captures the moment.

### Publishing a Signal

#### Step 1: Detect Signal-worthy content

When a user says something like:
- "今天在愚园路的bw缤物咖啡喝了冷萃，味道不错"
- "老成都涨价了，以前38现在45"
- "那家理发店换了新理发师，剪得不好"

These are Signal-worthy observations. You don't need to ask "do you want to create a Signal?" — just naturally extract the information.

#### Step 2: Extract structured data

From the user's message, extract:
- **target_name**: the place being discussed
- **content**: what happened / was observed
- **target_category**: food/housing/shopping/etc.
- **city** and **neighborhood**: location info
- **signal_type**: what kind of change
- **severity**: how important
- **tags**: relevant keywords
- **suitable_for**: who would find this useful

Use your knowledge to **auto-complete** missing information:
- If user says "愚园路" → city is likely Shanghai, district is 长宁区/静安区
- If user says "bw缤物" → full name is "BW缤物咖啡", category is food, subcategory is coffee
- If user mentions a price → extract price and price_unit

#### Step 3: Quick confirmation

Show a compact summary (NOT a long form):

```
⚡ Signal: BW缤物咖啡 — 推荐
📍 愚园路, 上海 (长宁区)
☕ 冷萃味道不错
🏷️ coffee, cold-brew, quiet
👥 适合: solo, business

确认记录？
```

If the user confirms (or doesn't object), save it.

#### Step 4: Save as Markdown

```bash
# Generate filename: YYYY-MM-DD-{random10chars}.md
cat > {baseDir}/data/signals/{filename}.md << 'EOF'
---
_schema: openbook/signal/v1
_version: 1
_confidence: 0.8
_source: user_report
_verified: false
_access: public
target_name: "BW缤物咖啡"
target_category: food
city: Shanghai
neighborhood: 愚园路
district: 长宁区
subcategory: coffee
signal_type: recommendation
content: "冷萃味道不错"
severity: info
date: 2026-03-14
tags: [coffee, cold-brew, quiet]
suitable_for: [solo, business]
---
# BW缤物咖啡 — 推荐

冷萃味道不错
EOF
```

#### Step 5: Commit

```bash
cd {baseDir}
git add data/signals/
git commit -m "Signal: BW缤物咖啡 (recommendation)"
git push origin main 2>/dev/null || echo "Saved locally"
```

### Querying Signals

#### List recent Signals

```bash
# All signals, newest first
ls -t {baseDir}/data/signals/*.md | head -20

# Read a specific signal
cat {baseDir}/data/signals/{id}.md
```

#### Search by target name

```bash
grep -rl "target_name.*老成都" {baseDir}/data/signals/ --include="*.md"
```

#### Search by city

```bash
grep -rl "city: Shanghai" {baseDir}/data/signals/ --include="*.md"
```

#### Search by category

```bash
grep -rl "target_category: food" {baseDir}/data/signals/ --include="*.md"
```

#### Search by suitable_for

```bash
grep -rl "backpacker\|family\|kids" {baseDir}/data/signals/ --include="*.md"
```

#### Python: structured Signal query

```python
import os, yaml, re

def load_signals(base_dir, city=None, category=None, target=None, suitable_for=None, limit=20):
    signals_dir = os.path.join(base_dir, "data", "signals")
    results = []
    for f in sorted(os.listdir(signals_dir), reverse=True):
        if not f.endswith(".md") or f == "README.md":
            continue
        with open(os.path.join(signals_dir, f)) as fh:
            content = fh.read()
        m = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)", content, re.DOTALL)
        if not m:
            continue
        meta = yaml.safe_load(m.group(1))
        if city and city.lower() not in (meta.get("city", "") or "").lower():
            continue
        if category and (meta.get("target_category", "") or "").lower() != category.lower():
            continue
        if target and target.lower() not in (meta.get("target_name", "") or "").lower():
            continue
        if suitable_for:
            sig_suitable = meta.get("suitable_for", []) or []
            if suitable_for.lower() not in [s.lower() for s in sig_suitable]:
                continue
        meta["_body"] = m.group(2).strip()
        meta["_filename"] = f[:-3]
        results.append(meta)
        if len(results) >= limit:
            break
    return results
```

### Presenting Signal Results

When showing Signals to users, use a compact timeline format:

```
⚡ Recent Signals for 老成都:

📅 2026-03-14 | 💰 价格变动 | ⚠️ notable
   午餐套餐从¥38涨到¥45

📅 2026-03-10 | 📊 品质变化 | ℹ️ info
   换了新厨师，水准有所下降

📅 2026-02-28 | 👍 推荐 | ℹ️ info
   水煮鱼依然是招牌，量很足
```

**Always combine Reviews + Signals** when answering questions about a place:
1. Show the Review summary (overall rating, pros/cons)
2. Show recent Signals (last 30 days) as "Latest Updates"
3. If Signals contradict the Review, highlight the discrepancy

---

## Part 3: Web API (for AI Agents)

OpenBook also provides a public read-only API at the deployed website for programmatic access.

### API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/trpc/signals.query` | Query Signals with filters |
| `GET /api/trpc/signals.detail` | Get a single Signal by ID |
| `GET /api/trpc/signals.docs` | API documentation for AI Agents |

### Query Parameters (via tRPC batch format)

```
/api/trpc/signals.query?input={"0":{"json":{"city":"Shanghai","category":"food","limit":10}}}
```

Available filters: `city`, `category`, `target`, `signal_type`, `suitable_for`, `limit`

---

## Adding a New Category

To add a new review category to this OpenBook instance:

1. Create a new schema file: `{baseDir}/schemas/{name}.yml`
2. Follow the format of existing schemas (see housing.yml as reference)
3. Create the data directory: `mkdir {baseDir}/data/{name}`
4. The skill automatically adapts to new schemas — no other changes needed.
