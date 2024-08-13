"""Service for user management."""

from compliance_api.exceptions import ResourceExistsError, UnprocessableEntityError
from compliance_api.models import db
from compliance_api.models.db import session_scope
from compliance_api.models.staff_user import PERMISSION_MAP, PermissionEnum
from compliance_api.models.staff_user import StaffUser as UserModel
from compliance_api.utils.constant import AUTH_APP

from .authorize_service.auth_service import AuthService


class StaffUserService:
    """User management service."""

    @classmethod
    def get_user_by_id(cls, user_id):
        """Get user by id."""
        staff_user = UserModel.find_by_id(user_id)
        return staff_user

    @classmethod
    def get_all_users(cls):
        """Get all users."""
        users = UserModel.get_all()
        return users

    @classmethod
    def create_user(cls, user_data: dict):
        """Create user."""
        auth_user_guid = user_data.get("auth_user_guid", None)
        existing_staff_user = UserModel.get_staff_user_by_auth_guid(auth_user_guid)
        if existing_staff_user:
            raise ResourceExistsError(f"User with auth guid {auth_user_guid} already exists")
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
            created_user = UserModel.create_user(user_obj, session)
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
            updated_user = UserModel.update_user(user_id, user_obj, session)
            AuthService.update_user_group(auth_user_guid, group_payload)
            setattr(updated_user, "permission", user_data.get("permission"))
        return updated_user

    @classmethod
    def delete_user(cls, user_id, commit=True):
        """Update user."""
        user = UserModel.find_by_id(user_id)
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
