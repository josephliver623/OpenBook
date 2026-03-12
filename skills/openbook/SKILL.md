---
name: openbook
description: >
  Search, browse, and publish structured community reviews on OpenBook — an
  open, non-commercial, schema-driven review platform. Covers housing, food,
  jobs, and any custom category. Data is stored as JSON in a public GitHub
  repository. Use when the user wants to find or share real reviews.
---

# OpenBook — Open Structured Reviews

OpenBook is a community-driven, non-commercial review platform where every
review is structured, validated, and machine-readable. No ads, no algorithms,
no registration required.

**Website:** https://openbook.now
**GitHub:** https://github.com/josephliver623/OpenBook
**MCP Server:** `npx openbook-mcp` (for MCP-compatible agents)

---

## Setup (first time only)

Clone the repository to get the data and schemas:

```bash
git clone https://github.com/josephliver623/OpenBook.git /tmp/openbook
```

Set the base directory:
```bash
OPENBOOK_DIR="/tmp/openbook"
```

---

## Categories & Schemas

### 🏠 Housing Reviews (`housing`)

Share rental experiences with structured dimensions.

| Field | Type | Required | Description |
|---|---|---|---|
| title | string | Yes | One-line summary of experience |
| overall_rating | number 1-5 | Yes | Overall rating |
| address | string | Yes | Street-level address |
| city | string | Yes | City |
| neighborhood | string | Yes | Neighborhood |
| rent_monthly | number (USD) | Yes | Monthly rent |
| bedrooms | enum 0-4 | Yes | 0=Studio, 1=1BR, 2=2BR, 3=3BR, 4=4BR+ |
| noise_level | number 1-5 | Yes | 1=very quiet, 5=very noisy |
| natural_light | number 1-5 | No | 1=very dark, 5=very bright |
| renovation | enum | Yes | new / good / average / old / poor |
| landlord_rating | number 1-5 | Yes | Landlord responsiveness |
| amenities | list | No | laundry, gym, doorman, elevator, parking, etc. |
| pros | list | No | What you liked |
| cons | list | No | What you didn't like |
| review_text | text | No | Free-form review |
| date | date | Yes | Auto-fill today |
| author | string | No | Default: anonymous |

**Conversational prompts for housing:**
- "请用一句话概括你的租房体验"
- "在哪个城市？哪个社区？"
- "每月租金多少？几室的？"
- "噪音怎么样？1分很安静，5分很吵"
- "装修情况？全新/较新/一般/较旧/很差"
- "房东人怎么样？1-5分"
- "有什么配套设施？洗衣、健身房、门卫、电梯等"
- "优点和缺点分别是什么？"

### 🍜 Restaurant Reviews (`food`)

Share dining experiences with structured dimensions.

| Field | Type | Required | Description |
|---|---|---|---|
| title | string | Yes | One-line summary |
| restaurant_name | string | Yes | Restaurant name |
| overall_rating | number 1-5 | Yes | Overall rating |
| cuisine | string | Yes | Cuisine type |
| city | string | Yes | City |
| neighborhood | string | No | Area |
| address | string | No | Address |
| price_per_person | number (USD) | Yes | Average cost per person |
| taste_rating | number 1-5 | Yes | Taste rating |
| service_rating | number 1-5 | No | Service quality |
| environment_rating | number 1-5 | No | Dining environment |
| wait_time_minutes | number | No | Wait time in minutes |
| must_try | list | No | Recommended dishes |
| avoid | list | No | Dishes to avoid |
| review_text | text | No | Free-form review |
| date | date | Yes | Auto-fill today |
| author | string | No | Default: anonymous |

**Conversational prompts for food:**
- "请用一句话概括你的用餐体验"
- "餐厅叫什么名字？什么菜系？"
- "在哪个城市？"
- "人均大概多少钱？"
- "口味/服务/环境分别打几分？1-5分"
- "有什么推荐的菜？有踩雷的吗？"

### 💼 Job Interview Reviews (`jobs`)

Share interview experiences to help others prepare.

