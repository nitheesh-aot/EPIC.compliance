"""Service for handle CaseFile."""

from compliance_api.exceptions import ResourceExistsError
from compliance_api.models import CaseFile as CaseFileModel
from compliance_api.models import CaseFileInitiationOption as CaseFileInitiationOptionModel
from compliance_api.models import CaseFileOfficer
from compliance_api.models.db import session_scope


class CaseFileService:
    """CaseFile Service."""

    @classmethod
    def get_initiation_options(cls):
        """Return the case file initiation options."""
        return CaseFileInitiationOptionModel.get_all(sort_by="sort_order")

    @classmethod
    def get_all_case_files(cls, default_filters=True):
        """Return all the case files."""
        return CaseFileModel.get_all(default_filters)

    @classmethod
    def get_case_file_by_id(cls, case_file_id: int):
        """Return case file by id."""
        return CaseFileModel.find_by_id(case_file_id)

    @classmethod
    def create_case_file(cls, case_file_data: dict):
        """Create case file."""
        case_file_obj = _create_case_file_object(case_file_data)
        _validate_case_file_existence(case_file_obj.get("case_file_number", None))
        with session_scope() as session:
            created_case_file = CaseFileModel.create_case_file(case_file_obj, session)
            cls.insert_or_update_officers(
                created_case_file.id, case_file_data.get("officer_ids", None), session
            )
        return created_case_file

    @classmethod
    def update_case_file(cls, case_file_id: int, case_file_data: dict):
        """Update case file."""
        case_file_obj = _create_case_file_object(case_file_data)
        _validate_case_file_existence(
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
    def get_case_file_by_file_number(cls, case_file_number: int):
        """Return case file information by file number."""
        return CaseFileModel.get_case_file_by_file_number(case_file_number)

    @classmethod
    def insert_or_update_officers(
        cls, case_file_id: int, officer_ids: list[int], session=None
    ):
        """Insert/Update case file officers associated with a given case file."""
        existing_officers = CaseFileOfficer.get_all_officers_by_case_file_id(
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
            CaseFileOfficer.bulk_delete_officers_by_ids(
                case_file_id, list(officer_ids_to_be_deleted), session
            )
        if officer_ids_to_be_added:
            CaseFileOfficer.bulk_insert_officers_per_case_file(
                case_file_id, list(officer_ids_to_be_added), session
            )


def _create_case_file_object(case_file_data: dict):
    """Create a case file object."""
    case_file_data_copy = case_file_data.copy()
    case_file_data_copy.pop("officer_ids")
    return case_file_data_copy


def _validate_case_file_existence(case_file_number: int, case_file_id: int = None):
    """Check if the case file exists."""
    existing_case_file = CaseFileModel.get_case_file_by_file_number(case_file_number)
    if existing_case_file and (
        not case_file_id or existing_case_file.id != case_file_id
    ):
        raise ResourceExistsError(
            f"Case file with the number {case_file_number} exists"
        )
