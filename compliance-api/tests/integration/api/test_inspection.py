"""Test suite for inspection."""

import copy
import json
from datetime import datetime
from http import HTTPStatus
from urllib.parse import urljoin

import pytest
from faker import Faker

from compliance_api.models import CaseFile as CaseFileModel
from compliance_api.models.inspection import InspectionStatusEnum
from tests.utilities.factory_scenario import CasefileScenario, InspectionScenario, StaffScenario


API_BASE_URL = "/api/"
fake = Faker()


@pytest.fixture(scope="session")
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

    yield mock_get_user_by_guid, mock_update_user_group


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


def test_get_inspection_attendance_options(client, auth_header):
    """Get inspection attendance options."""
    url = urljoin(API_BASE_URL, "inspections/attendance-options")
    result = client.get(url, headers=auth_header)
    assert len(result.json) == 7
    assert result.status_code == HTTPStatus.OK


def test_get_inspection_type_options(client, auth_header):
    """Get inspection type options."""
    url = urljoin(API_BASE_URL, "inspections/type-options")
    result = client.get(url, headers=auth_header)
    assert len(result.json) == 2
    assert result.status_code == HTTPStatus.OK


def test_get_inspection_initiation_options(client, auth_header):
    """Get inspection initiation options."""
    url = urljoin(API_BASE_URL, "inspections/initiation-options")
    result = client.get(url, headers=auth_header)
    assert len(result.json) == 4
    assert result.status_code == HTTPStatus.OK


def test_get_inspection_status_options(client, auth_header):
    """Get inspection status options."""
    url = urljoin(API_BASE_URL, "inspections/ir-status-options")
    result = client.get(url, headers=auth_header)
    assert len(result.json) == 2
    assert result.status_code == HTTPStatus.OK


def test_create_inspection(
    client, auth_header_super_user, created_staff, created_case_file, mock_track_service
):
    """Create inspection with basic fields."""
    url = urljoin(API_BASE_URL, "inspections")
    inspection_data = copy.copy(InspectionScenario.default_value.value)
    inspection_data.update(
        {
            "case_file_id": created_case_file.id,
            "primary_officer_id": created_staff.id,
            "initiation_id": 1,
        }
    )

    result = client.post(
        url,
        data=json.dumps(inspection_data),
        headers=auth_header_super_user,
    )
    print(result.json)
    assert result.status_code == HTTPStatus.CREATED
    expected_ir_number = f"PRJ_{created_case_file.case_file_number}_IR001"
    assert result.json["ir_number"] == expected_ir_number
    assert result.json["inspection_status"] == InspectionStatusEnum.OPEN.value


# def test_create_inspection_with_non_superuser(client, auth_header, created_staff, created_case_file):
#     """Create inspection with non super user."""
#     url = urljoin(API_BASE_URL, "inspections")
#     inspection_data = copy.copy(InspectionScenario.default_value.value)
#     inspection_data.update({
#         "case_file_id": created_case_file.id,
#         "primary_officer_id": created_staff.id,
#         "initiation_id": 1,
#         "start_date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
#     })
#     result = client.post(
#         url, data=json.dumps(inspection_data), headers=auth_header
#     )
#     assert result.status_code == HTTPStatus.FORBIDDEN


# def test_create_inspection_with_existing_ir_number(
#     client, auth_header_super_user, created_staff, created_case_file
# ):
#     """Create inspection with existing IR number."""
#     url = urljoin(API_BASE_URL, "inspections")
#     inspection_data = copy.copy(InspectionScenario.default_value.value)
#     inspection_data.update({
#         "case_file_id": created_case_file.id,
#         "primary_officer_id": created_staff.id,
#         "initiation_id": 1,
#         "start_date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
#     })
#     # Create first inspection
#     InspectionService.create(inspection_data)

#     # Try to create second inspection with same data
#     result = client.post(
#         url, data=json.dumps(inspection_data), headers=auth_header_super_user
#     )
#     assert result.status_code == HTTPStatus.CONFLICT


# def test_get_inspections_by_case_file_id(client, auth_header, created_case_file):
#     """Get inspections by case file id."""
#     inspection_data = copy.copy(InspectionScenario.default_value.value)
#     inspection_data.update({
#         "case_file_id": created_case_file.id,
#         "initiation_id": 1,
#         "start_date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
#     })
#     created_inspection = InspectionService.create(inspection_data)
#     url = urljoin(
#         API_BASE_URL, f"inspections?case_file_id={created_case_file.id}")
#     result = client.get(url, headers=auth_header)

#     assert result.status_code == HTTPStatus.OK
#     assert len(result.json) == 1


