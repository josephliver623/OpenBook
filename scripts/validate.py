#!/usr/bin/env python3
"""
validate.py — Validate review JSON files against their YAML schemas.

Usage:
    python3 validate.py [repo_root]
    python3 validate.py [repo_root] [specific_file.json]

Exit code 0 = all valid, 1 = errors found.
"""

import json
import os
import sys
from pathlib import Path

import yaml


def load_schema(schema_path: str) -> dict:
    """Load and parse a YAML schema file."""
    with open(schema_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def validate_entry(data: dict, schema: dict, filepath: str) -> list[str]:
    """Validate a single JSON entry against its schema. Returns list of errors."""
    errors = []
    fields = schema.get("fields", {})

    # Check required fields
    for field_name, field_def in fields.items():
        if field_def.get("auto"):
            continue  # auto fields are OK to be missing during validation

        if field_def.get("required", False):
            if field_name not in data or data[field_name] is None:
                errors.append(f"Missing required field: {field_name}")
                continue

        if field_name not in data or data[field_name] is None:
            continue  # optional field not present, OK

        value = data[field_name]
        field_type = field_def.get("type", "string")

        # Type checks
        if field_type == "number":
            if not isinstance(value, (int, float)):
                errors.append(f"Field '{field_name}' should be a number, got {type(value).__name__}")
            else:
                if "min" in field_def and value < field_def["min"]:
                    errors.append(f"Field '{field_name}' value {value} below minimum {field_def['min']}")
                if "max" in field_def and value > field_def["max"]:
                    errors.append(f"Field '{field_name}' value {value} above maximum {field_def['max']}")

        elif field_type == "string":
            if not isinstance(value, str):
                errors.append(f"Field '{field_name}' should be a string, got {type(value).__name__}")
            elif "enum" in field_def and value not in field_def["enum"]:
                errors.append(f"Field '{field_name}' value '{value}' not in allowed values: {field_def['enum']}")

        elif field_type == "list":
            if not isinstance(value, list):
                errors.append(f"Field '{field_name}' should be a list, got {type(value).__name__}")
            elif "options" in field_def:
                for item in value:
                    if item not in field_def["options"]:
                        errors.append(f"Field '{field_name}' contains invalid option: '{item}'")

        elif field_type == "date":
            if not isinstance(value, str):
                errors.append(f"Field '{field_name}' should be a date string")

        elif field_type == "text":
            if not isinstance(value, str):
                errors.append(f"Field '{field_name}' should be text, got {type(value).__name__}")

    # Check for _schema meta field
    if "_schema" not in data:
        errors.append("Missing meta field: _schema")

    return errors


def main():
    if len(sys.argv) > 1:
        root = sys.argv[1]
    else:
        root = str(Path(__file__).parent.parent)

    specific_file = sys.argv[2] if len(sys.argv) > 2 else None

    # Load all schemas
    schemas_dir = Path(root) / "schemas"
    schemas = {}
    for schema_file in schemas_dir.glob("*.yml"):
        schema = load_schema(str(schema_file))
        schemas[schema["name"]] = schema

    if not schemas:
        print("No schemas found!")
        sys.exit(1)

    print(f"Loaded {len(schemas)} schemas: {', '.join(schemas.keys())}")

    # Validate data files
    data_dir = Path(root) / "data"
    total_files = 0
    total_errors = 0
    all_errors = []

    if specific_file:
        files_to_check = [Path(specific_file)]
    else:
        files_to_check = list(data_dir.rglob("*.json"))

    for json_file in sorted(files_to_check):
        total_files += 1
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            all_errors.append((str(json_file), [f"Cannot read file: {e}"]))
            total_errors += 1
            continue

        # Determine schema
        schema_name = data.get("_schema", json_file.parent.name)
        if schema_name not in schemas:
            all_errors.append((str(json_file), [f"Unknown schema: {schema_name}"]))
            total_errors += 1
            continue

        errors = validate_entry(data, schemas[schema_name], str(json_file))
        if errors:
            all_errors.append((str(json_file), errors))
            total_errors += len(errors)

    # Report
    print(f"\nValidated {total_files} files")
    if all_errors:
        print(f"\n❌ Found {total_errors} errors in {len(all_errors)} files:\n")
        for filepath, errors in all_errors:
            print(f"  {filepath}:")
            for error in errors:
                print(f"    - {error}")
        sys.exit(1)
    else:
        print("✅ All files valid!")
        sys.exit(0)


if __name__ == "__main__":
    main()
