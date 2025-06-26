"""Service for managing Inspection."""

from datetime import datetime

from compliance_api.auth import auth
from compliance_api.exceptions import (
    BusinessError, PermissionDeniedError, ResourceNotFoundError, UnprocessableEntityError)
from compliance_api.models import CaseFile as CaseFileModel
from compliance_api.models import CaseFileStatusEnum
from compliance_api.models import Inspection as InspectionModel
from compliance_api.models import InspectionAgency as InspectionAgencyModel
from compliance_api.models import InspectionAttendance as InspectionAttendanceModel
from compliance_api.models import InspectionAttendanceOption as InspectionAttendanceOptionModel
from compliance_api.models import InspectionAttendanceOptionEnum
from compliance_api.models import InspectionFirstnation as InspectionFirstnationModel
from compliance_api.models import InspectionInitiationOption as InspectionInitiationOptionModel
from compliance_api.models import InspectionOfficer as InspectionOfficerModel
from compliance_api.models import InspectionOtherAttendance as InspectionOtherAttendanceModel
from compliance_api.models import InspectionStatusEnum
from compliance_api.models import InspectionType as InspectionTypeModel
from compliance_api.models import InspectionTypeOption as InspectionTypeOptionModel
from compliance_api.models import IRStatusOption as IRStatusOptionModel
from compliance_api.models import Order as OrderModel
from compliance_api.models import WarningLetter as WarningLetterModel
from compliance_api.models.db import session_scope
from compliance_api.models.enforcement_action import EnforcementActionOptionEnum, EnforcementActionOption as EnforcementActionOptionModel
from compliance_api.services.case_file import CaseFileService
from compliance_api.services.service_utils import ServiceUtils
from compliance_api.utils.constant import INPUT_DATE_TIME_FORMAT, UNAPPROVED_PROJECT_CODE
from compliance_api.utils.enum import ContextEnum, PermissionEnum

from .epic_track_service.track_service import TrackService


