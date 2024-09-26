"""Test suite for staff user."""

import json
from http import HTTPStatus
from urllib.parse import urljoin

import pytest
from faker import Faker

from tests.utilities.factory_scenario import StaffScenario


API_BASE_URL = "/api/"
fake = Faker()


@pytest.fixture
def mock_auth_service(mocker):
    """Fixture to mock AuthService methods."""
    mock_get_user_by_guid = mocker.patch(
        "compliance_api.services.authorize_service.auth_service.AuthService.get_epic_user_by_guid"
    )
    mock_get_user_by_guid.return_value = {
        "first_name": fake.word(),
        "last_name": fake.word(),
        "username": fake.word(),  # Fixed the key to "username"
    }

    mock_update_user_group = mocker.patch(
        "compliance_api.services.authorize_service.auth_service.AuthService.update_user_group"
    )
    mock_update_user_group.return_value = {}

    yield mock_get_user_by_guid, mock_update_user_group


def test_create_staff_user(mock_auth_service, client, auth_header):
    """Create staff user."""
    url = urljoin(API_BASE_URL, "staff-users")
    staff_user_data = {
        "auth_user_guid": fake.word(),
        "permission": "VIEWER",
        "position_id": 1,
    }

    result = client.post(url, data=json.dumps(staff_user_data), headers=auth_header)

    assert result.status_code == HTTPStatus.CREATED


def test_create_existing_user(mock_auth_service, client, auth_header):
    """Create an existing user."""
    url = urljoin(API_BASE_URL, "staff-users")
    user_data = StaffScenario.default_data.value
    auth_user_guid = fake.word()
    user_data["auth_user_guid"] = auth_user_guid
    StaffScenario.create(user_data)

    user_payload = {
        "auth_user_guid": auth_user_guid,
        "permission": "VIEWER",
        "position_id": 1,
    }

    result = client.post(url, data=json.dumps(user_payload), headers=auth_header)

    assert result.status_code == HTTPStatus.CONFLICT


def test_get_users(mock_auth_service, mocker, client, auth_header):
    """Create an existing user."""
    url = urljoin(API_BASE_URL, "staff-users")
    user_data = StaffScenario.default_data.value
    auth_user_guid1 = fake.text(max_nb_chars=20)
    user_data["auth_user_guid"] = auth_user_guid1
    StaffScenario.create(user_data)
    auth_user_guid2 = fake.text(max_nb_chars=20)
    user_data["auth_user_guid"] = auth_user_guid2
    StaffScenario.create(user_data)
    mock_get_epic_users_by_app = mocker.patch(
        "compliance_api.services.authorize_service.auth_service.AuthService.get_epic_users_by_app"
    )
    epic_users = StaffScenario.epic_auth_users.value
    epic_users[0]["username"] = auth_user_guid1
    epic_users[1]["username"] = auth_user_guid2

    mock_get_epic_users_by_app.return_value = epic_users

    result = client.get(url, headers=auth_header)
    filtered_user = next(
        (user for user in result.json if user["auth_user_guid"] == auth_user_guid1),
        None,
    )
    print(filtered_user)
    assert filtered_user is not None
    assert filtered_user.get("permission", None) == "USER"
    assert result.status_code == HTTPStatus.OK


def test_get_user_by_id(mock_auth_service, client, auth_header):
    """Get user by id"""
    staff_data = StaffScenario.default_data.value
    staff_data["auth_user_guid"]="dinesh"
    created_user = StaffScenario.create(staff_data)
    url = urljoin(API_BASE_URL, f"staff-users/{created_user.id}")

    result = client.get(url, headers=auth_header)

    assert result.status_code == HTTPStatus.OK
    assert result.json["id"] == created_user.id
