#!/usr/bin/env python3
"""
build_index.py — Build the _index.json summary file from all data files.

Supports:
  - .md files with YAML frontmatter (Signal format)
  - .json files (legacy Review format)

Usage:
    python3 build_index.py [repo_root]
"""
import json
import os
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    yaml = None

# Fields to EXCLUDE from the index (long text fields for JSON reviews)
EXCLUDE_FROM_INDEX = {"review_text", "tips", "pros", "cons", "must_try", "avoid"}


def parse_md_frontmatter(filepath):
    """Extract YAML frontmatter from a Markdown file."""
    try:
        content = filepath.read_text(encoding="utf-8")
    except (IOError, UnicodeDecodeError) as e:
        print("  Warning: cannot read {}: {}".format(filepath, e))
        return None

    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return None

    raw_yaml = match.group(1)

    if yaml:
        try:
            return yaml.safe_load(raw_yaml)
        except yaml.YAMLError as e:
            print("  Warning: YAML parse error in {}: {}".format(filepath, e))
            return None
    else:
        # Fallback: simple key-value extraction without PyYAML
        meta = {}
        for line in raw_yaml.split("\n"):
            line = line.strip()
            if not line or line.startswith("#") or line.startswith("-"):
                continue
            if ":" in line:
                key, _, value = line.partition(":")
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if value:
                    meta[key] = value
        return meta


def build_signal_entry(meta, filepath, rel_path):
    """Build an index entry from a Signal .md file's frontmatter."""
    # Normalize date: yaml.safe_load may parse ISO dates as datetime objects
    date_val = meta.get("date", "")
    if hasattr(date_val, "isoformat"):
        date_val = date_val.isoformat()
    else:
        date_val = str(date_val) if date_val else ""

    # Resolve target_name from multiple possible fields
    target_name = meta.get("target_name") or meta.get("community_name") or meta.get("name") or meta.get("title", "")
    target_category = meta.get("target_category") or meta.get("schema", "")

    entry = {
        "_schema": meta.get("_schema", "openbook/signal/v1"),
        "_id": "signals/" + filepath.stem,
        "target_name": target_name,
        "target_category": target_category,
        "signal_type": meta.get("signal_type", ""),
        "city": meta.get("city", ""),
        "date": date_val,
        "severity": meta.get("severity", "info"),
        "content": meta.get("content", ""),
        "file": rel_path,
    }

    # Include optional string fields
    for field in [
        "subcategory", "district", "neighborhood", "address",
        "price_context", "sentiment",
    ]:
        if meta.get(field):
            entry[field] = meta[field]

    # Numeric fields
    price = meta.get("price")
    if price and isinstance(price, (int, float)) and price > 0:
        entry["price"] = price
        if meta.get("price_unit"):
            entry["price_unit"] = meta["price_unit"]

    # List fields
    for field in ["tags", "suitable_for", "recommendations", "warnings"]:
        val = meta.get(field)
        if val and isinstance(val, list) and len(val) > 0:
            entry[field] = val

    # Object fields
    if meta.get("rating_info"):
        entry["rating_info"] = meta["rating_info"]

    return entry


def build_index(repo_root):
    """Scan all data files and build a summary index."""
    data_dir = Path(repo_root) / "data"
    entries = []

    if not data_dir.exists():
        print("Warning: data directory not found at " + str(data_dir))
        return entries

    # Walk all subdirectories
    for dirpath, dirnames, filenames in os.walk(str(data_dir)):
        dirnames.sort()
        for filename in sorted(filenames):
            filepath = Path(dirpath) / filename
            rel_path = str(filepath.relative_to(repo_root))

            if filename == "README.md":
                continue

            if filename.endswith(".md"):
                meta = parse_md_frontmatter(filepath)
                if meta is None:
                    continue

                entry = build_signal_entry(meta, filepath, rel_path)

                # Also check summary/description as fallback for content
                if not entry.get("content"):
                    entry["content"] = meta.get("summary") or meta.get("description") or ""
                if not entry.get("target_name"):
                    entry["target_name"] = meta.get("institution") or meta.get("_id") or ""
                if entry.get("target_name") or entry.get("content"):
                    entries.append(entry)
                else:
                    print("  Skipping {}: no target_name or content".format(rel_path))

            elif filename.endswith(".json"):
                try:
                    with open(str(filepath), "r", encoding="utf-8") as f:
                        data = json.load(f)
                    entry = {}
                    for key, value in data.items():
                        if key not in EXCLUDE_FROM_INDEX and value is not None:
                            entry[key] = value
                    if "_schema" not in entry:
                        entry["_schema"] = filepath.parent.name
                    if "_id" not in entry:
                        entry["_id"] = filepath.stem
                    entries.append(entry)
                except (json.JSONDecodeError, IOError) as e:
                    print("  Warning: skipping {}: {}".format(rel_path, e))

    # Sort by date descending
    entries.sort(key=lambda x: str(x.get("date", "")), reverse=True)
    return entries


def write_index(repo_root, entries):
    """Write the index to _index.json."""
    index_path = Path(repo_root) / "_index.json"

    # Write as object with signals key for backward compatibility
    output = {"signals": entries}
    with open(str(index_path), "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print("Index built: {} entries -> {}".format(len(entries), index_path))


def print_stats(entries):
    """Print summary statistics."""
    categories = {}
    cities = set()
    for entry in entries:
        cat = entry.get("target_category", "unknown")
        categories[cat] = categories.get(cat, 0) + 1
        city = entry.get("city", "")
        if city:
            cities.add(city)

    print("\n--- OpenBook Stats ---")
    print("Total entries: {}".format(len(entries)))
    print("Cities: {} ({})".format(len(cities), ", ".join(sorted(cities))))
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print("  {}: {}".format(cat, count))
    print("----------------------")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        root = sys.argv[1]
    else:
        root = str(Path(__file__).parent.parent)

    entries = build_index(root)
    write_index(root, entries)
    print_stats(entries)
