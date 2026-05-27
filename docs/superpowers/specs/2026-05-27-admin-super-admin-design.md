# Admin Super Admin Design

## Goal

Give the admin user (login_name='admin', password='Admin123!') full menu permissions by setting `is_super_admin=TRUE`.

## Background

The frontend `PermissionContext` checks `userInfo.is_super_admin` and returns `true` for all `hasPermission()` calls when true. This bypasses all permission code checks, giving the user access to all menus.

## Change

**Database:**
```sql
UPDATE sys_user SET is_super_admin = TRUE WHERE login_name = 'admin';
```

## Verification

1. Run SQL: `UPDATE sys_user SET is_super_admin = TRUE WHERE login_name = 'admin';`
2. Re-login as admin with password `Admin123!`
3. Verify all admin menus appear: 用户管理, 角色管理, 部门管理, 审核用户

## Implementation

- Execute single SQL statement
- No code changes required
- No spec document needed for future reference (trivial one-time fix)

## Status

**COMPLETE** - Implementation is just running the SQL above.