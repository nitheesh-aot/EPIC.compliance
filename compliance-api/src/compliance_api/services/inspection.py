"""Service for managing Inspection."""

from compliance_api.exceptions import UnprocessableEntityError
from compliance_api.models import Inspection as InspectionModel
from compliance_api.models import InspectionAgency as InspectionAgencyModel
from compliance_api.models import InspectionAttendance as InspectionAttendanceModel
from compliance_api.models import InspectionAttendanceOption as InspectionAttendanceOptionModel
from compliance_api.models import InspectionFirstnation as InspectionFirstnationModel
from compliance_api.models import InspectionInitiationOption as InspectionInitiationOptionModel
from compliance_api.models import InspectionIRType as InspectionIRTypeModel
from compliance_api.models import InspectionOfficer as InspectionOfficerModel
from compliance_api.models import InspectionOtherAttendance as InspectionOtherAttendanceModel
from compliance_api.models import InspectionUnapprovedProject as InspectionUnapprovedProjectModel
from compliance_api.models import IRStatusOption as IRStatusOptionModel
from compliance_api.models import IRTypeOption as IRTypeOptionModel
from compliance_api.models.db import session_scope
from compliance_api.models.inspection.inspection_constant import UNAPPROVED_PROJECT_CODE, UNAPPROVED_PROJECT_NAME
from compliance_api.models.inspection.inspection_enum import InspectionAttendanceOptionEnum

from .case_file import CaseFileService
from .epic_track_service.track_service import TrackService


class InspectionService:
    """Inspection Service Class."""

    @classmethod
    def get_attendance_options(cls):
        """Get inspection attendance options."""
        return InspectionAttendanceOptionModel.get_all(sort_by="sort_order")

    @classmethod
    def get_ir_type_options(cls):
        """Get inspection record type options."""
        return IRTypeOptionModel.get_all(sort_by="sort_order")

    @classmethod
    def get_initiation_options(cls):
        """Get inspection initiation options."""
        return InspectionInitiationOptionModel.get_all(sort_by="sort_order")

    @classmethod
    def get_ir_status_options(cls):
        """Get inspection record status options."""
        return IRStatusOptionModel.get_all(sort_by="sort_order")

    @classmethod
    def get_all_inspetions(cls):
        """Get all inspections."""
        return InspectionModel.get_all(default_filters=False)

    @classmethod
    def create_inspection(cls, inspection_data: dict):
        """Create inspection."""
        inspection_obj = _create_inspection_object(inspection_data)
        with session_scope() as session:
            created_inspection = InspectionModel.create_inspection(
                inspection_obj, session
            )
            # If Selected Project is unapproved project
            if not inspection_data.get("project_id", None):
                unapproved_project_obj = _create_unapproved_project_object(
                    inspection_data, created_inspection.id
                )
                InspectionUnapprovedProjectModel.create_inspection_unapproved_project(
                    unapproved_project_obj, session
                )
            attendance_option_ids = inspection_data.get("attendance_option_ids", [])
            _insert_or_update_inspection_attendance(
                created_inspection.id,
                attendance_option_ids,
                session,
            )
            _insert_or_update_officers(
                created_inspection.id,
                inspection_data.get("inspection_officer_ids", []),
                session,
            )
            _insert_or_update_inspection_agencies(
                created_inspection.id,
                inspection_data.get("agency_attendance_ids", []),
                session,
            )
            _insert_or_update_inspection_firstnations(
                created_inspection.id,
                inspection_data.get("firstnation_attendance_ids", []),
                session,
            )
            _insert_or_update_inspection_ir_types(
                created_inspection.id, inspection_data.get("ir_type_ids", []), session
            )
            if {
                InspectionAttendanceOptionEnum.MUNICIPAL.value,
                InspectionAttendanceOptionEnum.OTHER.value,
            }.intersection(attendance_option_ids):
                other_attendance_obj = _create_inspection_other_attendance_object(
                    inspection_data, created_inspection.id
                )
                InspectionOtherAttendanceModel.create_other_attendance(
                    other_attendance_obj, session
                )
        return created_inspection


def _insert_or_update_inspection_firstnations(
    inspection_id: int, firstnation_ids: list[int], session=None
):
    """Insert/Update inspection firstnation."""
    existing_firstnations = (
        InspectionFirstnationModel.get_all_firstnations_inspection_id(inspection_id)
    )
    existing_firstnation_ids = {
        firstnation.firstnation_id
        for firstnation in existing_firstnations
        if firstnation.is_active is True
    }

    new_firstnation_ids = set(firstnation_ids)
    firstnation_ids_to_be_deleted = existing_firstnation_ids.difference(
        new_firstnation_ids
    )
    firstnation_ids_to_be_added = new_firstnation_ids.difference(
        existing_firstnation_ids
    )
    if firstnation_ids_to_be_deleted:
        InspectionFirstnationModel.bulk_delete_firstnations_by_ids(
            inspection_id, list(firstnation_ids_to_be_deleted), session
        )
    if firstnation_ids_to_be_added:
        InspectionFirstnationModel.bulk_insert_firstnation_per_inspection(
            inspection_id, list(firstnation_ids_to_be_added), session
        )


def _insert_or_update_inspection_agencies(
    inspection_id: int, agency_ids: list[int], session=None
):
    """Insert/Update inspection agency."""
    existing_agencies = InspectionAgencyModel.get_all_agencies_inspection_id(
        inspection_id
    )
    existing_agency_ids = {
        agency.agency_id for agency in existing_agencies if agency.is_active is True
    }

    new_agency_ids = set(agency_ids)
    agency_ids_to_be_deleted = existing_agency_ids.difference(new_agency_ids)
    agency_ids_to_be_added = new_agency_ids.difference(existing_agency_ids)
    if agency_ids_to_be_deleted:
        InspectionAgencyModel.bulk_delete_agencies_by_ids(
            inspection_id, list(agency_ids_to_be_deleted), session
        )
    if agency_ids_to_be_added:
        InspectionAgencyModel.bulk_insert_agency_per_inspection(
            inspection_id, list(agency_ids_to_be_added), session
        )