class InspectionService:
    """Inspection Service Class."""

    @classmethod
    def get_all_attendance_options(cls):
        """Get inspection attendance options."""
        return InspectionAttendanceOptionModel.get_all(sort_by="sort_order")

    @classmethod
    def get_inspection_type_options(cls):
        """Get inspection type options."""
        return InspectionTypeOptionModel.get_all(sort_by="sort_order")

    @classmethod
    def get_initiation_options(cls):
        """Get inspection initiation options."""
        return InspectionInitiationOptionModel.get_all(sort_by="sort_order")

    @classmethod
    def get_ir_status_options(cls):
        """Get inspection record status options."""
        return IRStatusOptionModel.get_all(sort_by="sort_order")

    @classmethod
    def get_all_inspections(cls):
        """Get all inspections."""
        return InspectionModel.get_all_inspections()

    @classmethod
    def get_inspection_details(cls, case_file_id):
        """Get inspection details."""
        inspections = InspectionModel.get_by_params({"case_file_id": case_file_id})
        for inspection in inspections:
            requirement_details = []
            orders = OrderModel.get_by_inspection_id(inspection.id)
            warning_letters = WarningLetterModel.get_by_inspection_id(inspection.id)
            if inspection.inspection_requirements:
                requirements = inspection.inspection_requirements
                for requirement in requirements:
                    if requirement.enforcement_actions:
                        for action in requirement.enforcement_actions:
                            item = {
                                "requirement_id": requirement.id,
                                "requirement_summary": requirement.summary,
                                "requirement_sort_order": requirement.sort_order,
                                "enforcement_action": {
                                    "id": EnforcementActionOptionModel.find_by_id(
                                        action.enforcement_action_id
                                    ).id,
                                    "name": EnforcementActionOptionModel.find_by_id(
                                        action.enforcement_action_id
                                    ).name,
                                },
                            }
                            first_requirement_details = (
                                requirement.requirement_source_details[0]
                            )
                            number_field = (
                                ServiceUtils.get_requirement_source_number_field(
                                    first_requirement_details
                                )
                            )
                            item["requirement_number"] = number_field.split(" ")[1]
                            item["requirement_source_name"] = (
                                first_requirement_details.requirement_source.name
                            )
                            if (
                                EnforcementActionOptionEnum(
                                    action.enforcement_action_id
                                )
                                == EnforcementActionOptionEnum.ORDER
                            ):
                                requirement_orders = [
                                    order
                                    for order in orders
                                    if requirement.id
                                    in [
                                        req_map.inspection_requirement_id
                                        for req_map in order.order_requirement_maps
                                    ]
                                ]
                                if (
                                    len(requirement_orders) > 0
                                ):
                                    if requirement_orders[0].order_approvals:
                                        item["enforcement_action"]["approval_status"] = {
                                            "id": requirement_orders[0]
                                            .order_approvals[0]
                                            .approval_status.name,
                                            "name": requirement_orders[0]
                                            .order_approvals[0]
                                            .approval_status.value,
                                        }
                                    item["enforcement_action"]["progress"] = {
                                        "id": requirement_orders[0].order_progress.name,
                                        "name": requirement_orders[
                                            0
                                        ].order_progress.value,
                                    }
                                    item["enforcement_action"]["number"] = requirement_orders[
                                        0
                                    ].order_number
                            if (
                                EnforcementActionOptionEnum(
                                    action.enforcement_action_id
                                )
                                == EnforcementActionOptionEnum.WARNING_LETTER
                            ):
                                requirement_warning_letters = [
                                    warning_letter
                                    for warning_letter in warning_letters
                                    if requirement.id
                                    in [
                                        req_map.inspection_requirement_id
                                        for req_map in warning_letter.warning_letter_requirement_map
                                    ]
                                ]
                                if (
                                    len(requirement_warning_letters) > 0
                                ):
                                    if (
                                        requirement_warning_letters[0]
                                        .warning_letter_approvals
                                    ):
                                        item["enforcement_action"]["approval_status"] = {
                                            "id": requirement_warning_letters[0]
                                            .warning_letter_approvals[0]
                                            .approval_status.name,
                                            "name": requirement_warning_letters[0]
                                            .warning_letter_approvals[0]
                                            .approval_status.value,
                                        }
                                    if requirement_warning_letters[0].progress:
                                        item["enforcement_action"]["progress"] = {
                                            "id": requirement_warning_letters[
                                                0
                                            ].progress.name,
                                            "name": requirement_warning_letters[
                                                0
                                            ].progress.value,
                                    },
                                    item["enforcement_action"]["number"] = requirement_warning_letters[
                                        0
                                    ].warning_letter_number
                            requirement_details.append(item)
            setattr(inspection, "requirement_details", requirement_details)
        return inspections

    @classmethod
    def get_by_case_file_id(cls, case_file_id):
        """Get all inspections by case file id."""
        return InspectionModel.get_by_params({"case_file_id": case_file_id})

    @classmethod
    def get_by_id(cls, inspection_id):
        """Return inspection by id."""
        inspection = InspectionModel.find_by_id(inspection_id)
        if not inspection:
            return None
        return _set_project_status(inspection)

    @classmethod
    def get_by_ir_number(cls, ir_number):
        """Return inspection by ir number."""
        inspection = InspectionModel.get_by_ir_number(ir_number)
        if not inspection:
            raise ResourceNotFoundError(
                f"No inspection found for the given IR Number : {ir_number}"
            )
        return _set_project_status(inspection)

    @classmethod
    def get_other_officers(cls, inspection_id):
        """Return other officers associated with a given inspection."""
        officers = InspectionOfficerModel.get_all_by_inspection(inspection_id)
        return [officer.officer for officer in officers]

    @classmethod
    def get_attendance_options(cls, inspection_id):
        """Return attendances by inspection."""
        attendance_options = InspectionAttendanceModel.get_all_by_inspection(
            inspection_id
        )
        if attendance_options:
            other_attendances = InspectionOtherAttendanceModel.get_by_inspection(
                inspection_id
            )
            for option in attendance_options:
                setattr(option, "data", [])
                data = ""
                if (
                    option.attendance_option_id
                    == InspectionAttendanceOptionEnum.AGENCIES.value
                ):
                    agencies = InspectionAgencyModel.get_all_by_inspection(
                        inspection_id
                    )
                    data = [
                        {"id": agency.agency_id, "name": agency.agency.name}
                        for agency in agencies
                    ]
                if (
                    option.attendance_option_id
                    == InspectionAttendanceOptionEnum.ATTENDING_OFFICERS.value
                ):
                    officers = InspectionOfficerModel.get_all_by_inspection(
                        inspection_id
                    )
                    data = [
                        {
                            "id": officer.officer.id,
                            "name": f"{officer.officer.first_name} {officer.officer.last_name}",
                            "auth_user_guid": officer.officer.auth_user_guid,
                            "position": {
                                "id": officer.officer.position.id,
                                "name": officer.officer.position.name,
                            },
                        }
                        for officer in officers
                    ]
                if (
                    option.attendance_option_id
                    == InspectionAttendanceOptionEnum.FIRSTNATIONS.value
                ):
                    first_nations = InspectionFirstnationModel.get_all_by_inspection(
                        inspection_id
                    )
                    data = _set_first_nation_names(first_nations)
                if (
                    option.attendance_option_id
                    == InspectionAttendanceOptionEnum.MUNICIPAL.value
                ):
                    if other_attendances:
                        data = other_attendances.municipal
                if (
                    option.attendance_option_id
                    == InspectionAttendanceOptionEnum.OTHER.value
                ):
                    if other_attendances:
                        data = other_attendances.other
                setattr(option, "data", data)
        return attendance_options

    @classmethod
    def create(cls, inspection_data: dict):
        """Create inspection."""
        case_file_id = inspection_data.get("case_file_id")
        case_file = CaseFileModel.find_by_id(case_file_id)
        if not case_file:
            raise UnprocessableEntityError("Case file doesn't exist")
        if case_file.case_file_status == CaseFileStatusEnum.CLOSED:
            raise UnprocessableEntityError(
                "Inspection cannot be created with closed case file"
            )
        _access_check_create(inspection_data)
        inspection_obj = _create_inspection_object(inspection_data, case_file)
        with session_scope() as session:
            created_inspection = InspectionModel.create_inspection(
                inspection_obj, session
            )
            attendance_option_ids = inspection_data.get("attendance_option_ids", [])
            _insert_or_update_inspection_relationship(
                created_inspection.id,
                attendance_option_ids,
                InspectionAttendanceModel,
                "attendance_option_id",
                session,
            )
            _insert_or_update_inspection_relationship(
                created_inspection.id,
                inspection_data.get("attending_officer_ids", []),
                InspectionOfficerModel,
                "officer_id",
                session,
            )
            _insert_or_update_inspection_relationship(
                created_inspection.id,
                inspection_data.get("agency_attendance_ids", []),
                InspectionAgencyModel,
                "agency_id",
                session,
            )
            _insert_or_update_inspection_relationship(
                created_inspection.id,
                inspection_data.get("firstnation_attendance_ids", []),
                InspectionFirstnationModel,
                "firstnation_id",
                session,
            )
            _insert_or_update_inspection_relationship(
                created_inspection.id,
                inspection_data.get("inspection_type_ids", []),
                InspectionTypeModel,
                "type_id",
                session,
            )
            if {
                InspectionAttendanceOptionEnum.MUNICIPAL.value,
                InspectionAttendanceOptionEnum.OTHER.value,
            }.intersection(attendance_option_ids):
                other_attendance_obj = _create_inspection_other_attendance_object(
                    inspection_data, created_inspection.id
                )
                InspectionOtherAttendanceModel.create_attendance(
                    other_attendance_obj, session
                )
        return created_inspection

    @classmethod
    def update(cls, inspection_id: int, inspection_data: dict):
        """Update inspection."""
        inspection = InspectionModel.find_by_id(inspection_id)
        if not inspection:
            raise ResourceNotFoundError(f"Inspection with ID {inspection_id} not found")
        _inspection_status_check(inspection)
        ServiceUtils.access_check_update_for_inspection(inspection)
        inspection_obj = _create_inspection_update_obj(inspection_data)
        with session_scope() as session:
            updated_case_file = InspectionModel.update_inspection(
                inspection_id, inspection_obj, session
            )
            _insert_or_update_inspection_relationship(
                inspection_id,
                inspection_data.get("attending_officer_ids", []),
                InspectionOfficerModel,
                "officer_id",
                session,
            )
            _insert_or_update_inspection_relationship(
                inspection_id,
                inspection_data.get("inspection_type_ids", []),
                InspectionTypeModel,
                "type_id",
                session,
            )
            attendance_option_ids = inspection_data.get("attendance_option_ids", [])
            _insert_or_update_inspection_relationship(
                inspection_id,
                attendance_option_ids,
                InspectionAttendanceModel,
                "attendance_option_id",
                session,
            )
            _insert_or_update_inspection_relationship(
                inspection_id,
                inspection_data.get("agency_attendance_ids", []),
                InspectionAgencyModel,
                "agency_id",
                session,
            )
            if {
                InspectionAttendanceOptionEnum.MUNICIPAL.value,
                InspectionAttendanceOptionEnum.OTHER.value,
            }.intersection(attendance_option_ids):
                other_attendance_obj = _create_inspection_other_attendance_object(
                    inspection_data, inspection_id
                )
                InspectionOtherAttendanceModel.update_attendance(
                    inspection_id, other_attendance_obj, session
                )
            _insert_or_update_inspection_relationship(
                inspection_id,
                inspection_data.get("firstnation_attendance_ids", []),
                InspectionFirstnationModel,
                "firstnation_id",
                session,
            )
        return updated_case_file

    @classmethod
    def change_status(cls, inspection_id, status):
        """Close the inspection."""
        inspection = InspectionModel.find_by_id(inspection_id)
        if not inspection:
            raise ResourceNotFoundError(f"Inspection with ID {inspection_id} not found")
        ServiceUtils.access_check_update_for_inspection(inspection)
        inspection = InspectionModel.find_by_id(inspection_id)
        if not inspection:
            raise ResourceNotFoundError("Inspection not found.")
        status_enum = InspectionStatusEnum(status.get("status"))
        if inspection.inspection_status == InspectionStatusEnum.CANCELED:
            raise UnprocessableEntityError(
                "No status change can be perforemed on CANCELED inspection"
            )
        InspectionModel.update_inspection(
            inspection_id,
            {"inspection_status": InspectionStatusEnum(status_enum.value)},
        )

    @classmethod
    def delete_by_case_file(cls, case_file_id, ho_session=None):
        """Delete inspection and related entries by case file id."""
        with session_scope() as session:
            InspectionModel.delete_by_case_file(case_file_id, ho_session or session)
            InspectionAgencyModel.delete_by_case_file(
                case_file_id, ho_session or session
            )
            InspectionAttendanceModel.delete_by_case_file(
                case_file_id, ho_session or session
            )
            InspectionFirstnationModel.delete_by_case_file(
                case_file_id, ho_session or session
            )
            InspectionOfficerModel.delete_by_case_file(
                case_file_id, ho_session or session
            )
            InspectionTypeModel.delete_by_case_file(case_file_id, ho_session or session)
            InspectionOtherAttendanceModel.delete_by_case_file(
                case_file_id, ho_session or session
            )

    @classmethod
    def delete_inspection(cls, inspection_id):
        """Delete inspection."""
        inspection = InspectionModel.find_by_id(inspection_id)
        if not inspection:
            raise ResourceNotFoundError(f"Inspection with ID {inspection_id} not found")
        _inspection_status_check(inspection)
        with session_scope() as session:
            InspectionModel.delete_inspection(inspection_id, session)
            InspectionTypeModel.delete_inspection_type(inspection_id, session)
            InspectionOtherAttendanceModel.delete_inspection_attendance(
                inspection_id, session
            )
            InspectionOfficerModel.delete_inspection_officer(inspection_id, session)
            InspectionFirstnationModel.delete_inspection_firstnation(
                inspection_id, session
            )
            InspectionAttendanceModel.delete_inspection_attendance(
                inspection_id, session
            )
            InspectionAgencyModel.delete_inspection_agency(inspection_id)


