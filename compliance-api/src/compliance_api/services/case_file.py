"""Service for handle CaseFile."""

from compliance_api.exceptions import ResourceExistsError
from compliance_api.models import CASE_FILE_INITIATION_MAP, CaseFile, CaseFileInitiationEnum, CaseFileOfficer
from compliance_api.models.db import session_scope


class CaseFileService:
    """CaseFile Service."""

    @classmethod
    def get_initiation_options(cls):
        """Return the case file initiation options."""
        return [
            {"id": case.name, "name": CASE_FILE_INITIATION_MAP[case]}
            for case in CaseFileInitiationEnum
        ]

    @classmethod
    def get_all_case_files(cls):
        """Return all the case files."""
        return CaseFile.get_all()

    @classmethod
    def get_case_file_by_id(cls, case_file_id: int):
        """Return case file by id."""
        return CaseFile.find_by_id(case_file_id)

    @classmethod
    def create_case_file(cls, case_file_data: dict):
        """Create case file."""
        case_file_obj = _create_case_file_object(case_file_data)
        existing_case_file = cls.get_case_file_by_file_number(
            case_file_obj.get("case_file_number", None)
        )
        if existing_case_file:
            raise ResourceExistsError(
                f"Case file with the number {case_file_obj['case_file_number']} exists"
            )
        with session_scope() as session:
            created_case_file = CaseFile.create_case_file(case_file_obj, session)
            cls.insert_or_update_officers(
                created_case_file.id, case_file_data.get("officer_ids", None), session
            )
        return created_case_file

    @classmethod
    def update_case_file(cls, case_file_id: int, case_file_data: dict):
        """Update case file."""
        case_file_obj = _create_case_file_object(case_file_data)
        existing_case_file = cls.get_case_file_by_file_number(
            case_file_obj.get("case_file_number", None)
        )
        if existing_case_file and existing_case_file.id != case_file_id:
            raise ResourceExistsError(
                f"Case file with the number {case_file_obj['case_file_number']} exists"
            )
        with session_scope() as session:
            updated_case_file = CaseFile.update_case_file(
                case_file_id, case_file_obj, session
            )
            cls.insert_or_update_officers(
                case_file_id, case_file_data.get("officer_ids", None), session
            )
        return updated_case_file

    @classmethod
    def get_case_file_by_file_number(cls, case_file_number: int):
        """Return case file information by file number."""
        return CaseFile.get_case_file_by_file_number(case_file_number)

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
