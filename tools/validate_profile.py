#!/usr/bin/env python3
"""Validate the public profile contract without requiring third-party packages."""

import json
import re
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parent.parent
PROFILE = ROOT / "profile"
ID_PATTERN = re.compile(r"^[a-z][a-z0-9-]*\.[a-z0-9][a-z0-9.-]*$")
PRIVATE_FIELD_NAMES = {"address", "date_of_birth", "passport", "phone", "private_email", "visa"}


class ProfileValidationError(ValueError):
    pass


def _load(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ProfileValidationError(f"Cannot read valid JSON from {path.relative_to(ROOT)}: {exc}") from exc


def _required(payload: dict, required: list[str], label: str, errors: list[str]) -> None:
    for field in required:
        if field not in payload:
            errors.append(f"{label}: missing required field {field!r}")


def _resolve_ref(root_schema: dict, reference: str) -> dict:
    if not reference.startswith("#/"):
        raise ProfileValidationError(f"Only local schema references are supported: {reference}")
    value = root_schema
    for part in reference[2:].split("/"):
        value = value[part.replace("~1", "/").replace("~0", "~")]
    return value


def _validate_schema(value, schema: dict, root_schema: dict, label: str, errors: list[str]) -> None:
    if "$ref" in schema:
        _validate_schema(value, _resolve_ref(root_schema, schema["$ref"]), root_schema, label, errors)
        return
    expected = schema.get("type")
    type_matches = {
        "object": isinstance(value, dict),
        "array": isinstance(value, list),
        "string": isinstance(value, str),
        "integer": isinstance(value, int) and not isinstance(value, bool),
        "number": isinstance(value, (int, float)) and not isinstance(value, bool),
        "boolean": isinstance(value, bool),
    }
    if expected and not type_matches.get(expected, True):
        errors.append(f"{label}: expected {expected}, got {type(value).__name__}")
        return
    if "const" in schema and value != schema["const"]:
        errors.append(f"{label}: expected constant {schema['const']!r}")
    if "enum" in schema and value not in schema["enum"]:
        errors.append(f"{label}: {value!r} is not one of {schema['enum']!r}")
    if isinstance(value, str):
        if len(value) < schema.get("minLength", 0):
            errors.append(f"{label}: string is shorter than {schema['minLength']}")
        if schema.get("pattern") and not re.search(schema["pattern"], value):
            errors.append(f"{label}: {value!r} does not match {schema['pattern']!r}")
        if schema.get("format") == "email" and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value):
            errors.append(f"{label}: invalid email address")
        if schema.get("format") == "uri" and not urlsplit(value).scheme:
            errors.append(f"{label}: invalid absolute URI")
    if isinstance(value, (int, float)) and "minimum" in schema and value < schema["minimum"]:
        errors.append(f"{label}: value is below minimum {schema['minimum']}")
    if isinstance(value, list):
        if len(value) < schema.get("minItems", 0):
            errors.append(f"{label}: array has fewer than {schema['minItems']} items")
        if schema.get("uniqueItems"):
            serialized = [json.dumps(item, sort_keys=True, ensure_ascii=False) for item in value]
            if len(serialized) != len(set(serialized)):
                errors.append(f"{label}: array items must be unique")
        item_schema = schema.get("items")
        if item_schema:
            for index, item in enumerate(value):
                _validate_schema(item, item_schema, root_schema, f"{label}[{index}]", errors)
    if isinstance(value, dict):
        required = schema.get("required", [])
        _required(value, required, label, errors)
        if len(value) < schema.get("minProperties", 0):
            errors.append(f"{label}: object has fewer than {schema['minProperties']} properties")
        properties = schema.get("properties", {})
        additional = schema.get("additionalProperties", True)
        for key, child in value.items():
            if key in properties:
                _validate_schema(child, properties[key], root_schema, f"{label}.{key}", errors)
            elif additional is False:
                errors.append(f"{label}: unexpected field {key!r}")
            elif isinstance(additional, dict):
                _validate_schema(child, additional, root_schema, f"{label}.{key}", errors)


