"""Test suite for appendix."""

import copy
import json
from http import HTTPStatus
from urllib.parse import urljoin

from faker import Faker

from compliance_api.services import AppendixService
from tests.utilities.factory_scenario import AppendixScenario


API_BASE_URL = "/api/"
fake = Faker()


def test_create_appendix(client, auth_header_super_user, created_inspection):
    """Create appendix with basic fields."""
    url = urljoin(API_BASE_URL, "appendices")
    appendix_data = copy.copy(AppendixScenario.default_value.value)
    appendix_data["inspection_id"] = created_inspection.id

    result = client.post(
        url,
        data=json.dumps(appendix_data),
        headers=auth_header_super_user,
    )
    assert result.status_code == HTTPStatus.CREATED
    assert result.json["inspection_id"] == created_inspection.id

    # Verify the appendix was actually created
    created_appendix = AppendixService.get_by_id(result.json["id"])
    assert created_appendix is not None
    assert created_appendix.inspection_id == created_inspection.id


def test_create_appendix_with_invalid_inspection(
    app, client, auth_header_super_user, mock_track_service
):
    """Create appendix with invalid inspection id."""
    url = urljoin(API_BASE_URL, "appendices")
    appendix_data = copy.copy(AppendixScenario.default_value.value)
    appendix_data["inspection_id"] = 99999

    result = client.post(
        url,
        data=json.dumps(appendix_data),
        headers=auth_header_super_user,
    )
    assert result.status_code == HTTPStatus.NOT_FOUND


def test_get_appendices_by_inspection_id(
    app, client, auth_header_super_user, created_inspection, mocker
):
    """Get appendices by inspection id."""
    # Verify we can get the created appendix
    _create_appendix(client, auth_header_super_user, created_inspection, mocker)

    url = urljoin(API_BASE_URL, f"appendices?inspection_id={created_inspection.id}")
    result = client.get(url, headers=auth_header_super_user)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) > 0


def test_get_all_appendices(
    app, client, auth_header_super_user, created_inspection, mocker
):
    """Get all appendices."""
    contains_role = mocker.patch("compliance_api.auth.jwt.contains_role")
    contains_role.return_value = True

    # Verify we can get the created appendix
    created_appendix = _create_appendix(
        client, auth_header_super_user, created_inspection, mocker
    )

    result = client.get(
        urljoin(API_BASE_URL, "appendices"), headers=auth_header_super_user
    )
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) > 0
    found = any(appendix["id"] == created_appendix["id"] for appendix in result.json)
    assert found, f"Appendix {created_appendix['id']} not found in results"


def test_get_appendix_by_id(
    app, client, auth_header_super_user, created_inspection, mocker
):
    """Get appendix by id."""
    contains_role = mocker.patch("compliance_api.auth.jwt.contains_role")
    contains_role.return_value = True
    created_appendix = _create_appendix(
        client, auth_header_super_user, created_inspection, mocker
    )
    print(created_appendix)
    url = urljoin(API_BASE_URL, f"appendices/{created_appendix['id']}")
    result = client.get(url, headers=auth_header_super_user)
    assert result.status_code == HTTPStatus.OK
    print(result.json)
    assert result.json["id"] == created_appendix["id"]
    assert result.json["inspection_id"] == created_inspection.id


def test_get_nonexistent_appendix(app, client, auth_header_super_user):
    """Get non-existent appendix."""
    url = urljoin(API_BASE_URL, "appendices/99999")
    result = client.get(url, headers=auth_header_super_user)
    assert result.status_code == HTTPStatus.NOT_FOUND
    assert "Appendix with 99999 not found" in result.json["message"]


def test_update_appendix(
    app, client, auth_header_super_user, created_inspection, mocker
):
    """Update appendix."""
    contains_role = mocker.patch("compliance_api.auth.jwt.contains_role")
    contains_role.return_value = True
    created_appendix = _create_appendix(
        client, auth_header_super_user, created_inspection, mocker
    )

    url = urljoin(API_BASE_URL, f"appendices/{created_appendix['id']}")
    updated_data = {
        "document_title": fake.text(),
        "inspection_id": created_inspection.id,
        "appendix_no": created_appendix["appendix_no"],
    }

    result = client.patch(
        url,
        data=json.dumps(updated_data),
        headers=auth_header_super_user,
    )
    assert result.status_code == HTTPStatus.OK
    assert result.json["document_title"] == updated_data["document_title"]

    # Verify the update was successful
    updated_appendix = AppendixService.get_by_id(created_appendix["id"])
    assert updated_appendix.document_title == updated_data["document_title"]


def test_delete_appendix(
    app, client, auth_header_super_user, created_inspection, mocker
):
    """Delete appendix."""
    created_appendix = _create_appendix(
        client, auth_header_super_user, created_inspection, mocker
    )

    url = urljoin(API_BASE_URL, f"appendices/{created_appendix['id']}")
    result = client.delete(url, headers=auth_header_super_user)
    assert result.status_code == HTTPStatus.OK

    # Verify it's deleted
    result = client.get(url, headers=auth_header_super_user)
    assert result.status_code == HTTPStatus.NOT_FOUND
    assert "Appendix with" in result.json["message"]


def _create_appendix(client, auth_header_super_user, created_inspection, mocker):
    """Create appendix."""
    contains_role = mocker.patch("compliance_api.auth.jwt.contains_role")
    contains_role.return_value = True
    appendix_data = AppendixScenario.default_value.value
    appendix_data["inspection_id"] = created_inspection.id
    result = client.post(
        urljoin(API_BASE_URL, "appendices"),
        data=json.dumps(appendix_data),
        headers=auth_header_super_user,
    )
    assert result.status_code == HTTPStatus.CREATED
    return result.json
