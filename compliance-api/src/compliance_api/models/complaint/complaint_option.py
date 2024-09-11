"Complaint Options."
from ..option_base_model import OptionModel


class ComplaintSource(OptionModel):
    """ComplaintSource model."""

    __tablename__ = "complaint_sources"


class RequirementSource(OptionModel):
    """Requirement source"""

    __tablename__ = "complaint_requirement_sources"
