"""Service to call epic.authorize endpoints."""


class AuthService:
    """Handle service request for epic.authorize."""

    @staticmethod
    def get_epic_user_by_id(user_id: str):
        """Return the user representation from epic.authorize."""
        return {"first_name": "Dinesh", "last_name": "Balakrishnan", "user_id": user_id}
