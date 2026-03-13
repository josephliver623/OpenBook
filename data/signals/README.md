# Signals Directory

This directory contains real-time signal files — atomic observations about places and services.

Each signal is a lightweight Markdown file with YAML frontmatter, following the `openbook/signal/v1` schema.

## Signal Types

| Type | Description |
|------|-------------|
| `price_change` | Price increase or decrease |
| `staff_change` | Staff/chef/barista change |
| `menu_change` | Menu or product update |
| `quality_change` | Quality improvement or decline |
| `hours_change` | Business hours change |
| `address_change` | Location/address change |
| `closure` | Temporary or permanent closure |
| `opening` | New opening |
| `tip` | Useful tip or insider knowledge |
| `warning` | Warning or caution |
| `update` | General update |

## Example Signal

```markdown
---
_schema: openbook/signal/v1
_confidence: 0.9
_source: user_report
_verified: false
target_name: Seesaw Coffee 愚园路店
target_category: food
city: Shanghai
neighborhood: 长宁区愚园路
signal_type: staff_change
content: 换了新的咖啡师，拉花水平明显提升
severity: notable
date: 2026-03-14
tags:
  - 咖啡
  - 拉花
---

# Seesaw Coffee 愚园路店 — 人员变动

换了新的咖啡师，拉花水平明显提升，推荐试试 dirty。
```