def _inspection_status_check(inspection: InspectionModel):
    """Check the inspection status."""
    invalid_statuses = {InspectionStatusEnum.CANCELED, InspectionStatusEnum.CLOSED}
    if inspection.inspection_status in invalid_statuses:
        raise UnprocessableEntityError(
            f"You cannot make changes to  {inspection.inspection_status.name} inspection"
        )
    return inspection


def _access_check_create(inspection_data: dict):
    """Access check."""
    if not auth.has_permission(
        [PermissionEnum.SUPERUSER]
    ) and not CaseFileService.is_logged_user_primary_or_officer(
        inspection_data.get("case_file_id")
    ):
        raise PermissionDeniedError(
            "You don't have the correct permission to perform this operation."
        )


def _set_project_status(inspection):
    """Set inspection project parameters."""
    if inspection.project_status_id:
        project_statuses = TrackService.get_project_statuses()
        status = next(
            (
                stat
                for stat in project_statuses
                if stat["id"] == inspection.project_status_id
            ),
            None,
        )
        if not status:
            raise BusinessError(
                f"No status found with ID {inspection.project_status_id}", 500
            )
        setattr(inspection, "project_status", status)
    return inspection


def _set_first_nation_names(first_nation_list: list):
    """Set the name of the first nations from epic.track."""
    result = []
    for first_nation in first_nation_list:
        response = TrackService.get_first_nation_by_id(first_nation.firstnation_id)
        result.append({"id": response.get("id"), "name": response.get("name")})
    return result


