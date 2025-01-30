"""Service for inspection requirement type."""
from compliance_api.models import InspectionRequirementTypeEnum


class InspectionRequirementTypeService:
    """Inspection requirement service."""

    @classmethod
    def get_inspection_requirement_types(cls):
        """List all the inspection requirement types."""
        return [{"id": perm.name, "name": perm.value} for perm in InspectionRequirementTypeEnum]
