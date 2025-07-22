"""Test suite for administrative penalties."""

import copy
import json
from http import HTTPStatus
from urllib.parse import urljoin

from compliance_api.models.administrative_penalty import AdministrativePenalty as AdministrativePenaltyModel
from compliance_api.models.administrative_penalty import ReferralStatusEnum, DecisionEnum
from tests.utilities.factory_scenario.administrative_penalty_scenario import AdministrativePenaltyScenario


API_BASE_URL = "/api/administrative-penalties/"


def test_get_administrative_penalties(client, auth_header_super_user, created_inspection, created_administrative_penalty):
    """Test getting all administrative penalties for an inspection."""
    url = f"{API_BASE_URL}?inspection_id={created_inspection.id}"
    result = client.get(url, headers=auth_header_super_user)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) == 1
    assert isinstance(result.json, list)


def test_get_administrative_penalties_without_inspection_id(
    client, auth_header_super_user, created_administrative_penalty
):
    """Test getting all administrative penalties without specifying an inspection ID."""
    url = API_BASE_URL
    result = client.get(url, headers=auth_header_super_user)
    assert result.status_code == HTTPStatus.OK
    assert isinstance(result.json, list)
    assert len(result.json) >= 1


def test_get_administrative_penalty_by_id(client, auth_header_super_user, created_administrative_penalty, session):
    """Test getting administrative penalty by ID."""
    url = urljoin(API_BASE_URL, f"{created_administrative_penalty.id}")
    result = client.get(url, headers=auth_header_super_user)
    assert result.status_code == HTTPStatus.OK
    assert result.json["id"] == created_administrative_penalty.id


def test_get_administrative_penalty_by_invalid_id(client, auth_header_super_user):
    """Test getting administrative penalty by invalid ID."""
    url = urljoin(API_BASE_URL, "9999")
    result = client.get(url, headers=auth_header_super_user)
    assert result.status_code == HTTPStatus.NOT_FOUND


def test_get_administrative_penalty_by_number(client, auth_header_super_user, created_administrative_penalty, session):
    """Test getting administrative penalty by administrative penalty number."""
    url = urljoin(API_BASE_URL, f"penalty-numbers/{created_administrative_penalty.administrative_penalty_number}")
    result = client.get(url, headers=auth_header_super_user)
    assert result.status_code == HTTPStatus.OK
    assert result.json["id"] == created_administrative_penalty.id


def test_get_administrative_penalty_by_invalid_number(client, auth_header_super_user):
    """Test getting administrative penalty by invalid administrative penalty number."""
    url = urljoin(API_BASE_URL, "penalty-numbers/INVALID-PENALTY-NUMBER")
    result = client.get(url, headers=auth_header_super_user)
    assert result.status_code == HTTPStatus.NOT_FOUND


def test_create_administrative_penalty(client, auth_header_super_user, created_inspection, created_inspection_requirement, session):
    """Test creating a new administrative penalty."""
    url = API_BASE_URL
    penalty_data = copy.copy(AdministrativePenaltyScenario.default_value.value)
    penalty_data["inspection_id"] = created_inspection.id
    penalty_data["issuing_officer_id"] = created_inspection.primary_officer_id
    penalty_data["inspection_requirement_ids"] = [created_inspection_requirement.id]

    result = client.post(
        url,
        data=json.dumps(penalty_data),
        headers=auth_header_super_user,
    )
    assert result.status_code == HTTPStatus.CREATED
    assert result.json["inspection_id"] == created_inspection.id
    assert result.json["administrative_penalty_number"] is not None
    assert result.json["referral_status"] == ReferralStatusEnum.DRAFTING.value


def test_create_administrative_penalty_with_invalid_inspection_id(client, auth_header_super_user):
    """Test creating a new administrative penalty with invalid inspection ID."""
    url = API_BASE_URL
    penalty_data = copy.copy(AdministrativePenaltyScenario.default_value.value)
    penalty_data["inspection_id"] = 9999
    penalty_data["issuing_officer_id"] = 1
    penalty_data["inspection_requirement_ids"] = [1]

    result = client.post(
        url,
        data=json.dumps(penalty_data),
        headers=auth_header_super_user,
    )
    assert result.status_code == HTTPStatus.NOT_FOUND


def test_update_administrative_penalty(client, auth_header_super_user, created_administrative_penalty, session):
    """Test updating an administrative penalty."""
    url = urljoin(API_BASE_URL, f"{created_administrative_penalty.id}")
    penalty_data = {
        "referral_status": ReferralStatusEnum.DEPUTY_REVIEW.value,
        "date_referred": "2023-01-01T00:00:00",
        "decision": DecisionEnum.AP_ISSUED.value,
        "decision_date": "2023-01-15T00:00:00",
        "penalty_amount": 1000.00,
    }

    result = client.put(
        url,
        data=json.dumps(penalty_data),
        headers=auth_header_super_user,
    )
    assert result.status_code == HTTPStatus.OK
    assert result.json["referral_status"] == ReferralStatusEnum.DEPUTY_REVIEW.value
    assert "2023-01-01" in result.json["date_referred"]
    assert result.json["decision"] == DecisionEnum.AP_ISSUED.value
    assert "2023-01-15" in result.json["decision_date"]
    assert result.json["penalty_amount"] == "1000.00"


def test_update_administrative_penalty_with_invalid_id(client, auth_header_super_user, created_inspection):
    """Test updating a non-existent administrative penalty."""
    url = urljoin(API_BASE_URL, "9999")
    penalty_data = {
        "referral_status": ReferralStatusEnum.DEPUTY_REVIEW.value,
    }

    result = client.put(
        url,
        data=json.dumps(penalty_data),
        headers=auth_header_super_user,
    )
    assert result.status_code == HTTPStatus.NOT_FOUND


