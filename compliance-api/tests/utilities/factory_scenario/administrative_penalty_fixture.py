"""Fixtures for Administrative Penalty tests."""

import copy

import pytest

from compliance_api.models.administrative_penalty import (
    AdministrativePenalty, AdministrativePenaltyInspectionRequirementMap)
from tests.utilities.factory_scenario.administrative_penalty_scenario import AdministrativePenaltyScenario


@pytest.fixture
def created_administrative_penalty(
    created_inspection, created_inspection_requirement, session
):
    """Create and return an Administrative Penalty."""
    administrative_penalty_data = copy.copy(
        AdministrativePenaltyScenario.default_value.value
    )
    administrative_penalty_data["inspection_id"] = created_inspection.id
    administrative_penalty_data["issuing_officer_id"] = (
        created_inspection.primary_officer_id
    )
    administrative_penalty_data["inspection_requirement_ids"] = [
        created_inspection_requirement.id
    ]

    administrative_penalty = AdministrativePenalty.create_administrative_penalty(
        administrative_penalty_data
    )
    session.commit()
    return administrative_penalty


@pytest.fixture
def created_administrative_penalty_requirement_map(
    created_administrative_penalty, created_inspection_requirement, session
):
    """Create and return an Administrative Penalty Inspection Requirement Map."""
    administrative_penalty_requirement_map = (
        AdministrativePenaltyInspectionRequirementMap(
            administrative_penalty_id=created_administrative_penalty.id,
            inspection_requirement_id=created_inspection_requirement.id,
        )
    )
    administrative_penalty_requirement_map.save()
    session.commit()
    return administrative_penalty_requirement_map
