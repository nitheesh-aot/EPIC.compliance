"""Compliance finding model."""

from enum import Enum

from .option_base_model import OptionModel


class ComplianceFindingOptionEnum(Enum):
    """ComplianceFindingEnum."""

    IN = 1
    OUT = 2
    NOT_DETERMINED = 3


class ComplianceFindingOption(OptionModel):
    """ComplianceFinding."""

    __tablename__ = "compliance_finding_options"
