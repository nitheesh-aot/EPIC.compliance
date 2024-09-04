"""Option kind model related to inspection."""
from ..option_base_model import OptionModel


class InspectionAttendanceOption(OptionModel):
    """Inspection attendance option categories."""

    __tablename__ = "inspection_attendance_options"


class IRTypeOption(OptionModel):
    """Inspection Record type options."""

    __tablename__ = "ir_type_options"


class InspectionInitiationOption(OptionModel):
    """Initiation options for creating an inspection."""

    __tablename__ = "inspection_initiation_options"


class IRStatusOption(OptionModel):
    """IR Status options."""

    __tablename__ = "ir_status_options"
