"""Service for managing Inspection."""

from compliance_api.models.inspection import InspectionAttendanceOption as InspectionAttendanceOptionModel
from compliance_api.models.inspection import InspectionInitiationOption as InspectionInitiationOptionModel
from compliance_api.models.inspection import IRStatusOption as IRStatusOptionModel
from compliance_api.models.inspection import IRTypeOption as IRTypeOptionModel


class InspectionService:
    """Inspection Service Class."""

    @classmethod
    def get_attendance_options(cls):
        """Get inspection attendance options."""
        return InspectionAttendanceOptionModel.get_all(sort_by="sort_order")

    @classmethod
    def get_ir_type_options(cls):
        """Get inspection record type options."""
        return IRTypeOptionModel.get_all(sort_by="sort_order")

    @classmethod
    def get_initiation_options(cls):
        """Get inspection initiation options."""
        return InspectionInitiationOptionModel.get_all(sort_by="sort_order")

    @classmethod
    def get_ir_status_options(cls):
        """Get inspection record status options."""
        return IRStatusOptionModel.get_all(sort_by="sort_order")
