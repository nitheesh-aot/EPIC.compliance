"""Requirement source model."""
from .option_base_model import OptionModel


class RequirementSource(OptionModel):
    """Requirement source."""

    __tablename__ = "requirement_sources"
