"""Various test data for topics."""

from enum import Enum

from faker import Faker

from compliance_api.models import StaffUser as StaffUserModel


fake = Faker()


class StaffScenario(Enum):
    """Staff scenario."""

    default_data = {
        "first_name": fake.word(),
        "last_name": fake.word(),
        "position_id": 1,
        "auth_user_guid": fake.word(),
    }

    @staticmethod
    def create(data: dict) -> StaffUserModel:
        """Create staff user."""
        user = StaffUserModel.create_staff(data)
        print("staff user created")
        return user
