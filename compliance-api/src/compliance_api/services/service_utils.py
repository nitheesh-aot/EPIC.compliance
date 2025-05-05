"""Some common methods which can be used across different services."""

import re

from flask import g

from compliance_api.auth import auth
from compliance_api.exceptions import PermissionDeniedError, ResourceNotFoundError
from compliance_api.models import Inspection as InspectionModel
from compliance_api.models import InspectionRecord as InspectionRecordModel
from compliance_api.models import InspectionRequirement as InspectionRequirementModel
from compliance_api.models import InspectionRequirementImage as InspectionRequirementImageModel
from compliance_api.models.compliance_finding import ComplianceFindingOptionEnum
from compliance_api.models.inspection import InspectionReqSourceDetail as InspectionReqSourceDetailModel
from compliance_api.models.inspection.inspection_req_image import ImageTypeEnum
from compliance_api.models.inspection.inspection_requirement import InspectionRequirementTypeEnum
from compliance_api.models.requirement_source import RequirementSourceEnum
from compliance_api.models.unapproved_project import UnapprovedProject as UnapprovedProjectModel
from compliance_api.utils.enum import PermissionEnum

from .document_service.doc_service import DocService
from .document_service.doc_service_enum import ActionOnFileEnum
from .epic_track_service.track_service import TrackService