| Field | Type | Required | Description |
|---|---|---|---|
| title | string | Yes | One-line summary |
| company | string | Yes | Company name |
| position | string | Yes | Position applied for |
| city | string | No | Work location |
| overall_rating | number 1-5 | Yes | Interview experience rating |
| difficulty | number 1-5 | Yes | 1=easy, 5=very hard |
| result | enum | Yes | offer / reject / pending / ghosted / withdrew |
| salary_range | string | No | Compensation range |
| interview_rounds | number | Yes | Total rounds |
| interview_types | list | No | phone_screen, technical, behavioral, system_design, coding, take_home, onsite, panel |
| timeline_days | number | No | Days from application to result |
| tips | list | No | Advice for future candidates |
| review_text | text | No | Detailed interview experience |
| date | date | Yes | Auto-fill today |
| author | string | No | Default: anonymous |

**Conversational prompts for jobs:**
- "请用一句话概括这次面试经历"
- "哪家公司？什么职位？"
- "面试难度怎么样？1分很简单，5分很难"
- "最终结果是？拿到offer了吗？"
- "一共几轮面试？包含哪些类型？"
- "方便透露薪资范围吗？"
- "有什么建议给后面面试的人吗？"

---

## Search Reviews

### Quick search via index

```bash
python3 -c "
import json
with open('$OPENBOOK_DIR/_index.json') as f:
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
find $OPENBOOK_DIR/data/housing/ -name "*.json" -exec jq -r '
  select(.noise_level <= 2 and .rent_monthly <= 2500) |
  "\(.title) | $\(.rent_monthly)/mo | noise \(.noise_level)/5"
' {} \;

# 4+ star restaurants
find $OPENBOOK_DIR/data/food/ -name "*.json" -exec jq -r '
  select(.overall_rating >= 4) |
  "\(.restaurant_name) | \(.cuisine) | $\(.price_per_person)/person"
' {} \;

# Successful interviews at a specific company
find $OPENBOOK_DIR/data/jobs/ -name "*.json" -exec jq -r '
  select(.company == "Google" and .result == "offer") |
  "\(.position) | difficulty \(.difficulty)/5"
' {} \;
```

### Keyword search

```bash
grep -rl "keyword" $OPENBOOK_DIR/data/ --include="*.json"
```

---

## Publish a Review

### Step 1: Identify category

Ask the user what they want to review. Match to one of: `housing`, `food`, `jobs`.

### Step 2: Collect data conversationally

Use the conversational prompts listed above for the matching category. Go through
each required field. For optional fields, ask briefly and skip if the user declines.

**Rules:**
- Required fields MUST have valid answers
- Enum fields: present the friendly labels as options
- List fields: let user provide multiple items
- Date field: auto-fill with today's date
- Author: use "anonymous" if user doesn't want to share

### Step 3: Confirm with user

Show a formatted summary. Example for housing:

```
📝 你的租房评价摘要：
📍 East Village, New York | E 10th St
💰 $2,500/月 | 🛏 1BR | 🏠 装修：较新
⭐ 总评 4/5 | 🔇 噪音 2/5 | 👤 房东 4/5

确认发布吗？
```

### Step 4: Save as JSON

Generate a filename: `YYYYMMDD-slug-from-title.json`

```bash
cat > $OPENBOOK_DIR/data/{category}/{filename}.json << 'EOF'
{
  "_schema": "{category}",
  "_version": 1,
  "_id": "{filename}",
  ... all collected fields ...
}
EOF
```

### Step 5: Validate, index, and commit

```bash
cd $OPENBOOK_DIR
python3 scripts/validate.py .
python3 scripts/build_index.py .
git add data/ _index.json
git commit -m "Add {category} review: {title}"
git push origin main 2>/dev/null || echo "Saved locally. You can push later."
```

---

## Present Results

Format results as tables appropriate to the category:

| Category | Key Columns |
|---|---|
| Housing | Location, Rent, Rating, Noise, Renovation, Landlord |
| Food | Restaurant, Cuisine, Price/person, Rating, Taste |
| Jobs | Company, Position, Difficulty, Result, Salary |

Always offer to show full details of any specific review.

---

## Add a New Category

1. Create `$OPENBOOK_DIR/schemas/{name}.yml` following the existing schema format
2. Create `mkdir -p $OPENBOOK_DIR/data/{name}`
3. The skill automatically adapts to any new schema

---

## Links

- Website: https://openbook.now
- GitHub: https://github.com/josephliver623/OpenBook
- npm MCP Server: `npx openbook-mcp`
- Report issues: https://github.com/josephliver623/OpenBook/issues