def test_delete_administrative_penalty(client, auth_header_super_user, created_administrative_penalty, session):
    """Test deleting an administrative penalty."""
    url = urljoin(API_BASE_URL, f"{created_administrative_penalty.id}")
    result = client.delete(url, headers=auth_header_super_user)
    assert result.status_code == HTTPStatus.NO_CONTENT

    # Verify it's deleted
    result = client.get(url, headers=auth_header_super_user)
    assert result.status_code == HTTPStatus.NOT_FOUND


def test_delete_administrative_penalty_with_invalid_id(client, auth_header_super_user):
    """Test deleting a non-existent administrative penalty."""
    url = urljoin(API_BASE_URL, "9999")
    result = client.delete(url, headers=auth_header_super_user)
    assert result.status_code == HTTPStatus.NOT_FOUND


def test_patch_referral_status(client, auth_header_super_user, created_administrative_penalty, session):
    """Test patching referral status of an administrative penalty."""
    url = urljoin(API_BASE_URL, f"{created_administrative_penalty.id}/referral-status")
    patch_data = {
        "referral_status": ReferralStatusEnum.REFERRED_TO_DM.value,
        "date_referred": "2023-02-01T00:00:00",
    }

    result = client.patch(
        url,
        data=json.dumps(patch_data),
        headers=auth_header_super_user,
    )
    assert result.status_code == HTTPStatus.OK
    assert result.json["referral_status"] == ReferralStatusEnum.REFERRED_TO_DM.value
    assert "2023-02-01" in result.json["date_referred"]


def test_patch_referral_status_with_invalid_id(client, auth_header_super_user):
    """Test patching referral status of a non-existent administrative penalty."""
    url = urljoin(API_BASE_URL, "9999/referral-status")
    patch_data = {
        "referral_status": ReferralStatusEnum.REFERRED_TO_DM.value,
    }

    result = client.patch(
        url,
        data=json.dumps(patch_data),
        headers=auth_header_super_user,
    )
    assert result.status_code == HTTPStatus.NOT_FOUND


def test_patch_decision(client, auth_header_super_user, created_administrative_penalty, session):
    """Test patching decision of an administrative penalty."""
    url = urljoin(API_BASE_URL, f"{created_administrative_penalty.id}/decision")
    patch_data = {
        "decision": DecisionEnum.AP_ISSUED.value,
        "decision_date": "2023-03-01T00:00:00",
        "penalty_amount": 2000.00,
    }

    result = client.patch(
        url,
        data=json.dumps(patch_data),
        headers=auth_header_super_user,
    )
    assert result.status_code == HTTPStatus.OK
    assert result.json["decision"] == DecisionEnum.AP_ISSUED.value
    assert "2023-03-01" in result.json["decision_date"]
    assert result.json["penalty_amount"] == "2000.00"


def test_patch_decision_with_invalid_id(client, auth_header_super_user):
    """Test patching decision of a non-existent administrative penalty."""
    url = urljoin(API_BASE_URL, "9999/decision")
    patch_data = {
        "decision": DecisionEnum.AP_ISSUED.value,
    }

    result = client.patch(
        url,
        data=json.dumps(patch_data),
        headers=auth_header_super_user,
    )
    assert result.status_code == HTTPStatus.NOT_FOUND


def test_patch_decision_without_penalty_amount(client, auth_header_super_user, created_administrative_penalty):
    """Test patching decision without providing penalty_amount."""
    url = urljoin(API_BASE_URL, f"{created_administrative_penalty.id}/decision")
    patch_data = {
        "decision": DecisionEnum.AP_ISSUED.value,
        "decision_date": "2023-03-01T00:00:00",
        # penalty_amount is intentionally omitted
    }

    result = client.patch(
        url,
        data=json.dumps(patch_data),
        headers=auth_header_super_user,
    )
    # Should fail validation
    assert result.status_code == HTTPStatus.BAD_REQUEST


def test_reset_administrative_penalty_field(client, auth_header_super_user, created_administrative_penalty, session):
    """Test resetting a field in an administrative penalty."""
    # First update the administrative penalty to have values to reset
    ap = AdministrativePenaltyModel.find_by_id(created_administrative_penalty.id)
    ap.decision = DecisionEnum.AP_ISSUED
    ap.decision_date = "2023-03-15"
    ap.penalty_amount = 3000.00
    ap.save()
    session.commit()

    # Now reset the fields
    url = urljoin(API_BASE_URL, f"{created_administrative_penalty.id}/reset")
    reset_data = {
        "fields": ["decision", "decision_date", "penalty_amount"]
    }

    result = client.patch(
        url,
        data=json.dumps(reset_data),
        headers=auth_header_super_user,
    )
    assert result.status_code == HTTPStatus.OK
    assert result.json["decision"] is None
    assert result.json["decision_date"] is None
    assert result.json["penalty_amount"] is None


def test_reset_administrative_penalty_field_with_invalid_id(client, auth_header_super_user):
    """Test resetting a field in a non-existent administrative penalty."""
    url = urljoin(API_BASE_URL, "9999/reset")
    reset_data = {
        "fields": ["decision", "decision_date"]
    }

    result = client.patch(
        url,
        data=json.dumps(reset_data),
        headers=auth_header_super_user,
    )
    assert result.status_code == HTTPStatus.NOT_FOUND
