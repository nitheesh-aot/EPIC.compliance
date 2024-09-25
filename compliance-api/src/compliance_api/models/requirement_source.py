"""Requirement source model."""
from enum import Enum

from .option_base_model import OptionModel


class RequirementSourceEnum(Enum):
    """RequirementSource Enum."""

    SCHEDULE_B = 1
    ORDER = 2
    EAC_CERTIFICATE = 3
    CERTIFIED_PROJECT_DESCRIPTION = 4
    ACT_2018 = 5
    COMPLIANCE_AGREEMENT = 6
    ACT_2002 = 7
    NOT_EA_ACT = 8


class RequirementSource(OptionModel):
    """Requirement source."""

    __tablename__ = "requirement_sources"
