"""Inspection Record Data Builder."""

import re

from compliance_api.models.enforcement_action import EnforcementActionOptionEnum
from compliance_api.models.inspection import Inspection as InspectionModel
from compliance_api.models.inspection import InspectionReqSourceDetail as InspectionReqSourceDetailModel
from compliance_api.models.inspection import InspectionRequirement as InspectionRequirementModel
from compliance_api.models.inspection import InspectionRequirementTypeEnum
from compliance_api.models.inspection_record import InspectionRecord as InspectionRecordModel
from compliance_api.models.inspection_record import IRProgressEnum, IRStatusEnum
from compliance_api.models.inspection_record_approval import InspectionRecordApproval as InspectionRecordApprovalModel
from compliance_api.models.requirement_source import RequirementSourceEnum
from compliance_api.models.unapproved_project import UnapprovedProject as UnapprovedProjectModel
from compliance_api.services.epic_track_service.track_service import TrackService
from compliance_api.utils.template_renderer import render_template_with_data

from .ir_template_constant import (
    ACTION_REQUIRED_BY_RP, ENFORCEMENT_SUMMARY, FINDING_STATEMENT, INSPECTION_SCOPE, PRELIMINARY_REVIEW_DETAILS)


class InspectionRecordDataBuilder:
    """InspesctionRecordDataBuilder."""

    def __init__(
        self,
        inspection: InspectionModel,
        ir_status: IRStatusEnum,
        existing_ir: InspectionRecordModel = None,
    ):
        """
        Initialize the builder with an inspection instance and its status.

        :param inspection: The inspection object (SQLAlchemy model instance).
        :param ir_status: The status of the inspection (PRELIMINARY or FINAL).
        :param existing_ir: The existing inspection record if present.
                This is usedful when building details from existing record)
        """
        self.inspection = inspection
        self.ir_status = ir_status
        self.requirements = []
        self.existing_ir = existing_ir
        self.data = {}
        self.data["inspection_id"] = self.inspection.id
        self.data["ir_status_id"] = self.ir_status
        self.data["inspection_no"] = self.inspection.ir_number
        self.data["project_name"] = self.inspection.case_file.project.name

        self.data["officer_details"] = {
            "primary_officer": {
                "name": f"{self.inspection.primary_officer.first_name} {self.inspection.primary_officer.last_name}",
                "position": self.inspection.primary_officer.position.name,
            }
        }

        if self.existing_ir:
            self.data["ir_progress"] = self.existing_ir.ir_progress
        else:
            self.data["ir_progress"] = (
                IRProgressEnum.PRELIMINARY_APPROVED
                if self.ir_status == IRStatusEnum.PRELIMINARY.value
                else IRProgressEnum.FINALIZING_RECORD
            )

    def build_project_details(self):
        """Populate project specific details."""
        project_id = self.inspection.case_file.project_id
        eac_certicate = proponent = name = None
        if not project_id:
            project = UnapprovedProjectModel.get_by_case_file_id(
                self.inspection.case_file.id
            )
            if project:
                eac_certicate = project.authorization
                proponent = project.regulated_party
                name = project.name
        else:
            project = TrackService.get_project_by_id(project_id)
            if project:
                eac_certicate = project.get("ea_certificate", None)
                proponent = project.get("proponent").get("name")
                name = project.get("name")
        self.data["project_details"] = {
            "eac_certificate": eac_certicate,
            "proponent": proponent,
            "name": name,
            "proponent_label": (
                "Certificate Holder"
                if re.match(r"^E\d{1,3}-\d{1,3}$", eac_certicate)
                else "Regulated Party"
            ),
        }
        return self

    def build_inspection_scope(self):
        """Populate the inspection scope data."""
        debreif_date = self.inspection.debrief_date
        inspection_scope_data = {
            "debrief_date": (
                debreif_date.strftime("%B %d, %Y") if debreif_date else None
            ),  # handling of the null case
            "requirements": [],
        }
        requirements = InspectionRequirementModel.get_by_inspection_id(
            self.inspection.id
        )
        #  set the requirements to the builder for later use
        self.requirements = requirements
        requirement_lines = []
        if len(requirements) > 0:
            for requirement in requirements:
                #  Some requirements may not have any source details
                if requirement.requirement_source_details:
                    #  Identify the first requirement source detail
                    first_rq_detail = requirement.requirement_source_details[0]
                    number = self._get_requirement_source_number_field(first_rq_detail)

                    requirement_lines.append(
                        f"{number} of {first_rq_detail.requirement_source.name} with respect to {requirement.summary}"
                    )

        inspection_scope_data["requirements"] = requirement_lines
        self.data["inspection_scope"] = render_template_with_data(
            "INSPECTION_SCOPE", INSPECTION_SCOPE, data=inspection_scope_data
        )
        return self

    def build_preliminary_review_details(self):
        """Build the preliminary review details."""
        preliminary_review_details = {}
        #  No preliminary_review_details for ir when it is PRELIMINARY
        if self.ir_status == IRStatusEnum.PRELIMINARY.value:
            preliminary_review_details = None
        elif self.ir_status == IRStatusEnum.FINAL.value and self.existing_ir:
            approvals = InspectionRecordApprovalModel.get_approvals_by_ir(
                self.existing_ir.id
            )
            if approvals:
                data = {
                    "date_report_sent": ", ".join(
                        approval.date_report_sent.strftime("%B %d, %Y")
                        for approval in approvals
                        if approval.date_report_sent is not None
                    ),
                    "date_response": ", ".join(
                        approval.date_response.strftime("%B %d, %Y")
                        for approval in approvals
                        if approval.date_response is not None
                    ),
                }
                preliminary_review_details = render_template_with_data(
                    "PRELIMINARY_REVIEW_DETAILS", PRELIMINARY_REVIEW_DETAILS, data
                )

        self.data["preliminary_review_details"] = preliminary_review_details
        return self

    def build_finding_statement(self):
        """Build the finding statement for the inspection record."""
        self.data["finding_statement"] = FINDING_STATEMENT
        return self

    def build_enforcement_summary(self):
        """Build the enforcement summary for the inspection record."""
        if self.ir_status == IRStatusEnum.PRELIMINARY.value:
            self.data["enforcement_summary"] = None
            #  Order needs to be checked and returned from here
        elif self.ir_status == IRStatusEnum.FINAL.value:
            if not self.requirements:
                self.requirements = InspectionRequirementModel.get_by_inspection_id(
                    self.inspection.id
                )
            grouped_enforcementactions = self._get_requirements_by_enforcement_action(
                self.requirements
            )
            valid_actions = {
                EnforcementActionOptionEnum.NOTICE_OF_NON_COMPLIANCE,
                EnforcementActionOptionEnum.ORDER,
                EnforcementActionOptionEnum.REFERRAL_TO_ADMINISTRATIVE_PENALTY,
                EnforcementActionOptionEnum.REFERRAL_TO_ANOTHER_AGENCY,
                EnforcementActionOptionEnum.WARNING_LETTER,
            }
            enforment_summary_lines = []
            for action_id, requirements in grouped_enforcementactions.items():
                for requirement in requirements:
                    if EnforcementActionOptionEnum(action_id) in valid_actions:
                        summary_line = self._generate_enforcement_summary_lines(
                            EnforcementActionOptionEnum(action_id), requirement
                        )
                        if summary_line:
                            enforment_summary_lines.append(summary_line)
            if len(enforment_summary_lines) > 0:
                self.data["enforcement_summary"] = (
                    f"<p>{'</br>'.join(enforment_summary_lines)}</p>"
                )
        return self

    def build_action_required_by_rp(self):
        """Build the action required by proponent."""
        action_required_by_rp = render_template_with_data(
            "ACTION_REQUIRED_BY_RP",
            ACTION_REQUIRED_BY_RP,
            {
                "primary_officer": self.data["officer_details"]
                .get("primary_officer")
                .get("name")
            },
        )
        self.data["action_required_by_rp"] = (
            self.existing_ir.action_required_by_rp
            if self.existing_ir
            else action_required_by_rp
        )
        return self

    def build(self):
        """Return the final object."""
        return self.data

    def _generate_enforcement_summary_lines(
        self,
        action: EnforcementActionOptionEnum,
        requirement: InspectionRequirementModel,
    ):
        """Create the enforcement summary lines."""
        if requirement.req_type == InspectionRequirementTypeEnum.REG:
            return "<p>See Regulatory Considerations Section for additional information.</p>"
        if action == EnforcementActionOptionEnum.REFERRAL_TO_ADMINISTRATIVE_PENALTY:
            return render_template_with_data(
                "ENFORCEMENT_SUMMARY.ADMINISTRATIVE_PENALTY",
                ENFORCEMENT_SUMMARY.get("ADMINISTRATIVE_PENALTY"),
                {"req_sort_order": requirement.sort_order},
            )
        if requirement.requirement_source_details:
            #  Identify the first requirement source detail
            first_rq_detail = requirement.requirement_source_details[0]
            number = self._get_requirement_source_number_field(first_rq_detail)
            req_source_name = first_rq_detail.requirement_source.name
            #  Build the project details if not already built
            if self.data.get("project_details", None) is None:
                self.build_project_details()
            regulated_party = self.data["project_details"].get("proponent")
            eac = self.data["project_details"].get("eac_certificate")
            data_to_be_rendered = {
                "regulated_party": regulated_party,
                "number": number,
                "req_source_name": req_source_name,
                "eac": eac,
                "req_sort_order": requirement.sort_order,
                "act": "Environmental Assessment Act (2018)",
            }
            if action == EnforcementActionOptionEnum.NOTICE_OF_NON_COMPLIANCE:
                return render_template_with_data(
                    "ENFORCEMENT_SUMMARY.NOTICE_OF_NON_COMPLIANCE",
                    ENFORCEMENT_SUMMARY.get("NOTICE_OF_NON_COMPLIANCE"),
                    data_to_be_rendered,
                )
            if action == EnforcementActionOptionEnum.REFERRAL_TO_ANOTHER_AGENCY:
                data_to_be_rendered["agency_name"] = requirement.agency.name
                return render_template_with_data(
                    "ENFORCEMENT_SUMMARY.AGENCY",
                    ENFORCEMENT_SUMMARY.get("AGENCY"),
                    data_to_be_rendered,
                )
        return None

    def _get_requirements_by_enforcement_action(self, requirements):
        """Group requirements by enforcement action ID."""
        grouped_requirements = {}

        for requirement in requirements:
            # Get enforcement actions for this requirement
            enforcement_actions = requirement.enforcement_actions

            if enforcement_actions:
                for enforcement_action in enforcement_actions:
                    enforcement_id = enforcement_action.enforcement_action_id
                    if enforcement_id not in grouped_requirements:
                        grouped_requirements[enforcement_id] = []
                    grouped_requirements[enforcement_id].append(requirement)

        return grouped_requirements

    def _get_requirement_source_number_field(
        self, detail_obj: InspectionReqSourceDetailModel
    ):
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