# def test_get_inspections(client, auth_header, mocker, created_case_file):
#     """Get all inspections."""
#     contains_role = mocker.patch("compliance_api.auth.jwt.contains_role")
#     contains_role.return_value = True
#     inspection_data = copy.copy(InspectionScenario.default_value.value)
#     inspection_data["case_file_id"] = created_case_file.id
#     created_inspection = InspectionService.create(inspection_data)
#     url = urljoin(API_BASE_URL, "inspections")
#     result = client.get(url, headers=auth_header)

#     assert result.status_code == HTTPStatus.OK
#     filtered_inspection = next(
#         (inspection for inspection in result.json if inspection["id"]
#          == created_inspection.id), None
#     )
#     assert filtered_inspection is not None


# def test_get_inspection_by_id(client, auth_header, created_case_file):
#     """Test inspection by id."""
#     inspection_data = copy.copy(InspectionScenario.default_value.value)
#     inspection_data.update({
#         "case_file_id": created_case_file.id,
#         "inspection_status": InspectionStatusEnum.OPEN,
#         "initiation_id": 1,
#         "start_date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
#     })
#     created_inspection = InspectionService.create(inspection_data)
#     url = urljoin(API_BASE_URL, f"inspections/{created_inspection.id}")
#     result = client.get(url, headers=auth_header)

#     assert result.status_code == HTTPStatus.OK
#     assert result.json["id"] == created_inspection.id
#     assert result.json["inspection_status"] == InspectionStatusEnum.OPEN.value


# def test_get_inspection_by_ir_number(client, auth_header_super_user, created_case_file):
#     """Get inspection by IR number."""
#     inspection_data = copy.copy(InspectionScenario.default_value.value)
#     inspection_data.update({
#         "case_file_id": created_case_file.id,
#         "initiation_id": 1,
#         "start_date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
#     })
#     result = InspectionService.create(inspection_data)
#     url = urljoin(
#         API_BASE_URL,
#         f"inspections/ir-numbers/{result.ir_number}",
#     )
#     result = client.get(url, headers=auth_header_super_user)

#     assert result.status_code == HTTPStatus.OK
#     assert result.json["id"] == result.json.get("id")
#     assert result.json["ir_number"] == result.ir_number


# def test_inspection_update(client, auth_header_super_user, created_staff, created_case_file, mock_track_service):
#     """Update inspection."""
#     # Creating inspection with required fields
#     inspection_data = copy.copy(InspectionScenario.default_value.value)
#     inspection_data.update({
#         "case_file_id": created_case_file.id,
#         "primary_officer_id": created_staff.id,
#         "initiation_id": 1,
#         "start_date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
#         "project_description": "sample description",
#     })
#     created_result = InspectionService.create(inspection_data)

#     # Create a new user for update
#     user_data = StaffScenario.default_data.value
#     auth_user_guid = fake.word()
#     user_data["auth_user_guid"] = auth_user_guid
#     new_user = StaffScenario.create(user_data)

#     # Update with required fields
#     update_data = copy.copy(inspection_data)
#     update_data.update({
#         "primary_officer_id": new_user.id,
#         "attending_officer_ids": [new_user.id],
#         "project_description": "changed description",
#         "attendance_option_ids": [
#             InspectionAttendanceOptionEnum.ATTENDING_OFFICERS.value
#         ]
#     })

#     url = urljoin(API_BASE_URL, f"inspections/{created_result.id}")
#     result = client.patch(
#         url,
#         data=json.dumps(update_data),
#         headers=auth_header_super_user
#     )

#     assert result.status_code == HTTPStatus.OK
#     assert result.json["primary_officer_id"] == new_user.id
#     assert result.json["project_description"] == "changed description"
#     officers = InspectionService.get_other_officers(result.json["id"])
#     assert len(officers) == 1
#     assert officers[0].id == new_user.id


# def test_inspection_update_viewer_fails(client, auth_header, created_staff, created_case_file):
#     """Update as Viewer."""
#     inspection_data = copy.copy(InspectionScenario.default_value.value)
#     inspection_data.update({
#         "case_file_id": created_case_file.id,
#         "primary_officer_id": created_staff.id,
#         "initiation_id": 1,
#         "start_date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
#     })
#     created_result = InspectionService.create(inspection_data)
#     url = urljoin(API_BASE_URL, f"inspections/{created_result.id}")
#     result = client.patch(url, data=json.dumps(
#         inspection_data), headers=auth_header)
#     assert result.status_code == HTTPStatus.FORBIDDEN