# pylint: disable=too-many-arguments
def _insert_or_update_inspection_relationship(
    inspection_id: int,
    entity_ids: list[int],
    model_class,
    entity_id_attr: str,
    session=None,
    is_active_attr: str = "is_active",
):
    """
    Insert/Update inspection relationships in a generic way.

    Args:
        inspection_id (int): The ID of the inspection.
        entity_ids (list[int]): List of IDs representing related entities (e.g., firstnations, agencies).
        model_class (Class): The model class to perform the operations (e.g., InspectionFirstnationModel).
        entity_id_attr (str): The attribute name in the model for the entity ID (e.g., 'firstnation_id').
        session: The database session to use, if applicable.
        is_active_attr (str): The attribute name for checking active entities (default is 'is_active').
    """
    # Retrieve existing relationships
    existing_entities = model_class.get_all_by_inspection(inspection_id)
    existing_entity_ids = {
        getattr(entity, entity_id_attr)
        for entity in existing_entities
        if getattr(entity, is_active_attr) is True
    }

    # Calculate the differences
    new_entity_ids = set(entity_ids)
    entity_ids_to_be_deleted = existing_entity_ids.difference(new_entity_ids)
    entity_ids_to_be_added = new_entity_ids.difference(existing_entity_ids)

    # Perform bulk delete and insert
    if entity_ids_to_be_deleted:
        model_class.bulk_delete(inspection_id, list(entity_ids_to_be_deleted), session)

    if entity_ids_to_be_added:
        model_class.bulk_insert(inspection_id, list(entity_ids_to_be_added), session)


