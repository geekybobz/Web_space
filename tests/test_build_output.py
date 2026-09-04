import json
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

from validate_site import validate_site  # noqa: E402


class BuildOutputTests(unittest.TestCase):
    def test_generated_site_is_complete(self):
        result = validate_site()
        self.assertGreaterEqual(result["html_files"], 2)

    def test_current_and_v1_are_content_equivalent_channels(self):
        current = json.loads((ROOT / "dist/api/profile/current/profile.json").read_text(encoding="utf-8"))
        v1 = json.loads((ROOT / "dist/api/profile/v1/profile.json").read_text(encoding="utf-8"))
        self.assertEqual(current, v1)
        self.assertEqual(current["schema_version"], "1.0.0")

    def test_website_content_is_rendered_from_profile(self):
        profile = json.loads((ROOT / "profile/data/projects.json").read_text(encoding="utf-8"))
        index = (ROOT / "dist/index.html").read_text(encoding="utf-8")
        for project in profile["items"]:
            self.assertIn(project["name"], index)


if __name__ == "__main__":
    unittest.main()
