"""Test data for Administrative Penalty."""

from enum import Enum

from compliance_api.models.administrative_penalty import ReferralStatusEnum


class AdministrativePenaltyScenario(Enum):
    """Test data for Administrative Penalty."""

    default_value = {
        "inspection_id": None,  # Will be populated in the test
        "administrative_penalty_number": None,  # Will be auto-generated
        "referral_status": ReferralStatusEnum.DRAFTING.value,
        "date_referred": None,
        "decision_date": None,
        "decision": None,
        "issuing_officer_id": None,  # Will be populated in the test
        "inspection_requirement_ids": [],  # Will be populated in the test
    }
