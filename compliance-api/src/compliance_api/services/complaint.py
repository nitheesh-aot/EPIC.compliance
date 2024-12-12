"""Service for managing complaint."""

from datetime import datetime

from flask import g

from compliance_api.auth import auth
from compliance_api.exceptions import PermissionDeniedError, ResourceNotFoundError, UnprocessableEntityError
from compliance_api.models.case_file import CaseFile as CaseFileModel
from compliance_api.models.complaint import Complaint as ComplaintModel
from compliance_api.models.complaint import ComplaintReqEACDetail as ComplaintReqEACDetailModel
from compliance_api.models.complaint import ComplaintReqOrderDetail as ComplaintReqOrderDetailModel
from compliance_api.models.complaint import ComplaintReqScheduleBDetail as ComplaintReqScheduleBDetailModel
from compliance_api.models.complaint import ComplaintRequirementDetail as ComplaintRequirementDetailModel
from compliance_api.models.complaint import ComplaintRequirementSourceEnum
from compliance_api.models.complaint import ComplaintSource as ComplaintSourceModel
from compliance_api.models.complaint import ComplaintSourceContact as ComplaintSourceContactModel
from compliance_api.models.complaint import ComplaintStatusEnum
from compliance_api.models.db import session_scope
from compliance_api.services.case_file import CaseFileService
from compliance_api.services.epic_track_service.track_service import TrackService
from compliance_api.utils.constant import INPUT_DATE_TIME_FORMAT, UNAPPROVED_PROJECT_CODE
from compliance_api.utils.enum import ContextEnum, PermissionEnum

from .continuation_report import ContinuationReportService


