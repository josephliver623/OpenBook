#!/usr/bin/env python3
"""
build_index.py — Build the _index.json summary file from all review JSON files.

Usage:
    python3 build_index.py [repo_root]

If repo_root is not specified, uses the parent directory of this script.
"""

import json
import os
import sys
from pathlib import Path

# Fields to EXCLUDE from the index (long text fields)
EXCLUDE_FROM_INDEX = {"review_text", "tips", "pros", "cons", "must_try", "avoid"}


def build_index(repo_root: str) -> list[dict]:
    """Scan all JSON files in data/ and build a summary index."""
    data_dir = Path(repo_root) / "data"
    index = []

    if not data_dir.exists():
        print(f"Warning: data directory not found at {data_dir}")
        return index

    for category_dir in sorted(data_dir.iterdir()):
        if not category_dir.is_dir() or category_dir.name.startswith("."):
            continue

        for json_file in sorted(category_dir.glob("*.json")):
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    data = json.load(f)

                # Create index entry: all fields except long text ones
                entry = {}
                for key, value in data.items():
                    if key not in EXCLUDE_FROM_INDEX and value is not None:
                        entry[key] = value

                # Ensure meta fields exist
                if "_schema" not in entry:
                    entry["_schema"] = category_dir.name
                if "_id" not in entry:
                    entry["_id"] = json_file.stem

                index.append(entry)

            except (json.JSONDecodeError, IOError) as e:
                print(f"Warning: skipping {json_file}: {e}")

    # Sort by date descending
    index.sort(key=lambda x: x.get("date", ""), reverse=True)

    return index


def write_index(repo_root: str, index: list[dict]):
    """Write the index to _index.json."""
    index_path = Path(repo_root) / "_index.json"
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    print(f"Index built: {len(index)} entries -> {index_path}")


def print_stats(index: list[dict]):
    """Print summary statistics."""
    categories = {}
    for entry in index:
        cat = entry.get("_schema", "unknown")
        categories[cat] = categories.get(cat, 0) + 1

    print("\n--- OpenBook Stats ---")
    print(f"Total reviews: {len(index)}")
    for cat, count in sorted(categories.items()):
        print(f"  {cat}: {count}")
    print("----------------------")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        root = sys.argv[1]
    else:
        root = str(Path(__file__).parent.parent)

    index = build_index(root)
    write_index(root, index)
    print_stats(index)