def _walk_references(value, label: str):
    if isinstance(value, dict):
        for key, child in value.items():
            if key.endswith("_ref") and isinstance(child, str):
                yield label + "." + key, child
            elif key.endswith("_refs") and isinstance(child, list):
                for ref in child:
                    if isinstance(ref, str):
                        yield label + "." + key, ref
            yield from _walk_references(child, label + "." + key)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from _walk_references(child, f"{label}[{index}]")


def _walk_fields(value, label: str):
    if isinstance(value, dict):
        for key, child in value.items():
            yield label, key, child
            yield from _walk_fields(child, label + "." + key)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from _walk_fields(child, f"{label}[{index}]")


def validate_profile() -> dict:
    errors: list[str] = []
    manifest = _load(PROFILE / "manifest.json")
    manifest_schema = _load(PROFILE / "schemas" / "manifest.schema.json")
    _validate_schema(manifest, manifest_schema, manifest_schema, "manifest", errors)
    resources = manifest.get("resources", {})
    if not resources:
        errors.append("manifest: resources must not be empty")

    loaded: dict[str, object] = {}
    identifiers: dict[str, str] = {}
    for resource_name, descriptor in resources.items():
        for field in ("path", "schema", "cardinality"):
            if field not in descriptor:
                errors.append(f"manifest.resources.{resource_name}: missing {field!r}")
        if errors and not all(field in descriptor for field in ("path", "schema", "cardinality")):
            continue
        data_path = (PROFILE / descriptor["path"]).resolve()
        schema_path = (PROFILE / descriptor["schema"]).resolve()
        try:
            data_path.relative_to(PROFILE.resolve())
            schema_path.relative_to(PROFILE.resolve())
        except ValueError:
            errors.append(f"{resource_name}: resource paths must stay inside profile/")
            continue
        payload = _load(data_path)
        schema = _load(schema_path)
        _validate_schema(payload, schema, schema, resource_name, errors)
        if descriptor["cardinality"] == "many":
            items = payload.get("items")
            if not isinstance(items, list):
                errors.append(f"{resource_name}: cardinality 'many' requires an items array")
                continue
            item_required = schema.get("properties", {}).get("items", {}).get("items", {}).get("required", [])
            for index, item in enumerate(items):
                if not isinstance(item, dict):
                    errors.append(f"{resource_name}[{index}]: item must be an object")
                    continue
                label = f"{resource_name}[{index}]"
                _required(item, item_required, label, errors)
                identifier = item.get("id")
                if not isinstance(identifier, str) or not ID_PATTERN.fullmatch(identifier):
                    errors.append(f"{label}: invalid stable id {identifier!r}")
                elif identifier in identifiers:
                    errors.append(f"{label}: duplicate id {identifier!r}, first used by {identifiers[identifier]}")
                else:
                    identifiers[identifier] = label
                if item.get("visibility") != "public" and resource_name != "skills":
                    errors.append(f"{label}: canonical repository data must be explicitly public")
            loaded[resource_name] = items
        elif descriptor["cardinality"] == "one":
            loaded[resource_name] = payload
        else:
            errors.append(f"{resource_name}: unsupported cardinality {descriptor['cardinality']!r}")

        for label, key, child in _walk_fields(payload, resource_name):
            if key in PRIVATE_FIELD_NAMES:
                errors.append(f"{label}: private field {key!r} is not allowed in the public profile")
            if isinstance(child, str) and re.search(r"<\s*/?\s*[a-zA-Z][^>]*>", child):
                errors.append(f"{label}.{key}: profile text must not contain HTML")

    known_ids = set(identifiers)
    for resource_name, payload in loaded.items():
        for label, reference in _walk_references(payload, resource_name):
            if reference not in known_ids:
                errors.append(f"{label}: unresolved reference {reference!r}")

    if errors:
        raise ProfileValidationError("Profile validation failed:\n- " + "\n- ".join(errors))
    return {"profile_id": manifest["profile_id"], "schema_version": manifest["schema_version"], "resources": loaded, "id_count": len(identifiers)}


def main() -> None:
    result = validate_profile()
    print(f"Profile valid: {result['profile_id']} ({result['id_count']} stable IDs, schema {result['schema_version']})")


if __name__ == "__main__":
    main()
