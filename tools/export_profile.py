#!/usr/bin/env python3
"""Publish the profile contract as static, read-only API resources."""

import json
import shutil
from pathlib import Path

from validate_profile import validate_profile


ROOT = Path(__file__).resolve().parent.parent
PROFILE = ROOT / "profile"
API_ROOT = ROOT / "dist" / "api" / "profile"


def _write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def export_profile() -> None:
    validated = validate_profile()
    manifest = json.loads((PROFILE / "manifest.json").read_text(encoding="utf-8"))
    aggregate = {
        "schema_version": validated["schema_version"],
        "profile_id": validated["profile_id"],
        "resources": validated["resources"],
    }
    for channel in ("current", "v1"):
        target = API_ROOT / channel
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(PROFILE, target)
        _write_json(target / "profile.json", aggregate)
        _write_json(target / "index.json", {"manifest": "manifest.json", "aggregate": "profile.json"})


if __name__ == "__main__":
    export_profile()
