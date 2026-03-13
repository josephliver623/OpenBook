---
name: openbook
description: >
  Search, browse, and publish structured community reviews.
  Use when the user wants to find or share reviews about housing,
  restaurants, jobs, or any category defined in this OpenBook instance.
  This skill reads YAML schema files to understand what structured data
  to collect from users, validates entries, and saves them as JSON.
---

# OpenBook — Schema-Driven Community Reviews

## Overview

OpenBook is a structured community review platform stored as JSON files in a
Git repository. Each review category is defined by a YAML schema that specifies
exactly what fields to collect, their types, constraints, and the questions to
ask users.

**Repository root:** `{baseDir}`

## Step 0: Discover Available Categories

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

## Publishing a New Review

### Step 1: Identify the category

Ask the user what they want to review. Match to a schema file in `{baseDir}/schemas/`.

### Step 2: Read the schema

```bash
cat {baseDir}/schemas/{category}.yml
```

### Step 3: Conversational data collection

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

### Step 4: Validate and confirm

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

### Step 5: Save as JSON

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

### Step 6: Update index and commit

```bash
python3 {baseDir}/scripts/build_index.py {baseDir}
cd {baseDir}
git add data/ _index.json
git commit -m "Add {category} review: {title}"
git push origin main 2>/dev/null || echo "Saved locally (push when online)"
```

## Searching Reviews

### Quick search: Use the index

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

### Field-specific search with jq

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

# Google interview experiences with offers
find {baseDir}/data/jobs/ -name "*.json" -exec jq -r '
  select(.company == "Google" and .result == "offer") |
  "\(.position) | \(.salary_range // "N/A") | difficulty \(.difficulty)/5"
' {} \;
```

### Full-text keyword search

```bash
grep -rl "keyword" {baseDir}/data/ --include="*.json"
```

### Read a specific review in detail

```bash
cat {baseDir}/data/{category}/{id}.json | python3 -c "
import json, sys
r = json.load(sys.stdin)
print(f\"# {r['title']}\")
print(f\"⭐ {r.get('overall_rating','?')}/5 | 📅 {r.get('date','')}\")
# Print all non-meta, non-empty fields
for k, v in r.items():
    if not k.startswith('_') and k not in ('title','date') and v:
        print(f\"{k}: {v}\")
"
```

## Presenting Results

When showing results to users, format as a clear table appropriate to the category:

**Housing:** | Location | Rent | Rating | Noise | Renovation | Landlord |
**Food:** | Restaurant | Cuisine | Price/person | Rating | Taste | Must-try |
**Jobs:** | Company | Position | Difficulty | Result | Salary |

After showing the table, ask if the user wants details on any specific review.

## Adding a New Category

To add a new review category to this OpenBook instance:

1. Create a new schema file: `{baseDir}/schemas/{name}.yml`
2. Follow the format of existing schemas (see housing.yml as reference)
3. Create the data directory: `mkdir {baseDir}/data/{name}`
4. The skill automatically adapts to new schemas — no other changes needed.


## Signals — Real-time Atomic Updates

In addition to Reviews, OpenBook supports **Signals** — lightweight, time-stamped observations about changes.

### When to use Signals (instead of Reviews)
- A price changed
- Staff/chef/barista changed
- Menu updated
- Business hours changed
- A place closed or relocated
- Any quick tip or warning

### Signal Schema
Signal files are stored in `data/signals/` and follow `schemas/signal.yml`.

### Submitting a Signal
To submit a signal, create a Markdown file with YAML frontmatter:

```markdown
---
target_name: "Restaurant Name"
target_category: food
city: Shanghai
signal_type: price_change
content: "Lunch set increased from ¥45 to ¥55"
severity: notable
date: 2026-03-14
---

# Restaurant Name — Price Change

Lunch set increased from ¥45 to ¥55.
```

### Querying Signals
When a user asks about a place, always check for recent Signals in addition to Reviews:
1. Search `_index.json` → `signals` array for matching `target_name` or `target_category`
2. Prioritize signals from the last 30 days
3. Combine Review data with Signal updates for the most current picture
