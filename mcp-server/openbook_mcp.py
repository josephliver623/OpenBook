#!/usr/bin/env python3
"""
OpenBook MCP Server
===================
A Model Context Protocol server that provides tools for searching and
publishing structured community reviews in an OpenBook repository.

Usage:
  python openbook_mcp.py                    # auto-detect repo in cwd or parent
  python openbook_mcp.py /path/to/openbook  # specify repo path
  OPENBOOK_REPO=/path/to/repo python openbook_mcp.py  # via env var

Requires: pip install "mcp[cli]" pyyaml
"""

import json
import os
import sys
import glob
import re
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


# ─── MCP Tools ───

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
        # Fallback: load directly from files
        schemas = load_schemas()
        for cat_name in schemas:
            index.extend(load_reviews(cat_name))

    results = []
    for item in index:
        # Category filter
        if category and item.get("_schema") != category:
            continue
        # Rating filter
        if min_rating > 0 and item.get("overall_rating", 0) < min_rating:
            continue
        # Price filter
        if max_price > 0:
            price = item.get("rent_monthly") or item.get("price_per_person") or 0
            if price > max_price:
                continue
        # City filter
        if city and city.lower() not in (item.get("city", "") or "").lower():
            continue
        # Keyword search
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

        # Category-specific details
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

        # Pros/cons
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


@mcp.tool()
async def stats() -> str:
    """Get statistics about this OpenBook instance.

    Returns the total number of reviews per category and overall stats.
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

    lines.insert(1, f"**Total reviews:** {total}\n")
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


# ─── Entry Point ───

def main():
    print(f"OpenBook MCP Server starting...", file=sys.stderr)
    print(f"Repository: {REPO}", file=sys.stderr)
    print(f"Schemas: {list(load_schemas().keys())}", file=sys.stderr)
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
