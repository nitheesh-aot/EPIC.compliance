"""Constants."""
from .enum import PermissionEnum


AUTH_APP = "COMPLIANCE"
INPUT_DATE_TIME_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"
UNAPPROVED_PROJECT_NAME = "Unapproved Project"
UNAPPROVED_PROJECT_CODE = "UNPRVD"
GROUP_MAP = {
    PermissionEnum.SUPERUSER: "/COMPLIANCE/SUPERUSER",
    PermissionEnum.VIEWER: "/COMPLIANCE/VIEWER",
    PermissionEnum.USER: "/COMPLIANCE/USER",
    PermissionEnum.ADMIN: "/COMPLIANCE/ADMIN"
}
DELETE_DIC_PARAMS = {
    "is_active": False,
    "is_deleted": True
}
