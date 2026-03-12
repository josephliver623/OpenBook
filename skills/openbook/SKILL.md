---
name: openbook
description: >
  Search, browse, and publish structured community reviews in OpenBook.
  Use when the user wants to find or share reviews about housing, restaurants,
  jobs, or any category defined in this OpenBook instance. This skill reads
  YAML schema files to understand what structured data to collect, validates
  entries, and saves them as JSON files to the repository.
---

# OpenBook Skill

OpenBook is a schema-driven, open-source community review platform. Reviews are
stored as JSON files in a Git repository, with each category defined by a YAML
schema that specifies fields, types, constraints, and conversational prompts.

**Repository root:** `{baseDir}`

---

## Quick Reference

| Action | Command |
|---|---|
| List categories | `ls {baseDir}/schemas/*.yml` |
| Read a schema | `cat {baseDir}/schemas/{category}.yml` |
| Search reviews | `python3 -c "..."` (see below) |
| Read one review | `cat {baseDir}/data/{category}/{id}.json` |
| Publish review | Create JSON → validate → save → commit |

---

## 1. Discover Categories

```bash
ls {baseDir}/schemas/*.yml
```

Each `.yml` file defines a review category. Read any schema to see its fields:

```bash
cat {baseDir}/schemas/housing.yml
```

Key schema properties per field:
- `type`: string, number, list, text, date
- `required`: true/false
- `agent_prompt`: the question to ask the user
- `enum` + `labels`: constrained choices with display names
- `min`/`max`: numeric ranges
- `auto: "today"`: auto-fill with current date

---

## 2. Search Reviews

### Fast search via index

```bash
python3 -c "
import json
with open('{baseDir}/_index.json') as f:
    data = json.load(f)
results = [r for r in data if r.get('_schema') == 'housing'
           and r.get('city','').lower() == 'new york'
           and r.get('rent_monthly', 99999) < 3000]
for r in results:
    print(f\"  {r['title']} | \${r.get('rent_monthly','?')}/mo | Rating {r.get('overall_rating','?')}/5\")
"
```

### Field-specific search with jq

```bash
# Quiet apartments under $2500
find {baseDir}/data/housing/ -name "*.json" -exec jq -r '
  select(.noise_level <= 2 and .rent_monthly <= 2500) |
  "\(.title) | $\(.rent_monthly)/mo | noise \(.noise_level)/5"
' {} \;

# 4+ star restaurants
find {baseDir}/data/food/ -name "*.json" -exec jq -r '
  select(.overall_rating >= 4) |
  "\(.restaurant_name) | \(.cuisine) | $\(.price_per_person)/person"
' {} \;

# Successful interview experiences at a company
find {baseDir}/data/jobs/ -name "*.json" -exec jq -r '
  select(.company == "Google" and .result == "offer") |
  "\(.position) | difficulty \(.difficulty)/5"
' {} \;
```

### Keyword search

```bash
grep -rl "keyword" {baseDir}/data/ --include="*.json"
```

---

## 3. Publish a Review

### Step 1: Identify category

Ask the user what they want to review. Match to a schema in `{baseDir}/schemas/`.

### Step 2: Read the schema

```bash
cat {baseDir}/schemas/{category}.yml
```

### Step 3: Collect data conversationally

Go through each field in the schema:
- Use `agent_prompt` as your question
- For `required: true` fields, you MUST get a valid answer
- For `enum` fields, present `labels` as friendly options
- For `list` fields with `options`, let user pick multiple
- For `auto: "today"`, fill automatically
- Batch related questions when natural

**Example conversation:**
```
Agent: 你想评价哪里的房子？城市和大概位置？
User:  纽约东村 E 10th St
Agent: 月租多少？几室的？
User:  2500 一室一厅
Agent: 噪音怎么样？1分很安静，5分很吵
User:  2分，挺安静的
```

### Step 4: Confirm with user

Show a summary and ask for confirmation:

```
📝 你的租房评价摘要：
📍 East Village, New York | E 10th St
💰 $2,500/月 | 🛏 1BR | 🏠 装修：较新
⭐ 总评 4/5 | 🔇 噪音 2/5 | 👤 房东 4/5

确认发布吗？
```

### Step 5: Save as JSON

```bash
# Generate ID: YYYYMMDD-slug
cat > {baseDir}/data/{category}/{id}.json << 'EOF'
{
  "_schema": "{category}",
  "_version": 1,
  "_id": "{id}",
  ... all fields ...
}
EOF
```

### Step 6: Validate, index, and commit

```bash
python3 {baseDir}/scripts/validate.py {baseDir}
python3 {baseDir}/scripts/build_index.py {baseDir}
cd {baseDir}
git add data/ _index.json
git commit -m "Add {category} review: {title}"
git push origin main 2>/dev/null || echo "Saved locally"
```

---

## 4. Present Results

Format results as tables appropriate to the category:

| Category | Key Columns |
|---|---|
| Housing | Location, Rent, Rating, Noise, Renovation, Landlord |
| Food | Restaurant, Cuisine, Price/person, Rating, Taste |
| Jobs | Company, Position, Difficulty, Result, Salary |

After showing results, ask if the user wants details on any specific review.

---

## 5. Add a New Category

1. Create `{baseDir}/schemas/{name}.yml` (copy an existing one as template)
2. Define fields with types, constraints, and `agent_prompt`
3. Create `mkdir {baseDir}/data/{name}`
4. The skill automatically adapts — no other changes needed
