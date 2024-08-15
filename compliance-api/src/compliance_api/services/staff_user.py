"""Service for user management."""

from compliance_api.exceptions import ResourceExistsError, UnprocessableEntityError
from compliance_api.models import db
from compliance_api.models.db import session_scope
from compliance_api.models.staff_user import PERMISSION_MAP, PermissionEnum, StaffUser
from compliance_api.utils.constant import AUTH_APP

from .authorize_service.auth_service import AuthService


class StaffUserService:
    """User management service."""

    @classmethod
    def get_user_by_id(cls, user_id):
        """Get user by id."""
        staff_user = StaffUser.find_by_id(user_id)
        if staff_user:
            auth_user = AuthService.get_epic_user_by_guid(staff_user.auth_user_guid)
            staff_user = _set_permission_level_in_compliance_user_obj(
                staff_user, auth_user
            )
        return staff_user

    @classmethod
    def get_all_staff_users(cls):
        """Get all users."""
        # Get users from compliance database
        users = StaffUser.get_all()
        # Get compliance users from epic system
        auth_users = AuthService.get_epic_users_by_app()
        # Merge the two sets of users to set the permission in the result
        index_auth_users = {user["username"]: user for user in auth_users}
        for user in users:
            auth_user = index_auth_users.get(user.auth_user_guid, None)
            user = _set_permission_level_in_compliance_user_obj(user, auth_user)
        return users

    @classmethod
    def create_user(cls, user_data: dict):
        """Create user."""
        auth_user_guid = user_data.get("auth_user_guid", None)
        existing_staff_user = StaffUser.get_staff_user_by_auth_guid(auth_user_guid)
        if existing_staff_user:
            raise ResourceExistsError(
                f"User with auth guid {auth_user_guid} already exists"
            )
        auth_user = AuthService.get_epic_user_by_guid(auth_user_guid)
        if not auth_user:
            raise UnprocessableEntityError(
                f"No user found from EPIC.Authorize corresponding to the given {auth_user_guid}"
            )
        user_obj = _create_staff_user_object(user_data, auth_user)
        group_payload = {
            "app_name": AUTH_APP,
            "group_name": user_data.get("permission", None),
        }
        with session_scope() as session:
            created_user = StaffUser.create_user(user_obj, session)
            AuthService.update_user_group(auth_user_guid, group_payload)
        return created_user

    @classmethod
    def update_user(cls, user_id, user_data):
        """Update staff user."""
        auth_user_guid = user_data.get("auth_user_guid", None)
        auth_user = AuthService.get_epic_user_by_guid(auth_user_guid)
        if not auth_user:
            raise UnprocessableEntityError(
                f"No user found from EPIC.Authorize corresponding to the given {auth_user_guid}"
            )
        user_obj = _create_staff_user_object(user_data, auth_user)
        group_payload = {
            "app_name": AUTH_APP,
            "group_name": user_data.get("permission", None),
        }
        with session_scope() as session:
            updated_user = StaffUser.update_user(user_id, user_obj, session)
            AuthService.update_user_group(auth_user_guid, group_payload)
            setattr(updated_user, "permission", user_data.get("permission"))
        return updated_user

    @classmethod
    def delete_user(cls, user_id, commit=True):
        """Update user."""
        user = StaffUser.find_by_id(user_id)
        if not user or user.is_deleted:
            return None

        user.is_deleted = True
        user.flush()
        if commit:
            db.session.commit()
        return user

    @classmethod
    def get_permission_levels(cls):
        """List all the permission levels."""
        return [
            {"id": perm.name, "name": PERMISSION_MAP[perm]} for perm in PermissionEnum
        ]


def _create_staff_user_object(user_data: dict, auth_user: dict):
    """Create a staff user object."""
    return {
        "first_name": auth_user.get("first_name", None),
        "last_name": auth_user.get("last_name", None),
        "position_id": user_data.get("position_id", None),
        "deputy_director_id": user_data.get("deputy_director_id"),
        "supervisor_id": user_data.get("supervisor_id", None),
        "auth_user_guid": auth_user.get("id", None),
    }


def _get_level(group):
    """Get the level from the group, defaulting to 0 if not valid."""
    # Safely retrieve the level attribute and default to 0 if not valid
    level_str = group.get("attributes", {}).get("level", [0])[0]
    try:
        return int(level_str)
    except (ValueError, TypeError):
        return 0


def _set_permission_level_in_compliance_user_obj(
    compliance_user: StaffUser, auth_user: dict
) -> StaffUser:
    """Set the permission level in compliance user."""
    if auth_user and auth_user.get("groups", None):
        sorted_groups = sorted(auth_user.get("groups", None), key=_get_level)
        if sorted_groups[0] and sorted_groups[0]["name"]:
            setattr(compliance_user, "permission", sorted_groups[0]["name"])
    return compliance_user
