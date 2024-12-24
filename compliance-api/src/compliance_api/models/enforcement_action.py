"""EnforcementActionModel."""
from enum import Enum

from .option_base_model import OptionModel


class EnforcementActionOptionEnum(Enum):
    """EnforcementActionOptionEnum."""

    TO_BE_DETERMINED = 1
    NOT_APPLICABLE = 2
    NOTICE_OF_NON_COMPLIANCE = 3
    WARNING_LETTER = 4
    ORDER = 5
    REFERRAL_TO_ADMINISTRATIVE_PENALTY = 6
    REFERRAL_TO_ANOTHER_AGENCY = 7
    VIOLATION_TICKET = 8
    PROSECUTION_RECOMMENTDATAION = 10


class EnforcementActionOption(OptionModel):
    """Requirement source."""

    __tablename__ = "enforcement_action_options"