# def test_inspection_update_with_primary(
#     client, jwt, created_staff, auth_header_super_user, created_case_file
# ):
#     """Update as primary."""
#     inspection_data = copy.copy(InspectionScenario.default_value.value)
#     inspection_data.update({
#         "case_file_id": created_case_file.id,
#         "primary_officer_id": created_staff.id,
#         "initiation_id": 1,
#         "start_date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
#     })
#     created_result = InspectionService.create(inspection_data)
#     header = TokenJWTClaims.default.value
#     header["preferred_username"] = created_staff.auth_user_guid
#     headers = factory_auth_header(jwt=jwt, claims=header)

#     url = urljoin(API_BASE_URL, f"inspections/{created_result.id}")
#     result = client.patch(url, data=json.dumps(
#         inspection_data), headers=headers)
#     assert result.status_code == HTTPStatus.OK


# def test_inspection_close(client, jwt, created_staff, mocker, created_case_file):
#     """Update as primary."""
#     contains_role = mocker.patch("compliance_api.auth.jwt.contains_role")
#     contains_role.return_value = True
#     inspection_data = copy.copy(InspectionScenario.default_value.value)
#     inspection_data.update({
#         "case_file_id": created_case_file.id,
#         "primary_officer_id": created_staff.id,
#         "initiation_id": 1,
#         "start_date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
#     })
#     created_result = InspectionService.create(inspection_data)
#     inspection_id = created_result.id
#     ir_number = created_result.ir_number
#     header = TokenJWTClaims.default.value
#     header["preferred_username"] = created_staff.auth_user_guid
#     headers = factory_auth_header(jwt=jwt, claims=header)
#     url = urljoin(API_BASE_URL, f"inspections/{created_result.id}/status")
#     result = client.patch(url, data=json.dumps(
#         {"status": "OPEN"}), headers=headers)
#     assert result.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
#     result = client.patch(url, data=json.dumps(
#         {"status": "CLOSED"}), headers=headers)
#     assert result.status_code == HTTPStatus.NO_CONTENT
#     result = client.patch(url, data=json.dumps(
#         {"status": "CLOSED"}), headers=headers)
#     assert result.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
#     result = client.patch(url, data=json.dumps(
#         {"status": "OPEN"}), headers=headers)
#     assert result.status_code == HTTPStatus.NO_CONTENT


# def test_inspection_delete(client, jwt, created_staff, mocker, auth_header_super_user, created_case_file):
#     """Update as primary."""
#     contains_role = mocker.patch("compliance_api.auth.jwt.contains_role")
#     contains_role.return_value = True
#     inspection_data = copy.copy(InspectionScenario.default_value.value)
#     inspection_data.update({
#         "case_file_id": created_case_file.id,
#         "primary_officer_id": created_staff.id,
#         "initiation_id": 1,
#         "start_date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
#     })
#     created_result = InspectionService.create(inspection_data)

#     url = urljoin(API_BASE_URL, f"inspections/{created_result.id}")
#     result = client.delete(url, headers=auth_header_super_user)
#     assert result.status_code == HTTPStatus.NO_CONTENT
#     url = urljoin(API_BASE_URL, f"inspections/{created_result.id}")
#     result = client.get(url, headers=auth_header_super_user)
#     assert result.status_code == HTTPStatus.NOT_FOUND


# def test_update_inspection_requirements(client, auth_header_super_user, created_staff, created_case_file):
#     """Test updating inspection requirements."""
#     # Create an inspection
#     inspection_data = copy.copy(InspectionScenario.default_value.value)
#     inspection_data.update({
#         "case_file_id": created_case_file.id,
#         "primary_officer_id": created_staff.id,
#         "initiation_id": 1,
#         "start_date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
#     })
#     created_inspection = InspectionService.create(inspection_data)

#     # Create a requirement
#     requirement_data = {
#         "requirement_id": 1,
#         "findings": "Test findings",
#         "images": [
#             {
#                 "image_id": 1,
#                 "sort_order": 1
#             }
#         ]
#     }

#     url = urljoin(
#         API_BASE_URL, f"inspections/{created_inspection.id}/requirements")
#     result = client.patch(
#         url,
#         data=json.dumps({"requirements": [requirement_data]}),
#         headers=auth_header_super_user
#     )
#     assert result.status_code == HTTPStatus.NO_CONTENT

#     # Verify the updates
#     updated_requirement = InspectionRequirementService.get_by_id(
#         requirement_data["requirement_id"])
#     assert updated_requirement.findings == requirement_data["findings"]
#     updated_image = InspectionRequirementService.get_all_images(
#         created_inspection.id,
#         requirement_data["requirement_id"],
#         "PHOTO"
#     )[0]
#     assert updated_image.sort_order == requirement_data["images"][0]["sort_order"]