def _create_inspection_update_obj(inspection_data: dict):
    """Create inspection update object."""
    return {
        "project_description": inspection_data.get("project_description", None),
        "location_description": inspection_data.get("location_description", None),
        "utm": inspection_data.get("utm", None),
        "primary_officer_id": inspection_data.get("primary_officer_id"),
        "start_date": inspection_data.get("start_date"),
        "end_date": inspection_data.get("end_date"),
        "initiation_id": inspection_data.get("initiation_id"),
        "debrief_date": inspection_data.get("debrief_date", None),
        "project_status_id": inspection_data.get("project_status_id", None),
    }


def _create_inspection_object(inspection_data: dict, case_file):
    """Create inspection object."""
    return {
        "ir_number": _create_inspection_record_number(
            case_file.project_id, case_file.id
        ),
        "case_file_id": case_file.id,
        "project_id": case_file.project_id,
        "project_description": inspection_data.get("project_description", None),
        "location_description": inspection_data.get("location_description", None),
        "utm": inspection_data.get("utm", None),
        "primary_officer_id": inspection_data.get("primary_officer_id"),
        "start_date": inspection_data.get("start_date"),
        "end_date": inspection_data.get("end_date"),
        "initiation_id": inspection_data.get("initiation_id"),
        "debrief_date": inspection_data.get("debrief_date", None),
        "project_status_id": inspection_data.get("project_status_id", None),
        "inspection_status": InspectionStatusEnum.OPEN,
    }


def _create_inspection_record_number(
    project_id: int, case_file_id
):  # pylint: disable=inconsistent-return-statements
    """Generate the inspection record number."""
    project_code = _get_project_abbreviation(project_id)
    case_file = CaseFileModel.find_by_id(case_file_id)
    if not case_file:
        raise ResourceNotFoundError("Given case file doesn't exist")
    if case_file.project_id != project_id:
        raise UnprocessableEntityError("Given project and case file doesn't match")

    count = InspectionModel.get_count_by_project_nd_case_file_id(
        project_id, case_file_id
    )
    serial_number = f"{count + 1:03}"
    return f"{project_code}_{case_file.case_file_number}_IR{serial_number}"


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


def _create_cr_entry(inspection_id, ir_no, case_file_id, text):
    """Create the continuation report entry."""
    if text == "open":
        text = "reopened"
    return {
        "case_file_id": case_file_id,
        "text": f"{ir_no} is {text}",
        "rich_text": f"<p>{ir_no} is {text}</p>",
        "date_created": datetime.utcnow().strftime(INPUT_DATE_TIME_FORMAT),
        "context_type": ContextEnum.INSPECTION,
        "context_id": inspection_id,
        "keys": [{"key": ir_no, "key_context": ContextEnum.INSPECTION}],
    }
