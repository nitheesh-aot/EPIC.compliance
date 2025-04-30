"""Various test data for sections."""

from enum import Enum

from compliance_api.models import Section as SectionModel


class SectionScenario(Enum):
    """Section scenario."""

    section1 = {
        "name": "34",
        "act": 2002,
        "is_active": True,
        "is_deleted": False,
    }

    section2 = {
        "name": "45",
        "act": 2018,
        "is_active": True,
        "is_deleted": False,
    }

    @staticmethod
    def create(section_data: dict):
        """Create section."""
        section = SectionModel(**section_data)
        section.save()
        return section
