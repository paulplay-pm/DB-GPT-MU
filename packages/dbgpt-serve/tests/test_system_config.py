"""Tests for system config Brand Config API."""

import sys
sys.path.insert(0, "packages")

import tempfile
import unittest
from unittest.mock import MagicMock, patch

from dbgpt_serve.system_config.service.brand_service import (
    BrandService,
    DEFAULT_BRAND_CONFIG,
    SERVE_SERVICE_COMPONENT_NAME,
)
from dbgpt_serve.system_config.models.models import SystemConfigEntity


class TestBrandService(unittest.TestCase):
    """Test cases for BrandService."""

    def setUp(self):
        """Set up test fixtures."""
        self.mock_system_app = MagicMock()
        self.mock_config = MagicMock()
        self.service = BrandService(self.mock_system_app, self.mock_config)
        self.service._dao = MagicMock()

    def test_get_brand_config_returns_defaults_when_empty(self):
        """Test GET returns defaults when no config exists."""
        self.service._dao.get_config.return_value = None
        result = self.service.get_brand_config()
        self.assertEqual(result["product_name_zh"], "DB-GPT")
        self.assertEqual(result["product_name_en"], "DB-GPT")
        self.assertEqual(result["slogan"], "开口问数，预见洞察")
        self.assertIsNone(result["logo_url"])

    def test_get_brand_config_returns_existing_data(self):
        """Test GET returns existing config data."""
        mock_entity = MagicMock()
        mock_entity.logo_url = "/uploads/logos/test.png"
        mock_entity.product_name_zh = "MyApp"
        mock_entity.product_name_en = "MyApp"
        mock_entity.slogan = "Hello World"
        self.service._dao.get_config.return_value = mock_entity

        result = self.service.get_brand_config()
        self.assertEqual(result["logo_url"], "/uploads/logos/test.png")
        self.assertEqual(result["product_name_zh"], "MyApp")
        self.assertEqual(result["product_name_en"], "MyApp")
        self.assertEqual(result["slogan"], "Hello World")

    def test_get_brand_config_uses_defaults_for_null_fields(self):
        """Test GET uses defaults when some fields are null."""
        mock_entity = MagicMock()
        mock_entity.logo_url = "/uploads/logos/test.png"
        mock_entity.product_name_zh = None
        mock_entity.product_name_en = None
        mock_entity.slogan = None
        self.service._dao.get_config.return_value = mock_entity

        result = self.service.get_brand_config()
        self.assertEqual(result["product_name_zh"], DEFAULT_BRAND_CONFIG["product_name_zh"])
        self.assertEqual(result["product_name_en"], DEFAULT_BRAND_CONFIG["product_name_en"])
        self.assertEqual(result["slogan"], DEFAULT_BRAND_CONFIG["slogan"])

    def test_update_brand_config_partial_update(self):
        """Test PUT accepts partial updates."""
        mock_entity = MagicMock()
        mock_entity.id = "brand"
        mock_entity.logo_url = "/old_logo.png"
        mock_entity.product_name_zh = "OldName"
        mock_entity.product_name_en = "OldName"
        mock_entity.slogan = "OldSlogan"
        self.service._dao.get_config.return_value = mock_entity
        self.service._dao.save_config.return_value = mock_entity

        # Only update slogan
        result = self.service.update_brand_config({"slogan": "NewSlogan"})

        # Verify save was called
        self.service._dao.save_config.assert_called_once()
        saved_entity = self.service._dao.save_config.call_args[0][0]
        self.assertEqual(saved_entity.slogan, "NewSlogan")
        # Other fields should not be changed
        self.assertEqual(saved_entity.logo_url, "/old_logo.png")

    def test_update_brand_config_creates_new_entity(self):
        """Test PUT creates new entity if none exists."""
        self.service._dao.get_config.return_value = None

        def mock_save(entity):
            entity.id = "brand"
            return entity

        self.service._dao.save_config.side_effect = mock_save

        result = self.service.update_brand_config({"product_name_zh": "NewName"})
        self.assertEqual(result["product_name_zh"], "NewName")

    def test_upload_logo_validates_file_type(self):
        """Test logo upload rejects invalid file types."""
        with self.assertRaises(Exception) as context:
            self.service.upload_logo(b"fake content", "test.txt")

        self.assertIn("Unsupported file type", str(context.exception))

    def test_upload_logo_validates_file_size(self):
        """Test logo upload rejects oversized files."""
        large_content = b"x" * (3 * 1024 * 1024)  # 3MB
        with self.assertRaises(Exception) as context:
            self.service.upload_logo(large_content, "test.png")

        self.assertIn("File too large", str(context.exception))

    def test_upload_logo_svg_success(self):
        """Test logo upload accepts SVG files."""
        content = b'<svg xmlns="http://www.w3.org/2000/svg"></svg>'
        result = self.service.upload_logo(content, "logo.svg")
        self.assertIn("/uploads/logos/", result)
        self.assertTrue(result.endswith(".svg"))

    def test_upload_logo_png_success(self):
        """Test logo upload accepts PNG files."""
        content = b"\x89PNG\r\n\x1a\n" + b"x" * 100
        result = self.service.upload_logo(content, "logo.png")
        self.assertIn("/uploads/logos/", result)
        self.assertTrue(result.endswith(".png"))

    def test_upload_logo_jpg_success(self):
        """Test logo upload accepts JPG files."""
        content = b"\xff\xd8\xff\xe0" + b"x" * 100
        result = self.service.upload_logo(content, "logo.jpg")
        self.assertIn("/uploads/logos/", result)
        self.assertTrue(result.endswith(".jpg"))


class TestDefaultBrandConfig(unittest.TestCase):
    """Test cases for default brand config constants."""

    def test_default_values_are_correct(self):
        """Test default brand config has expected values."""
        self.assertEqual(DEFAULT_BRAND_CONFIG["product_name_zh"], "DB-GPT")
        self.assertEqual(DEFAULT_BRAND_CONFIG["product_name_en"], "DB-GPT")
        self.assertEqual(DEFAULT_BRAND_CONFIG["slogan"], "开口问数，预见洞察")
        self.assertIsNone(DEFAULT_BRAND_CONFIG["logo_url"])


if __name__ == "__main__":
    unittest.main()