class ComplaintService:
    """Complaint Service."""

    @classmethod
    def get_complaint_sources(cls):
        """Get complaint sources."""
        return ComplaintSourceModel.get_all(sort_by="sort_order")

    @classmethod
    def get_all(cls):
        """Get all complaints."""
        return ComplaintModel.get_all(default_filters=False)

    @classmethod
    def get_by_id(cls, complaint_id):
        """Get complaint by id."""
        complaint = ComplaintModel.find_by_id(complaint_id)
        if not complaint:
            return None
        return complaint

    @classmethod
    def get_by_complaint_no(cls, complaint_no):
        """Get complaint details by complaint number."""
        complaint = ComplaintModel.get_by_complaint_number(complaint_no)
        if not complaint:
            return None
        if complaint.source_first_nation_id:
            complaint.first_nation = _get_first_nation(complaint.source_first_nation_id)
        return complaint

    @classmethod
    def get_source_contact(cls, complaint_id):
        """Complaint source contact."""
        return ComplaintSourceContactModel.get_by_complaint(complaint_id)

    @classmethod
    def get_requirement_details(cls, complaint_id):
        """Complaint requirement details."""
        complaint = ComplaintModel.find_by_id(complaint_id)
        if not complaint:
            raise ResourceNotFoundError(f"Compalint with id: {complaint_id} not found")
        requirement = ComplaintRequirementDetailModel.get_by_complaint(complaint_id)
        data = None
        if (
            complaint.requirement_source_id
            == ComplaintRequirementSourceEnum.EAC_CERTIFICATE.value
        ):
            data = ComplaintReqEACDetailModel.get_by_requirement(requirement.id)
        if (
            complaint.requirement_source_id
            == ComplaintRequirementSourceEnum.ORDER.value
        ):
            data = ComplaintReqOrderDetailModel.get_by_requirement(requirement.id)
        if (
            complaint.requirement_source_id
            == ComplaintRequirementSourceEnum.SCHEDULE_B.value
        ):
            data = ComplaintReqScheduleBDetailModel.get_by_requirement(requirement.id)
        if data:
            setattr(requirement, "additional_details", data.to_dict())
        return requirement

    @classmethod
    def get_by_case_file_id(cls, case_file_id):
        """Get all complaints by case file id."""
        return ComplaintModel.get_by_params({"case_file_id": case_file_id})

    @classmethod
    def update(cls, complaint_id: int, complaint_data: dict):
        """Update complaint."""
        _access_check_update(complaint_id)
        complaint_obj = _create_complaint_update_object(complaint_data)
        with session_scope() as session:
            complaint = ComplaintModel.find_by_id(complaint_id)
            old_requirement_source_id = complaint.requirement_source_id
            updated_complaint = ComplaintModel.update_complaint(
                complaint_id, complaint_obj, session
            )
            contact_obj = _create_source_type_contact_object(
                complaint_data, complaint_id
            )
            ComplaintSourceContactModel.update_contact(
                complaint_id, contact_obj, session
            )
            if old_requirement_source_id:
                _remove_existing_requirement_details(
                    old_requirement_source_id, complaint_id, session
                )
            if _has_requirement_source(complaint_data):
                requirement_source_obj = _create_requirement_source_detail_obj(
                    complaint_data, complaint_id
                )
                if not old_requirement_source_id:
                    created_requirement_source = (
                        ComplaintRequirementDetailModel.create_detail(
                            requirement_source_obj, session
                        )
                    )
                else:
                    created_requirement_source = (
                        ComplaintRequirementDetailModel.update_detail(
                            complaint_id, requirement_source_obj, session
                        )
                    )
                _create_requirement_source_more_details(
                    complaint_data, created_requirement_source.id, session
                )
        return updated_complaint

    @classmethod
    def create(cls, complaint_data: dict):
        """Create complaint."""
        _access_check_create(complaint_data)
        complaint_obj = _create_complaint_object(complaint_data)
        with session_scope() as session:
            created_complaint = ComplaintModel.create_complaint(complaint_obj, session)
            contact_obj = _create_source_type_contact_object(
                complaint_data, created_complaint.id
            )
            ComplaintSourceContactModel.create_contact(contact_obj, session)
            if _has_requirement_source(complaint_data):
                requirement_source_obj = _create_requirement_source_detail_obj(
                    complaint_data, created_complaint.id
                )
                created_requirement_source = (
                    ComplaintRequirementDetailModel.create_detail(
                        requirement_source_obj, session
                    )
                )
                _create_requirement_source_more_details(
                    complaint_data, created_requirement_source.id, session
                )
            cr_entry = _create_cr_entry(
                created_complaint.id,
                created_complaint.complaint_number,
                "created",
                created_complaint.case_file_id,
            )
            ContinuationReportService.create(
                cr_entry, sys_generated=True, ho_session=session
            )
        return created_complaint

    @classmethod
    def delete_by_case_file(cls, case_file_id, ho_session=None):
        """Delete complaint by case file id."""
        with session_scope() as session:
            ComplaintModel.delete_by_case_file(case_file_id, ho_session or session)
            ComplaintSourceContactModel.delete_by_case_file(
                case_file_id, ho_session or session
            )
            ComplaintRequirementDetailModel.delete_by_case_file(
                case_file_id, ho_session or session
            )

    @classmethod
    def delete_complaint(cls, complaint_id):
        """Delete complaint."""
        with session_scope() as session:
            ComplaintModel.delete_complaint(complaint_id, session)
            ComplaintSourceContactModel.delete_by_complaint(complaint_id, session)
            ComplaintRequirementDetailModel.delete_by_complaint(complaint_id, session)

    @classmethod
    def change_case_file_status(cls, complaint_id, status_data):
        """Change the status of the complaint."""
        _access_check_update(complaint_id)
        complaint = ComplaintModel.find_by_id(complaint_id)
        if not complaint:
            raise ResourceNotFoundError("Complaint not found.")
        status_enum = ComplaintStatusEnum(status_data.get("status"))
        if status_enum == complaint.status:
            raise UnprocessableEntityError(
                f"The complaint is already in {status_enum.value} status."
            )
        with session_scope() as session:
            ComplaintModel.change_status(complaint_id, status_enum, session)
            cr_entry = _create_cr_entry(
                complaint_id,
                complaint.complaint_number,
                "reopened" if status_enum.value == "Open" else "closed",
                complaint.case_file_id,
            )
            ContinuationReportService.create(
                cr_entry, sys_generated=True, ho_session=session
            )


