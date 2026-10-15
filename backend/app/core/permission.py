class Permission:
    TENANT_MANAGE = "tenant:manage"
    ROLE_MANAGE = "role:manage"
    USER_MANAGE = "user:manage"


PERMISSION_CATALOG = [
    {"code": Permission.USER_MANAGE, "name": "用户管理", "group": "系统管理"},
    {"code": Permission.ROLE_MANAGE, "name": "角色管理", "group": "系统管理"},
    {"code": Permission.TENANT_MANAGE, "name": "租户管理", "group": "系统管理"},
]