def _insert_or_update_inspection_ir_types(
    inspection_id: int, ir_type_ids: list[int], session=None
):
    """Insert/Update inspection ir type."""
    existing_ir_types = InspectionIRTypeModel.get_all_ir_types_inspection_id(
        inspection_id
    )
    existing_ir_type_ids = {
        ir_type.ir_type_id for ir_type in existing_ir_types if ir_type.is_active is True
    }

    new_ir_type_ids = set(ir_type_ids)
    ir_type_ids_to_be_deleted = existing_ir_type_ids.difference(new_ir_type_ids)
    ir_type_ids_to_be_added = new_ir_type_ids.difference(existing_ir_type_ids)
    if ir_type_ids_to_be_deleted:
        InspectionIRTypeModel.bulk_delete_ir_type_by_ids(
            inspection_id, list(ir_type_ids_to_be_deleted), session
        )
    if ir_type_ids_to_be_added:
        InspectionIRTypeModel.bulk_insert_ir_type_per_inspection(
            inspection_id, list(ir_type_ids_to_be_added), session
        )


def _insert_or_update_inspection_attendance(
    inspection_id: int, option_ids: list[int], session=None
):
    """Insert/Update inspection attendance."""
    existing_options = InspectionAttendanceModel.get_all_attendance_by_inspection_id(
        inspection_id
    )
    existing_option_ids = {
        option.attendance_option_id
        for option in existing_options
        if option.is_active is True
    }

    new_option_ids = set(option_ids)
    options_ids_to_be_deleted = existing_option_ids.difference(new_option_ids)
    option_ids_to_be_added = new_option_ids.difference(existing_option_ids)
    if options_ids_to_be_deleted:
        InspectionAttendanceModel.bulk_delete_attendance_by_ids(
            inspection_id, list(options_ids_to_be_deleted), session
        )
    if option_ids_to_be_added:
        InspectionAttendanceModel.bulk_insert_attendance_per_inspection(
            inspection_id, list(option_ids_to_be_added), session
        )


def _insert_or_update_officers(
    inspection_id: int, officer_ids: list[int], session=None
):
    """Insert/Update inspection officers associated with a given case file."""
    existing_officers = InspectionOfficerModel.get_all_officers_by_inspection_id(
        inspection_id
    )
    existing_officer_ids = {
        officer.officer_id for officer in existing_officers if officer.is_active is True
    }

    new_officer_ids = set(officer_ids)
    officer_ids_to_be_deleted = existing_officer_ids.difference(new_officer_ids)
    officer_ids_to_be_added = new_officer_ids.difference(existing_officer_ids)
    if officer_ids_to_be_deleted:
        InspectionOfficerModel.bulk_delete_officers_by_ids(
            inspection_id, list(officer_ids_to_be_deleted), session
        )
    if officer_ids_to_be_added:
        InspectionOfficerModel.bulk_insert_officers_per_inspection(
            inspection_id, list(officer_ids_to_be_added), session
        )


def _create_unapproved_project_object(inspection_data: dict, inspection_id: int):
    """Create inspection unapproved project object."""
    return {
        "name": UNAPPROVED_PROJECT_NAME,
        "description": inspection_data.get("unapproved_project_description"),
        "authorization": inspection_data.get("unapproved_project_authorization"),
        "proponent_name": inspection_data.get("unapproved_project_proponent_name"),
        "inspection_id": inspection_id,
    }


def _create_inspection_object(inspection_data: dict):
    """Create inspection object."""
    project_id = inspection_data.get("project_id", None)
    case_file_id = inspection_data.get("case_file_id")
    return {
        "ir_number": _create_inspection_record_number(project_id, case_file_id),
        "case_file_id": inspection_data.get("case_file_id"),
        "project_id": project_id,
        "location_description": inspection_data.get("location_description", None),
        "utm": inspection_data.get("utm", None),
        "lead_officer_id": inspection_data.get("lead_officer_id"),
        "start_date": inspection_data.get("start_date"),
        "end_date": inspection_data.get("end_date"),
        "initiation_id": inspection_data.get("initiation_id"),
        "ir_status_id": inspection_data.get("ir_status_id", None),
        "project_status_id": inspection_data.get("project_status_id", None),
    }


def _create_inspection_record_number(
    project_id: int, case_file_id
):  # pylint: disable=inconsistent-return-statements
    """Generate the inspection record number."""
    project_code = _get_project_abbreviation(project_id)
    case_file = CaseFileService.get_case_file_by_id(case_file_id)

    if case_file.project_id != project_id:
        raise UnprocessableEntityError("Given project and case file doesn't match")

    count = InspectionModel.get_count_by_project_nd_case_file_id(
        project_id, case_file_id
    )
    serial_number = f"{count + 1:03}"
    return f"{project_code}_{case_file.case_file_number}_{serial_number}"


def _get_project_abbreviation(
    project_id: int,
):  # pylint: disable=inconsistent-return-statements
    """Return the project abbreviation."""
    if project_id:
        project = TrackService.get_project_by_id(project_id)
        return project.get("abbreviation")
    return UNAPPROVED_PROJECT_CODE


def _create_inspection_other_attendance_object(
    inspection_data: dict, inspection_id: int
):
    """Return inspection other attendance object."""
    return {
        "municipal": inspection_data.get("attendance_municipal"),
        "other": inspection_data.get("attendance_other"),
        "inspection_id": inspection_id,
    }
