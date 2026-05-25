"""Tests for dept endpoints"""
import pytest


class TestDeptAPI:
    """Test department management API"""

    def test_dept_model_structure(self):
        """Test that dept model has correct structure"""
        from dbgpt_serve.security.models.dept import SysDept

        # Verify columns exist
        assert hasattr(SysDept, 'id')
        assert hasattr(SysDept, 'code')
        assert hasattr(SysDept, 'name')
        assert hasattr(SysDept, 'parent_id')
        assert hasattr(SysDept, 'level')
        assert hasattr(SysDept, 'sort')
        assert hasattr(SysDept, 'is_active')

    def test_dept_service_initialization(self):
        """Test that dept service can be initialized"""
        from dbgpt_serve.security.service.dept_service import SysDeptService

        service = SysDeptService()
        assert service._dao is not None

    def test_dept_dao_initialization(self):
        """Test that dept dao can be initialized"""
        from dbgpt_serve.security.dao.dept_dao import SysDeptDao

        dao = SysDeptDao()
        # DAO should be instantiated without error
        assert dao is not None