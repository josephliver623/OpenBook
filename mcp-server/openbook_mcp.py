#!/usr/bin/env python3
"""
OpenBook MCP Server
===================
A Model Context Protocol server that provides tools for searching and
publishing structured community reviews AND real-time Signals in an
OpenBook repository.

Usage:
  python openbook_mcp.py                    # auto-detect repo in cwd or parent
  python openbook_mcp.py /path/to/openbook  # specify repo path
  OPENBOOK_REPO=/path/to/repo python openbook_mcp.py  # via env var

Requires: pip install "mcp[cli]" pyyaml
"""

import json
import os
import sys
import re
import string
import random
from datetime import date
from pathlib import Path
from typing import Any

import yaml

try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    print("Error: MCP SDK not installed. Run: pip install 'mcp[cli]'", file=sys.stderr)
    sys.exit(1)

# ─── Repo Discovery ───

def find_repo() -> Path:
    """Find the OpenBook repo root by looking for schemas/ directory."""
    # 1. CLI argument
    if len(sys.argv) > 1 and Path(sys.argv[1]).is_dir():
        return Path(sys.argv[1]).resolve()
    # 2. Environment variable
    env_path = os.environ.get("OPENBOOK_REPO")
    if env_path and Path(env_path).is_dir():
        return Path(env_path).resolve()
    # 3. Walk up from cwd
    p = Path.cwd()
    for _ in range(5):
        if (p / "schemas").is_dir() and (p / "SKILL.md").exists():
            return p
        p = p.parent
    # 4. Default to cwd
    return Path.cwd()


REPO = find_repo()
mcp = FastMCP("openbook")


# ─── Helpers ───

def load_schemas() -> dict[str, dict]:
    """Load all YAML schemas from the schemas/ directory."""
    schemas = {}
    schema_dir = REPO / "schemas"
    if not schema_dir.exists():
        return schemas
    for f in schema_dir.glob("*.yml"):
        with open(f, "r", encoding="utf-8") as fh:
            schema = yaml.safe_load(fh)
            if schema and "name" in schema:
                schemas[schema["name"]] = schema
    return schemas