def _access_check_create(complaint_data: dict):
    """Access check."""
    if not auth.has_permission(
        [PermissionEnum.SUPERUSER]
    ) and not CaseFileService.is_logged_user_primary_or_officer(
        complaint_data.get("case_file_id")
    ):
        raise PermissionDeniedError(
            "You don't have the correct permission to perform this operation."
        )


def _access_check_update(complaint_id):
    """Acces check create."""
    auth_user_guid = g.token_info["preferred_username"]
    complaint = ComplaintModel.find_by_id(complaint_id)
    if (
        not auth.has_permission([PermissionEnum.SUPERUSER])
        and not complaint.primary_officer.auth_user_guid == auth_user_guid
    ):
        raise PermissionDeniedError(
            "You don't have the correct permission to perform this operation."
        )


def _remove_existing_requirement_details(
    old_requirement_source_id, complaint_id, session=None
):
    """Remove the existing requirement source details before updating further."""
    requirement_details = ComplaintRequirementDetailModel.get_by_complaint(complaint_id)
    if requirement_details:
        if (
            old_requirement_source_id
            == ComplaintRequirementSourceEnum.EAC_CERTIFICATE.value
        ):
            ComplaintReqEACDetailModel.delete_eac_details(
                requirement_details.id, session
            )
        if old_requirement_source_id == ComplaintRequirementSourceEnum.ORDER.value:
            ComplaintReqOrderDetailModel.delete_order_details(
                requirement_details.id, session
            )
        if old_requirement_source_id == ComplaintRequirementSourceEnum.SCHEDULE_B.value:
            ComplaintReqScheduleBDetailModel.delete_schedule_b_details(
                requirement_details.id, session
            )


def _has_requirement_source(complaint_data):
    """Check if requirement source selected or not."""
    return complaint_data.get("requirement_source_id", None) is not None


def _create_requirement_source_more_details(
    complaint_data: dict, requirement_id, session
):
    """Create requirement source more details."""
    requirement_source_id = complaint_data.get("requirement_source_id", None)
    if requirement_source_id:
        if requirement_source_id == ComplaintRequirementSourceEnum.SCHEDULE_B.value:
            obj = _create_schedule_b_detail_obj(complaint_data, requirement_id)
            ComplaintReqScheduleBDetailModel.create(obj, session)
        elif requirement_source_id == ComplaintRequirementSourceEnum.ORDER.value:
            obj = _create_order_detail_obj(complaint_data, requirement_id)
            ComplaintReqOrderDetailModel.create(obj, session)
        elif (
            requirement_source_id
            == ComplaintRequirementSourceEnum.EAC_CERTIFICATE.value
        ):
            obj = _create_eac_detail_obj(complaint_data, requirement_id)
            ComplaintReqEACDetailModel.create(obj, session)


def _create_requirement_source_detail_obj(complaint_data: dict, complaint_id):
    """Create requirement source detail object."""
    requirement_source_info = complaint_data.get("requirement_source_details", None)
    if not requirement_source_info:
        return {}
    return {
        "complaint_id": complaint_id,
        "topic_id": requirement_source_info.get("topic_id"),
        "description": requirement_source_info.get("description", None),
    }


def _create_source_type_contact_object(complaint_data: dict, complaint_id):
    """Create source contact info."""
    contact_info = complaint_data.get("complaint_source_contact", None)
    if not contact_info:
        return {}
    return {
        "complaint_id": complaint_id,
        "full_name": contact_info.get("full_name", None),
        "email": contact_info.get("email", None),
        "phone": contact_info.get("phone", None),
        "comment": contact_info.get("comment", None),
        "description": contact_info.get("description", None),
    }


