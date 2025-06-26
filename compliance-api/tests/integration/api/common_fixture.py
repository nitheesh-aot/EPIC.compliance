"""Common fixture for all test."""
import copy
import json
import pytest
from datetime import datetime
from http import HTTPStatus
from urllib.parse import urljoin
from tests.utilities.factory_scenario import CasefileScenario, StaffScenario
from compliance_api.models import CaseFile as CaseFileModel
from faker import Faker

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
        "username": fake.word(),
    }

    mock_update_user_group = mocker.patch(
        "compliance_api.services.authorize_service.auth_service.AuthService.update_user_group"
    )
    mock_update_user_group.return_value = {}
    mock_delete_user_group = mocker.patch(
        "compliance_api.services.authorize_service.auth_service.AuthService.delete_user_group"
    )
    mock_delete_user_group.return_value = {}

    yield mock_get_user_by_guid, mock_update_user_group, mock_delete_user_group


@pytest.fixture
def mock_track_service(mocker):
    """Fixture to mock TrackService methods."""
    mock_get_project_by_id = mocker.patch(
        "compliance_api.services.epic_track_service.track_service.TrackService.get_project_by_id"
    )
    mock_get_project_by_id.return_value = {
        "ea_certificate": fake.word(),
        "type": {"name": fake.word()},
        "abbreviation": "PRJ",
        "sub_type": {"name": fake.word()},
        "proponent": {"name": fake.word()},
    }

    mock_get_project_statuses = mocker.patch(
        "compliance_api.services.epic_track_service.track_service.TrackService.get_project_statuses"
    )
    mock_get_project_statuses.return_value = [
        {"id": 1, "name": "Active", "description": "Project is active"}
    ]
    mock_get_project_statuses = mocker.patch(
        "compliance_api.services.epic_track_service.track_service.TrackService.get_project_statuses"
    )
    mock_get_project_statuses.return_value = [
        {"id": 13, "name": "Preconstruction", "component": "COMPLIANCE", "is_active": True}
    ]

    yield mock_get_project_by_id, mock_get_project_statuses


@pytest.fixture(scope="session")
def mock_doc_service(mocker):
    """Fixture to mock DocService methods."""
    mock_get_presigned_url = mocker.patch(
        "compliance_api.services.document_service.doc_service.DocService.get_presigned_url"
    )
    mock_get_presigned_url.return_value = {
        "presigned_url": "https://example.com/presigned-url"
    }

    yield mock_get_presigned_url


@pytest.fixture(scope="session")
def mock_requests(mocker):
    """Fixture to mock requests library."""
    mock_delete = mocker.patch("requests.delete")
    mock_delete.return_value.status_code = 204

    yield mock_delete


@pytest.fixture
def created_staff(mocker):
    """Create staff."""
    user_data = StaffScenario.default_data.value
    auth_user_guid = str(datetime.utcnow().timestamp() * 1000)
    user_data["auth_user_guid"] = auth_user_guid
    new_user = StaffScenario.create(user_data)
    return new_user


@pytest.fixture
def created_case_file(created_staff):
    """Create a case file for testing."""
    case_file_data = copy.copy(CasefileScenario.default_value.value)
    case_file_data["primary_officer_id"] = created_staff.id
    case_file_data["case_file_number"] = f"CF{fake.random_number(digits=4)}"
    case_file = CaseFileModel.create_case_file(case_file_data)
    return case_file