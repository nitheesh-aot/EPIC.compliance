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
    auth_user_guid1 = "dinesh1"  # fake.text(max_nb_chars=20)
    user_data["auth_user_guid"] = auth_user_guid1
    StaffScenario.create(user_data)
    auth_user_guid2 = "dinesh2"  # fake.text(max_nb_chars=20)
    user_data["auth_user_guid"] = auth_user_guid2
    StaffScenario.create(user_data)
    mock_get_epic_users_by_app = mocker.patch(
        "compliance_api.services.authorize_service.auth_service.AuthService.get_epic_users_by_app"
    )
    epic_users = [
        {
            "id": "5bca57e4-1b39-498c-8872-732d3da4beaf",
            "first_name": "Shaelyn",
            "last_name": "Tolk",
            "email_address": "shaelyn.tolk@gov.bc.ca",
            "username": f"{auth_user_guid1}",
            "groups": [
                {
                    "id": "b872cb25-2a8b-4b98-8aff-1c8ac1c47b40",
                    "name": "VIEWER",
                    "path": "COMPLIANCE/VIEWER",
                    "level": 0,
                    "display_name": "",
                },
                {
                    "id": "6f94f250-c4bf-4dc6-9158-fc64e8083edc",
                    "name": "USER",
                    "path": "COMPLIANCE/USER",
                    "level": 1,
                    "display_name": "",
                },
            ],
        },
        {
            "id": "34413651-fd5a-4253-b205-5acac3611915",
            "first_name": "Abhinav",
            "last_name": "Sharma",
            "email_address": "abhinav.sharma@gov.bc.ca",
            "username": f"{auth_user_guid2}",
            "groups": [
                {
                    "id": "6f94f250-c4bf-4dc6-9158-fc64e8083edc",
                    "name": "USER",
                    "path": "COMPLIANCE/USER",
                    "level": 1,
                    "display_name": "",
                }
            ],
        },
    ]
    mock_get_epic_users_by_app.return_value = epic_users

    result = client.get(url, headers=auth_header)
    print(result.json)
    filtered_user = next(
        (user for user in result.json if user["auth_user_guid"] == auth_user_guid1),
        None,
    )

    assert filtered_user is not None
    assert filtered_user["permission"] == "USER"
    assert result.status_code == HTTPStatus.OK