def _create_complaint_update_object(complaint_data: dict):
    """Create complaint update object."""
    return {
        "location_description": complaint_data.get("location_description", None),
        "concern_description": complaint_data.get("concern_description", None),
        "primary_officer_id": complaint_data.get("primary_officer_id", None),
        "date_received": complaint_data.get("date_received"),
        "requirement_source_id": complaint_data.get("requirement_source_id", None),
        "source_type_id": complaint_data.get("source_type_id"),
        "source_agency_id": complaint_data.get("source_agency_id", None),
        "source_first_nation_id": complaint_data.get("source_first_nation_id", None),
    }


def _create_complaint_object(complaint_data: dict):
    """Create complaint object."""
    case_file_id = complaint_data.get("case_file_id")
    case_file = CaseFileModel.find_by_id(case_file_id)
    result = _create_complaint_update_object(complaint_data)
    result["complaint_number"] = _create_complaint_number(
        case_file.project_id, case_file_id
    )
    result["case_file_id"] = case_file_id
    result["status"] = ComplaintStatusEnum.OPEN
    return result


def _create_complaint_number(
    project_id,
    case_file_id,
):  # pylint: disable=inconsistent-return-statements
    """Generate the complaint number."""
    project_code = _get_project_abbreviation(project_id)
    case_file = CaseFileService.get_by_id(case_file_id)
    if not case_file:
        raise ResourceNotFoundError("Given case file doesn't exist")
    if case_file.project_id != project_id:
        raise UnprocessableEntityError("Given project and case file doesn't match")

    count = ComplaintModel.get_count_by_project_nd_case_file_id(
        project_id, case_file_id
    )
    serial_number = f"{count + 1:03}"
    return f"{project_code}_{case_file.case_file_number}_CM{serial_number}"


def _get_project_abbreviation(
    project_id: int,
):  # pylint: disable=inconsistent-return-statements
    """Return the project abbreviation."""
    if project_id:
        project = TrackService.get_project_by_id(project_id)
        return project.get("abbreviation")
    return UNAPPROVED_PROJECT_CODE


def _create_eac_detail_obj(complaint_data: dict, requirement_id):
    """Create requirement source eac detail obj."""
    req_info = complaint_data.get("requirement_source_details", {})
    return {
        "req_id": requirement_id,
        "amendment_number": req_info.get("amendment_number", None),
        "amendment_condition_number": req_info.get("amendment_condition_number", None),
    }


def _create_order_detail_obj(complaint_data: dict, requirement_id):
    """Create requirement source order detail obj."""
    req_info = complaint_data.get("requirement_source_details", {})
    return {
        "req_id": requirement_id,
        "order_number": req_info.get("order_number", None),
    }


def _create_schedule_b_detail_obj(complaint_data: dict, requirement_id):
    """Create requirement source schedule b detail obj."""
    req_info = complaint_data.get("requirement_source_details", {})
    return {
        "req_id": requirement_id,
        "condition_number": req_info.get("condition_number"),
    }


def _get_first_nation(first_nation_id):
    """Set the name of the first nations from epic.track."""
    response = TrackService.get_first_nation_by_id(first_nation_id)
    return {"id": response.get("id"), "name": response.get("name")}


def _create_cr_entry(complaint_id, complaint_no, action, case_file_id):
    """Create the continuation report entry."""
    return {
        "case_file_id": case_file_id,
        "text": f"{complaint_no} is {action}",
        "rich_text": f"<p>{complaint_no} is {action}</p>",
        "date_created": datetime.utcnow().strftime(INPUT_DATE_TIME_FORMAT),
        "context_type": ContextEnum.COMPLAINT,
        "context_id": complaint_id,
        "keys": [{"key": complaint_no, "key_context": ContextEnum.COMPLAINT}],
    }
