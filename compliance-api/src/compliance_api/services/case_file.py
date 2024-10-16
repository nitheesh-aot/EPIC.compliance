"""Service for handle CaseFile."""

from datetime import datetime

from compliance_api.exceptions import ResourceExistsError
from compliance_api.models import CaseFile as CaseFileModel
from compliance_api.models import CaseFileInitiationOption as CaseFileInitiationOptionModel
from compliance_api.models import CaseFileOfficer as CaseFileOfficerModel
from compliance_api.models import CaseFileStatusEnum
from compliance_api.models.db import session_scope


class CaseFileService:
    """CaseFile Service."""

    @classmethod
    def get_initiation_options(cls):
        """Return the case file initiation options."""
        return CaseFileInitiationOptionModel.get_all(sort_by="sort_order")

    @classmethod
    def get_all(cls):
        """Return all the case files."""
        return CaseFileModel.get_all(default_filters=False)

    @classmethod
    def get_by_id(cls, case_file_id: int):
        """Return case file by id."""
        return CaseFileModel.find_by_id(case_file_id)

    @classmethod
    def get_other_officers(cls, case_file_id: int):
        """Return other officers associated with a given case file."""
        return CaseFileOfficerModel.get_all_by_case_file_id(case_file_id)

    @classmethod
    def create(cls, case_file_data: dict):
        """Create case file."""
        case_file_obj = _create_case_file_object(case_file_data)
        _validate_existence_by_file_number(case_file_obj.get("case_file_number", None))
        with session_scope() as session:
            created_case_file = CaseFileModel.create_case_file(case_file_obj, session)
            cls.insert_or_update_officers(
                created_case_file.id, case_file_data.get("officer_ids", None), session
            )
        return created_case_file

    @classmethod
    def update(cls, case_file_id: int, case_file_data: dict):
        """Update case file."""
        case_file_obj = _create_case_file_object(case_file_data)
        _validate_existence_by_file_number(
            case_file_obj.get("case_file_number", None), case_file_id
        )
        with session_scope() as session:
            updated_case_file = CaseFileModel.update_case_file(
                case_file_id, case_file_obj, session
            )
            cls.insert_or_update_officers(
                case_file_id, case_file_data.get("officer_ids", None), session
            )
        return updated_case_file

    @classmethod
    def get_by_file_number(cls, case_file_number: int):
        """Return case file information by file number."""
        return CaseFileModel.get_by_file_number(case_file_number)

    @classmethod
    def insert_or_update_officers(
        cls, case_file_id: int, officer_ids: list[int], session=None
    ):
        """Insert/Update case file officers associated with a given case file."""
        if officer_ids:
            existing_officers = CaseFileOfficerModel.get_all_by_case_file_id(
                case_file_id
            )
            existing_officer_ids = {
                officer.officer_id
                for officer in existing_officers
                if officer.is_active is True
            }

            new_officer_ids = set(officer_ids)
            officer_ids_to_be_deleted = existing_officer_ids.difference(new_officer_ids)
            officer_ids_to_be_added = new_officer_ids.difference(existing_officer_ids)
            if officer_ids_to_be_deleted:
                CaseFileOfficerModel.bulk_delete(
                    case_file_id, list(officer_ids_to_be_deleted), session
                )
            if officer_ids_to_be_added:
                CaseFileOfficerModel.bulk_insert(
                    case_file_id, list(officer_ids_to_be_added), session
                )

    @classmethod
    def get_by_project(cls, project_id: int):
        """Return case files based on project id."""
        return CaseFileModel.get_by_project(project_id)

    @classmethod
    def is_assigned_user(cls, case_file_id, auth_user_guid):
        """Check if the given user is an assigned user of the given case file."""
        case_file = CaseFileModel.find_by_id(case_file_id)

        if not case_file:
            return False

        # Check if the user is the lead officer or part of other officers
        return case_file.lead_officer.auth_user_guid == auth_user_guid or any(
            officer.officer.auth_user_guid == auth_user_guid
            for officer in case_file.case_file_officers
        )


def _create_case_file_object(case_file_data: dict):
    """Create a case file object."""
    case_file_obj = {
        "project_id": case_file_data.get("project_id", None),
        "date_created": case_file_data.get("date_created"),
        "lead_officer_id": case_file_data.get("lead_officer_id", None),
        "initiation_id": case_file_data.get("initiation_id"),
        "case_file_status": CaseFileStatusEnum.OPEN,
    }
    if not case_file_data.get("case_file_number", None):
        case_file_obj["case_file_number"] = _generate_case_file_number(
            datetime.now().year
        )
    else:
        case_file_obj["case_file_number"] = case_file_data.get("case_file_number")
    return case_file_obj


def _generate_case_file_number(year):
    """Generate case file number."""
    max_number = CaseFileModel.get_max_case_file_number_by_year(year)
    return str(max_number + 1 if max_number > 0 else f"{year}{1:04d}")


def _validate_existence_by_file_number(case_file_number: int, case_file_id: int = None):
    """Check if the case file exists."""
    existing_case_file = CaseFileModel.get_by_file_number(case_file_number)
    if existing_case_file and (
        not case_file_id or existing_case_file.id != case_file_id
    ):
        raise ResourceExistsError(
            f"Case file with the number {case_file_number} exists"
        )
