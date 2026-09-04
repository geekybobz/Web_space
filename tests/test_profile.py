import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

from profile_site import load_profile  # noqa: E402
from validate_profile import validate_profile  # noqa: E402


class ProfileContractTests(unittest.TestCase):
    def test_profile_contract_and_references_are_valid(self):
        result = validate_profile()
        self.assertEqual(result["profile_id"], "mohammed-bilal-ps")
        self.assertGreater(result["id_count"], 0)

    def test_manifest_driven_loader_exposes_heterogeneous_resources(self):
        profile = load_profile()
        self.assertIsInstance(profile["person"], dict)
        self.assertIsInstance(profile["projects"], list)
        self.assertNotEqual(set(profile["person"]), set(profile["projects"][0]))


if __name__ == "__main__":
    unittest.main()