class ServiceUtils:
    """ServiceUtils class."""

    @staticmethod
    def access_check_update_for_inspection(inspection: dict):
        """Access check for update an inspection."""
        auth_user_guid = g.token_info["preferred_username"]
        if (
            not auth.has_permission([PermissionEnum.SUPERUSER])
            and not inspection.primary_officer.auth_user_guid == auth_user_guid
        ):
            raise PermissionDeniedError(
                "You don't have the correct permission to perform this operation."
            )

    @staticmethod
    def inspection_exist_check(inspection_id: int):
        """Check if the inspection exist or not."""
        inspection = InspectionModel.find_by_id(inspection_id)
        if not inspection:
            raise ResourceNotFoundError("Inspection not found")
        return inspection

    @staticmethod
    def inspection_record_exist_check(inspection_record_id: int):
        """Check if the inspection record exist or not."""
        inspection_record = InspectionRecordModel.find_by_id(inspection_record_id)
        if not inspection_record:
            raise ResourceNotFoundError("Inspection record not found")
        return inspection_record

    @staticmethod
    def get_project_details(project_id: int, case_file_id: int, project_status_id=None):
        """
        Get project details.

        :param project_id: The project id.
        :param case_file_id: The case file id.
        :param project_status_id: The project status id.
        """
        eac_certicate = proponent = name = None
        if not project_id:
            project = UnapprovedProjectModel.get_by_case_file_id(case_file_id)
            if project:
                eac_certicate = project.authorization or "N/A"
                proponent = project.regulated_party
                name = project.name
        else:
            project = TrackService.get_project_by_id(project_id)
            if project:
                eac_certicate = project.get("ea_certificate") or "N/A"
                proponent = project.get("proponent").get("name")
                name = project.get("name")
        project_status_name = None
        if project_status_id:
            project_statuses = TrackService.get_project_statuses()
            project_status = next(
                (
                    status
                    for status in project_statuses
                    if status.get("id") == project_status_id
                ),
                None,
            )
            if project_status:
                project_status_name = project_status.get("name")
        return {
            "eac_certificate": eac_certicate,
            "proponent": proponent,
            "name": name,
            "project_state": project_status_name,
            "certificate_label": (
                "Exemption Order #"
                if re.match(r"^X\d{1,3}-\d{1,3}$", eac_certicate)
                else "EA Certificate #"
            ),
            "proponent_label": (
                "Certificate Holder"
                if re.match(r"^E\d{1,3}-\d{1,3}$", eac_certicate)
                else "Regulated Party"
            ),
        }

    @staticmethod
    def get_formatted_requirement_details(
        requirements: [InspectionRequirementModel], photo_required: bool = False
    ):
        """
        Get requirement details.

        :param requirements: The requirements.
        :param photo_required: Whether to include photos.
        """
        result = []
        for requirement in requirements:
            #  Skip regulatory considerations
            if requirement.req_type == InspectionRequirementTypeEnum.REG:
                continue
            req = {
                "requirement_id": requirement.id,
                "requirement_findings": requirement.findings,
                "requirement_summary": requirement.summary,
                "sort_order": requirement.sort_order,
                "compliance_finding": (
                    requirement.compliance_finding.name
                    if requirement.compliance_finding
                    else None
                ),
                "enforcement_action": (
                    "Not Applicable"
                    if requirement.compliance_finding_id
                    == ComplianceFindingOptionEnum.IN.value
                    else "Not Determined"
                ),
                "requirement_source_details": [],
                "requirement_photos": [],
                "requirement_figures": [],
            }
            if requirement.requirement_source_details:
                for detail in requirement.requirement_source_details:
                    req["requirement_source_details"].append(
                        {
                            "requirement_source_name": detail.requirement_source.name,
                            "appendix_no": (
                                detail.appendix.appendix_no if detail.appendix else None
                            ),
                            "requirement_source_number": ServiceUtils.get_requirement_source_number_field(
                                detail
                            ),
                            "requirement_source_description": detail.description,
                            "requirement_documents": [],
                        }
                    )
                    if detail.documents:
                        for doc in detail.documents:
                            req["requirement_source_details"][-1][
                                "requirement_documents"
                            ].append(
                                {
                                    "document_title": doc.document_title,
                                    "appendix_no": (
                                        doc.appendix.appendix_no
                                        if doc.appendix
                                        else None
                                    ),
                                    "section_number": doc.section_number,
                                    "section_title": doc.section_title,
                                    "description": doc.description,
                                }
                            )
            if photo_required:
                photos = InspectionRequirementImageModel.find_all_images(
                    requirement.id, ImageTypeEnum.PHOTO
                )
                figures = InspectionRequirementImageModel.find_all_images(
                    requirement.id, ImageTypeEnum.FIGURE
                )
                for photo in photos:
                    photo_response = DocService.get_presigned_url(
                        {
                            "relative_url": photo.relative_url,
                            "action": ActionOnFileEnum.GET.value,
                        }
                    )
                    req["requirement_photos"].append(
                        {
                            "photo_caption": photo.caption,
                            "photo_number": photo.sort_order,
                            "photo_url": photo_response.get("presigned_url"),
                        }
                    )
                for figure in figures:
                    figure_response = DocService.get_presigned_url(
                        {
                            "relative_url": figure.relative_url,
                            "action": ActionOnFileEnum.GET.value,
                        }
                    )
                    req["requirement_figures"].append(
                        {
                            "figure_caption": figure.caption,
                            "figure_number": figure.sort_order,
                            "figure_url": figure_response.get("presigned_url"),
                        }
                    )
            result.append(req)
        return result

    @staticmethod
    def get_requirement_source_number_field(detail_obj: InspectionReqSourceDetailModel):
        """Identify the number field based on the requirement source id."""
        requirement_source = RequirementSourceEnum(detail_obj.requirement_source_id)
        section_sources = {
            RequirementSourceEnum.ACT_2002,
            RequirementSourceEnum.ACT_2018,
            RequirementSourceEnum.COMPLIANCE_AGREEMENT,
            RequirementSourceEnum.CERTIFIED_PROJECT_DESCRIPTION,
            RequirementSourceEnum.NOT_EA_ACT,
        }
        condition_sources = {
            RequirementSourceEnum.EAC_AMENDMENT,
            RequirementSourceEnum.EAC_CERTIFICATE,
            RequirementSourceEnum.SCHEDULE_B,
        }
        if requirement_source in section_sources:
            return f"Section {getattr(detail_obj, 'section_number')}"
        if requirement_source in condition_sources:
            return f"Condition {getattr(detail_obj, 'condition_number')}"
        if requirement_source == RequirementSourceEnum.ORDER:
            return f"Order {getattr(detail_obj, 'order_number')}"