def load_index() -> list[dict]:
    """Load the _index.json file if it exists."""
    idx_path = REPO / "_index.json"
    if idx_path.exists():
        with open(idx_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def load_reviews(category: str) -> list[dict]:
    """Load all reviews for a given category."""
    data_dir = REPO / "data" / category
    reviews = []
    if not data_dir.exists():
        return reviews
    for f in sorted(data_dir.glob("*.json")):
        with open(f, "r", encoding="utf-8") as fh:
            try:
                reviews.append(json.load(fh))
            except json.JSONDecodeError:
                continue
    return reviews


def slugify(text: str, max_len: int = 40) -> str:
    """Create a URL-friendly slug from text."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text[:max_len]


def random_id(length: int = 10) -> str:
    """Generate a random alphanumeric ID."""
    chars = string.ascii_letters + string.digits
    return "".join(random.choices(chars, k=length))


# ─── Signal Helpers ───

def parse_signal_md(filepath: Path) -> dict | None:
    """Parse a Signal Markdown file with YAML frontmatter."""
    try:
        content = filepath.read_text(encoding="utf-8")
    except Exception:
        return None

    # Extract YAML frontmatter
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)", content, re.DOTALL)
    if not match:
        return None

    try:
        meta = yaml.safe_load(match.group(1))
    except yaml.YAMLError:
        return None

    if not isinstance(meta, dict):
        return None

    body = match.group(2).strip()
    meta["_body"] = body
    meta["_filename"] = filepath.stem
    return meta


def load_signals() -> list[dict]:
    """Load all Signal files from data/signals/."""
    signals_dir = REPO / "data" / "signals"
    signals = []
    if not signals_dir.exists():
        return signals
    for f in sorted(signals_dir.glob("*.md"), reverse=True):
        if f.name == "README.md":
            continue
        sig = parse_signal_md(f)
        if sig:
            signals.append(sig)
    return signals


def signal_to_markdown(data: dict) -> str:
    """Convert a Signal data dict to Markdown with YAML frontmatter."""
    # Separate body content from frontmatter fields
    body_content = data.get("content", "")
    target_name = data.get("target_name", "Unknown")
    signal_type = data.get("signal_type", "update")

    # Signal type display names
    type_labels = {
        "update": "一般更新",
        "price_change": "价格变动",
        "closure": "关店",
        "new_opening": "新开",
        "quality_change": "品质变化",
        "warning": "警告",
        "recommendation": "推荐",
        "event": "活动/事件",
    }
    type_label = type_labels.get(signal_type, signal_type)

    # Build frontmatter
    fm = {
        "_schema": "openbook/signal/v1",
        "_version": 1,
        "_confidence": data.get("_confidence", 0.8),
        "_source": data.get("_source", "user_report"),
        "_verified": False,
        "_access": "public",
        "target_name": target_name,
        "target_category": data.get("target_category", "general"),
        "city": data.get("city", ""),
        "neighborhood": data.get("neighborhood", ""),
        "signal_type": signal_type,
        "content": body_content,
        "severity": data.get("severity", "info"),
        "date": data.get("date", date.today().isoformat()),
        "tags": data.get("tags", []),
    }

    # Optional fields
    if data.get("district"):
        fm["district"] = data["district"]
    if data.get("subcategory"):
        fm["subcategory"] = data["subcategory"]
    if data.get("address"):
        fm["address"] = data["address"]
    if data.get("price"):
        fm["price"] = data["price"]
    if data.get("price_unit"):
        fm["price_unit"] = data["price_unit"]
    if data.get("suitable_for"):
        fm["suitable_for"] = data["suitable_for"]

    yaml_str = yaml.dump(fm, allow_unicode=True, default_flow_style=False, sort_keys=False)
    title = f"# {target_name} — {type_label}"
    body = body_content

    return f"---\n{yaml_str}---\n{title}\n\n{body}\n"


# ─── MCP Tools (Reviews) ───

@mcp.tool()
async def list_categories() -> str:
    """List all available review categories in this OpenBook instance.

    Returns a formatted list of categories with their display names,
    descriptions, and available fields.
    """
    schemas = load_schemas()
    if not schemas:
        return "No categories found. Make sure the schemas/ directory exists."

    lines = ["# Available Categories\n"]
    for name, schema in schemas.items():
        display = schema.get("display_name", name)
        desc = schema.get("description", "")
        icon = schema.get("icon", "")
        fields = schema.get("fields", {})
        required = [k for k, v in fields.items() if v.get("required")]
        optional = [k for k, v in fields.items() if not v.get("required")]

        lines.append(f"## {icon} {display} (`{name}`)")
        lines.append(f"{desc}\n")
        lines.append(f"- Required fields: {', '.join(required)}")
        lines.append(f"- Optional fields: {', '.join(optional)}")
        lines.append("")

    return "\n".join(lines)


@mcp.tool()
async def get_schema(category: str) -> str:
    """Get the full schema definition for a review category.

    Args:
        category: Category name (e.g., 'housing', 'food', 'jobs')

    Returns the YAML schema with all field definitions, types, constraints,
    and agent prompts for collecting data from users.
    """
    schemas = load_schemas()
    if category not in schemas:
        available = ", ".join(schemas.keys())
        return f"Category '{category}' not found. Available: {available}"

    schema = schemas[category]
    return yaml.dump(schema, allow_unicode=True, default_flow_style=False, sort_keys=False)


@mcp.tool()
async def search_reviews(
    category: str = "",
    query: str = "",
    min_rating: float = 0,
    max_price: float = 0,
    city: str = "",
    limit: int = 10,
) -> str:
    """Search reviews across all categories or within a specific category.

    Args:
        category: Filter by category (e.g., 'housing', 'food', 'jobs'). Empty = all.
        query: Free-text keyword search across all fields.
        min_rating: Minimum overall_rating filter (1-5). 0 = no filter.
        max_price: Maximum price filter (rent_monthly or price_per_person). 0 = no filter.
        city: Filter by city name (case-insensitive partial match).
        limit: Maximum number of results to return (default 10).

    Returns matching reviews formatted as a readable list.
    """
    index = load_index()
    if not index:
        schemas = load_schemas()
        for cat_name in schemas:
            index.extend(load_reviews(cat_name))

    results = []
    for item in index:
        if category and item.get("_schema") != category:
            continue
        if min_rating > 0 and item.get("overall_rating", 0) < min_rating:
            continue
        if max_price > 0:
            price = item.get("rent_monthly") or item.get("price_per_person") or 0
            if price > max_price:
                continue
        if city and city.lower() not in (item.get("city", "") or "").lower():
            continue
        if query:
            text = json.dumps(item, ensure_ascii=False).lower()
            if query.lower() not in text:
                continue
        results.append(item)

    results = results[:limit]

    if not results:
        return "No reviews found matching your criteria."

    lines = [f"# Search Results ({len(results)} found)\n"]
    for r in results:
        schema = r.get("_schema", "unknown")
        title = r.get("title", "Untitled")
        rating = r.get("overall_rating", "?")
        city_val = r.get("city", "")
        neighborhood = r.get("neighborhood", "")
        location = f"{neighborhood}, {city_val}" if neighborhood else city_val

        lines.append(f"### {title}")
        lines.append(f"**Category:** {schema} | **Rating:** {'★' * int(rating)}{'☆' * (5 - int(rating))} ({rating}/5) | **Location:** {location}")

        if schema == "housing":
            rent = r.get("rent_monthly", "?")
            noise = r.get("noise_level", "?")
            reno = r.get("renovation", "?")
            lines.append(f"**Rent:** ${rent}/mo | **Noise:** {noise}/5 | **Renovation:** {reno}")
        elif schema == "food":
            cuisine = r.get("cuisine", "?")
            price = r.get("price_per_person", "?")
            taste = r.get("taste_rating", "?")
            lines.append(f"**Cuisine:** {cuisine} | **Price:** ${price}/person | **Taste:** {taste}/5")
        elif schema == "jobs":
            company = r.get("company", "?")
            position = r.get("position", "?")
            result = r.get("result", "?")
            lines.append(f"**Company:** {company} | **Position:** {position} | **Result:** {result}")

        pros = r.get("pros", [])
        cons = r.get("cons", [])
        if pros:
            lines.append(f"**Pros:** {', '.join(pros[:3])}")
        if cons:
            lines.append(f"**Cons:** {', '.join(cons[:3])}")
        lines.append("")

    return "\n".join(lines)


@mcp.tool()
async def get_review(category: str, review_id: str) -> str:
    """Get the full details of a specific review.

    Args:
        category: The review category (e.g., 'housing', 'food', 'jobs')
        review_id: The review ID (filename without .json extension)

    Returns the complete review data formatted for reading.
    """
    file_path = REPO / "data" / category / f"{review_id}.json"
    if not file_path.exists():
        return f"Review not found: {category}/{review_id}"

    with open(file_path, "r", encoding="utf-8") as f:
        review = json.load(f)

    lines = [f"# {review.get('title', 'Untitled')}\n"]
    for key, value in review.items():
        if key.startswith("_"):
            continue
        if isinstance(value, list):
            value = ", ".join(str(v) for v in value)
        lines.append(f"**{key}:** {value}")

    return "\n".join(lines)


@mcp.tool()
async def publish_review(category: str, data_json: str) -> str:
    """Publish a new review to the OpenBook repository.

    Before calling this tool, you MUST:
    1. Call get_schema() to understand the required fields
    2. Collect all required fields from the user via conversation
    3. Validate the data matches the schema constraints

    Args:
        category: The review category (e.g., 'housing', 'food', 'jobs')
        data_json: A JSON string containing all review fields.
                   Must include all required fields defined in the schema.
                   Do NOT include meta fields (_schema, _version, _id).

    Returns a confirmation message with the saved file path.
    """
    schemas = load_schemas()
    if category not in schemas:
        available = ", ".join(schemas.keys())
        return f"Error: Category '{category}' not found. Available: {available}"

    schema = schemas[category]
    try:
        data = json.loads(data_json)
    except json.JSONDecodeError as e:
        return f"Error: Invalid JSON - {e}"

    # Validate required fields
    fields = schema.get("fields", {})
    missing = []
    for field_name, field_def in fields.items():
        if field_def.get("required") and field_name not in data:
            if field_def.get("auto") == "today" and field_name == "date":
                data["date"] = date.today().isoformat()
            elif "default" in field_def:
                data[field_name] = field_def["default"]
            else:
                missing.append(field_name)

    if missing:
        prompts = []
        for m in missing:
            prompt = fields[m].get("agent_prompt", f"Please provide {m}")
            prompts.append(f"- **{m}**: {prompt}")
        return f"Error: Missing required fields:\n" + "\n".join(prompts)

    # Auto-fill date if needed
    if "date" not in data:
        data["date"] = date.today().isoformat()

    # Generate ID
    title_slug = slugify(data.get("title", category))
    review_id = f"{date.today().strftime('%Y%m%d')}-{title_slug}"

    # Add meta fields
    data["_schema"] = category
    data["_version"] = 1
    data["_id"] = review_id

    # Save
    data_dir = REPO / "data" / category
    data_dir.mkdir(parents=True, exist_ok=True)
    file_path = data_dir / f"{review_id}.json"

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return (
        f"Review published successfully!\n"
        f"- **File:** data/{category}/{review_id}.json\n"
        f"- **Title:** {data.get('title', 'N/A')}\n"
        f"- **Rating:** {data.get('overall_rating', 'N/A')}/5\n\n"
        f"To share with the community, commit and push:\n"
        f"```\n"
        f"git add data/ && git commit -m 'Add {category} review: {data.get('title', review_id)}' && git push\n"
        f"```"
    )


# ─── MCP Tools (Signals) ───

@mcp.tool()
async def list_signals(
    city: str = "",
    category: str = "",
    target: str = "",
    signal_type: str = "",
    suitable_for: str = "",
    limit: int = 20,
) -> str:
    """List recent Signals — real-time, lightweight updates about places and businesses.

    Signals are different from Reviews: they capture time-sensitive changes like
    price updates, closures, new openings, quality changes, etc. Think of them
    as a "heartbeat" of a place, while Reviews are "snapshots".

    Args:
        city: Filter by city (e.g., 'Shanghai', 'New York'). Case-insensitive.
        category: Filter by target_category (e.g., 'food', 'housing', 'shopping').
        target: Filter by target_name (partial match, case-insensitive).
        signal_type: Filter by type: update, price_change, closure, new_opening,
                     quality_change, warning, recommendation, event.
        suitable_for: Filter by audience: backpacker, family, kids, pets, couple,
                      solo, business, vegetarian, halal, accessible.
        limit: Maximum number of results (default 20).

    Returns Signals sorted by date (newest first).
    """
    signals = load_signals()

    results = []
    for sig in signals:
        if city and city.lower() not in (sig.get("city", "") or "").lower():
            continue
        if category and category.lower() != (sig.get("target_category", "") or "").lower():
            continue
        if target and target.lower() not in (sig.get("target_name", "") or "").lower():
            continue
        if signal_type and signal_type.lower() != (sig.get("signal_type", "") or "").lower():
            continue
        if suitable_for:
            sig_suitable = sig.get("suitable_for", [])
            if isinstance(sig_suitable, list) and suitable_for.lower() not in [s.lower() for s in sig_suitable]:
                continue
        results.append(sig)
        if len(results) >= limit:
            break

    if not results:
        return "No Signals found matching your criteria."

    # Severity emoji mapping
    sev_emoji = {"info": "ℹ️", "notable": "📌", "important": "⚠️", "critical": "🚨"}
    type_emoji = {
        "update": "🔄", "price_change": "💰", "closure": "🚫",
        "new_opening": "🆕", "quality_change": "📊", "warning": "⚠️",
        "recommendation": "👍", "event": "🎉",
    }

    lines = [f"# Signals ({len(results)} found)\n"]
    for sig in results:
        name = sig.get("target_name", "Unknown")
        sig_date = sig.get("date", "?")
        stype = sig.get("signal_type", "update")
        severity = sig.get("severity", "info")
        city_val = sig.get("city", "")
        neighborhood = sig.get("neighborhood", "")
        location = f"{neighborhood}, {city_val}" if neighborhood else city_val
        content = sig.get("content", "")
        filename = sig.get("_filename", "")

        te = type_emoji.get(stype, "📝")
        se = sev_emoji.get(severity, "")

        lines.append(f"### {te} {name} {se}")
        lines.append(f"**Date:** {sig_date} | **Type:** {stype} | **Location:** {location}")

        if sig.get("suitable_for"):
            suitable = ", ".join(sig["suitable_for"]) if isinstance(sig["suitable_for"], list) else sig["suitable_for"]
            lines.append(f"**Suitable for:** {suitable}")
        if sig.get("price"):
            unit = sig.get("price_unit", "CNY")
            lines.append(f"**Price:** {sig['price']} {unit}")

        lines.append(f"{content}")
        if sig.get("tags"):
            tags = ", ".join(sig["tags"][:5]) if isinstance(sig["tags"], list) else sig["tags"]
            lines.append(f"**Tags:** {tags}")
        lines.append(f"**ID:** {filename}")
        lines.append("")

    return "\n".join(lines)


@mcp.tool()
async def get_signal(signal_id: str) -> str:
    """Get the full details of a specific Signal by its ID.

    Args:
        signal_id: The Signal ID (filename without .md extension,
                   e.g., '2026-03-14-C9TcSUJR8B')

    Returns the complete Signal data including all metadata.
    """
    file_path = REPO / "data" / "signals" / f"{signal_id}.md"
    if not file_path.exists():
        return f"Signal not found: {signal_id}"

    sig = parse_signal_md(file_path)
    if not sig:
        return f"Error parsing Signal: {signal_id}"

    lines = [f"# Signal: {sig.get('target_name', 'Unknown')}\n"]
    skip_keys = {"_body", "_filename"}
    for key, value in sig.items():
        if key in skip_keys:
            continue
        if isinstance(value, list):
            value = ", ".join(str(v) for v in value)
        lines.append(f"**{key}:** {value}")

    lines.append(f"\n---\n{sig.get('_body', '')}")
    return "\n".join(lines)


@mcp.tool()
async def publish_signal(
    target_name: str,
    content: str,
    target_category: str = "general",
    city: str = "",
    neighborhood: str = "",
    signal_type: str = "update",
    severity: str = "info",
    tags: str = "",
    suitable_for: str = "",
    district: str = "",
    price: float = 0,
    price_unit: str = "CNY",
) -> str:
    """Publish a new Signal — a real-time, lightweight update about a place.

    Use this when the user mentions a time-sensitive observation about a place,
    business, or service. Signals are NOT full reviews — they capture moments:
    "this place just raised prices", "new chef is great", "closed for renovation".

    Args:
        target_name: Name of the place/business (e.g., 'Starbucks Reserve Roastery')
        content: The Signal content — what happened or was observed.
        target_category: Category: food, housing, shopping, transport, service, general.
        city: City name (e.g., 'Shanghai', 'New York').
        neighborhood: Neighborhood or area (e.g., '愚园路', 'East Village').
        signal_type: Type of signal: update, price_change, closure, new_opening,
                     quality_change, warning, recommendation, event.
        severity: Importance: info (routine), notable (worth knowing),
                  important (significant change), critical (urgent).
        tags: Comma-separated tags (e.g., 'coffee,cold brew,quiet').
        suitable_for: Comma-separated audience tags: backpacker, family, kids,
                      pets, couple, solo, business, vegetarian, halal, accessible.
        district: Administrative district (e.g., '静安区', '徐汇区').
        price: Price amount (0 = not specified).
        price_unit: Currency unit (default: CNY).

    Returns a confirmation with the saved file path.
    """
    # Build Signal data
    sig_data = {
        "target_name": target_name,
        "content": content,
        "target_category": target_category,
        "city": city,
        "neighborhood": neighborhood,
        "signal_type": signal_type,
        "severity": severity,
        "date": date.today().isoformat(),
        "tags": [t.strip() for t in tags.split(",") if t.strip()] if tags else [],
        "_confidence": 0.8,
        "_source": "user_report",
    }

    if suitable_for:
        sig_data["suitable_for"] = [s.strip() for s in suitable_for.split(",") if s.strip()]
    if district:
        sig_data["district"] = district
    if price > 0:
        sig_data["price"] = price
        sig_data["price_unit"] = price_unit

    # Generate filename
    sig_id = f"{date.today().isoformat()}-{random_id()}"

    # Convert to Markdown
    md_content = signal_to_markdown(sig_data)

    # Save
    signals_dir = REPO / "data" / "signals"
    signals_dir.mkdir(parents=True, exist_ok=True)
    file_path = signals_dir / f"{sig_id}.md"
    file_path.write_text(md_content, encoding="utf-8")

    return (
        f"Signal published successfully!\n"
        f"- **File:** data/signals/{sig_id}.md\n"
        f"- **Target:** {target_name}\n"
        f"- **Type:** {signal_type}\n"
        f"- **City:** {city}\n\n"
        f"To share with the community, commit and push:\n"
        f"```\n"
        f"git add data/signals/ && git commit -m 'Signal: {target_name} ({signal_type})' && git push\n"
        f"```"
    )


@mcp.tool()
async def stats() -> str:
    """Get statistics about this OpenBook instance.

    Returns the total number of reviews per category, plus Signal statistics.
    """
    schemas = load_schemas()
    lines = ["# OpenBook Statistics\n"]
    total = 0
    for name, schema in schemas.items():
        reviews = load_reviews(name)
        count = len(reviews)
        total += count
        display = schema.get("display_name", name)
        icon = schema.get("icon", "")
        lines.append(f"- {icon} **{display}** ({name}): {count} reviews")

    # Signal stats
    signals = load_signals()
    signal_count = len(signals)
    total += signal_count

    # Signal breakdown by type
    type_counts: dict[str, int] = {}
    city_counts: dict[str, int] = {}
    for sig in signals:
        stype = sig.get("signal_type", "update")
        type_counts[stype] = type_counts.get(stype, 0) + 1
        city = sig.get("city", "Unknown")
        if city:
            city_counts[city] = city_counts.get(city, 0) + 1

    lines.append(f"- ⚡ **Signals**: {signal_count} signals")
    if type_counts:
        type_str = ", ".join(f"{k}: {v}" for k, v in sorted(type_counts.items(), key=lambda x: -x[1]))
        lines.append(f"  - By type: {type_str}")
    if city_counts:
        city_str = ", ".join(f"{k}: {v}" for k, v in sorted(city_counts.items(), key=lambda x: -x[1])[:5])
        lines.append(f"  - By city: {city_str}")

    lines.insert(1, f"**Total entries:** {total} ({total - signal_count} reviews + {signal_count} signals)\n")
    return "\n".join(lines)


# ─── MCP Resources ───

@mcp.resource("openbook://index")
async def get_index() -> str:
    """The full review index for fast searching."""
    index = load_index()
    return json.dumps(index, ensure_ascii=False, indent=2)


@mcp.resource("openbook://schemas")
async def get_all_schemas() -> str:
    """All category schemas in one document."""
    schemas = load_schemas()
    return yaml.dump(schemas, allow_unicode=True, default_flow_style=False)


@mcp.resource("openbook://signals")
async def get_all_signals() -> str:
    """All Signals as a JSON array for programmatic access."""
    signals = load_signals()
    # Remove _body to keep it compact
    clean = []
    for sig in signals:
        s = {k: v for k, v in sig.items() if k != "_body"}
        clean.append(s)
    return json.dumps(clean, ensure_ascii=False, indent=2)


# ─── Entry Point ───

def main():
    print(f"OpenBook MCP Server starting...", file=sys.stderr)
    print(f"Repository: {REPO}", file=sys.stderr)
    print(f"Schemas: {list(load_schemas().keys())}", file=sys.stderr)
    print(f"Signals: {len(load_signals())}", file=sys.stderr)
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
