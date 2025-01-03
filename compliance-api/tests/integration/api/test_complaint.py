"""test suit for complaint."""

from http import HTTPStatus
from urllib.parse import urljoin

import pytest
from faker import Faker

from compliance_api.services import CaseFileService, ComplaintService
from tests.utilities.factory_scenario import CasefileScenario, ComplaintScenario, StaffScenario


API_BASE_URL = "/api/"
fake = Faker()


@pytest.fixture
def mock_track_service(mocker):
    """Fixture to mock TrackService methods."""
    mock_get_project_by_id = mocker.patch(
        "compliance_api.services.epic_track_service.track_service.TrackService.get_project_by_id"
    )
    mock_get_project_by_id.return_value = {
        "abbreviation": fake.word(),
        "ea_certificate": "",
        "type": {"name": ""},
        "sub_type": {"name": ""},
        "proponent": {"name": ""},
    }

    yield mock_get_project_by_id


@pytest.fixture
def created_staff(mocker):
    """Create staff."""
    user_data = StaffScenario.default_data.value
    auth_user_guid = fake.word()
    user_data["auth_user_guid"] = auth_user_guid
    new_user = StaffScenario.create(user_data)
    return new_user


@pytest.fixture
def created_case_file(mocker, created_staff, mock_track_service):
    """Create case file."""
    contains_role = mocker.patch("compliance_api.auth.jwt.contains_role")
    contains_role.return_value = True
    case_file_data = CasefileScenario.default_value.value
    case_file_data["primary_officer_id"] = created_staff.id
    created_case_file = CaseFileService.create(case_file_data)
    return created_case_file


def test_get_complaint_sources(client, auth_header):
    """Get complaint sources."""
    url = urljoin(API_BASE_URL, "complaints/sources")
    print(url)
    result = client.get(url, headers=auth_header)
    assert len(result.json) == 4
    assert result.status_code == HTTPStatus.OK


def test_get_case_files_without_case_file_id_passed(
    client, auth_header, mocker, mock_track_service, created_staff, created_case_file
):
    """Get case files."""
    contains_role = mocker.patch("compliance_api.auth.jwt.contains_role")
    contains_role.return_value = True
    complaint_data = ComplaintScenario.complaint_default.value
    complaint_data["lead_officer_id"] = created_staff.id
    complaint_data["case_file_id"] = created_case_file.id
    ComplaintService.create(complaint_data)

    result = client.get(urljoin(API_BASE_URL, "complaints"), headers=auth_header)

    assert result.status_code == HTTPStatus.OK
