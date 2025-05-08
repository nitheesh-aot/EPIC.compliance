"""Inspection Record Data Builder."""

from compliance_api.models.appendix import Appendix as AppendixModel
from compliance_api.models.department_detail import DepartmentDetail as DepartmentDetailModel
from compliance_api.models.enforcement_action import EnforcementActionOptionEnum
from compliance_api.models.inspection import Inspection as InspectionModel
from compliance_api.models.inspection import InspectionAttendanceOptionEnum
from compliance_api.models.inspection import InspectionRequirement as InspectionRequirementModel
from compliance_api.models.inspection import InspectionRequirementTypeEnum
from compliance_api.models.inspection import IRStatusOption as IRStatusOptionModel
from compliance_api.models.inspection_record import InspectionRecord as InspectionRecordModel
from compliance_api.models.inspection_record import IRProgressEnum, IRStatusEnum
from compliance_api.models.inspection_record_approval import InspectionRecordApproval as InspectionRecordApprovalModel
from compliance_api.services.inspection_record.ir_template_constant import (
    ACTION_REQUIRED_BY_RP, ENFORCEMENT_SUMMARY, FINDING_STATEMENT, INSPECTION_SCOPE, PRELIMINARY_REVIEW_DETAILS)
from compliance_api.utils.template_renderer import render_template_with_data

from ..service_utils import ServiceUtils


class InspectionRecordDataBuilder:
    """InspesctionRecordDataBuilder."""

    def __init__(
        self,
        inspection: InspectionModel,
        ir_status: int,
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
        self.data = {
            "ir_status": IRStatusOptionModel.find_by_id(self.ir_status).name,
            "mailing_address": (
                self.existing_ir.mailing_address if self.existing_ir else None
            ),
        }
        self.data["inspection_details"] = {
            "id": self.inspection.id,
            "inspection_type": " and ".join(
                [inspection_type.type.name for inspection_type in self.inspection.types]
            ),
            "start_date": self.inspection.start_date.strftime("%Y-%m-%d"),
            "utm": self.inspection.utm,
            "project_description": self.inspection.project_description,
            "location_description": self.inspection.location_description,
            "initiation": self.inspection.initiation.name,
            "ir_number": self.inspection.ir_number,
        }

        # Initialize officer_details
        self.data["officer_details"] = {}
        if self.existing_ir:
            self.data["ir_progress"] = self.existing_ir.ir_progress
        else:
            self.data["ir_progress"] = (
                IRProgressEnum.PRELIMINARY_DRAFTING
                if self.ir_status == IRStatusEnum.PRELIMINARY.value
                else IRProgressEnum.FINALIZING_RECORD
            )

    def build_officer_details(self):
        """Build the officer details for the inspection record."""
        self.data["officer_details"] = {
            "primary_officer": {
                "name": f"{self.inspection.primary_officer.first_name} {self.inspection.primary_officer.last_name}",
                "position": self.inspection.primary_officer.position.name,
            }
        }

        # Build the attendance information
        self._build_officer_attendance()

        return self

    def _build_officer_attendance(self):
        """Build the attendance information for the inspection record."""
        from compliance_api.services.inspection import InspectionService

        # Get all attendance options for this inspection
        attendance_options = InspectionService.get_attendance_options(
            self.inspection.id
        )

        # Initialize an empty list to store attendance information
        attendance_list = []
        # Initialize inspecting officers list with primary officer
        inspecting_officers = [
            f"{self.data['officer_details']['primary_officer']['name']},"
            f"{self.data['officer_details']['primary_officer']['position']}"
        ]
        # Process each attendance option
        for option in attendance_options:
            # Skip officer attendance as per requirement
            if (
                option.attendance_option_id
                == InspectionAttendanceOptionEnum.ATTENDING_OFFICERS.value
            ):
                for officer in option.data:
                    # Avoid duplicate primary officer
                    if officer.get("id") != self.inspection.primary_officer_id:
                        inspecting_officers.append(
                            f"{officer.get('name')}, {officer.get('position').get('name')}"
                        )
                continue
            # Handle different types of attendance data
            if option.data:
                if isinstance(option.data, list):
                    # For agencies, first nations, etc.
                    for item in option.data:
                        if isinstance(item, dict) and "name" in item:
                            attendance_list.append(item["name"])
                elif isinstance(option.data, str):
                    # For municipal and other attendance
                    attendance_list.append(option.data)
            else:
                # If no data, use the attendance option name
                if (
                    option.attendance_option_id
                    == InspectionAttendanceOptionEnum.CERTIFICATE_HOLDER_OR_REGULATED_PARTY_REPRESENTATIVE.value
                ):
                    if not self.data.get("project_details"):
                        self.build_project_details()
                    attendance_list.append(self.data["project_details"]["proponent"])
                else:
                    attendance_list.append(option.attendance_option.name)

        # Join all attendance items with commas
        attendance_string = ", ".join(attendance_list) if attendance_list else ""
        inspecting_officers_string = (
            "; ".join(inspecting_officers) if inspecting_officers else ""
        )

        # Add the attendance information to the officer_details dictionary
        self.data["officer_details"]["in_attendance"] = attendance_string
        self.data["officer_details"]["inspecting_officers"] = inspecting_officers_string

        return self

    def build_appendices(self):
        """Build the appendices for the inspection record."""
        # Get all active non-deleted appendices for this inspection
        appendices = AppendixModel.get_by_inspection_id(self.inspection.id)

        # Add the appendices to the data dictionary
        self.data["appendices"] = appendices

        return self

    def build_department_details(self):
        """Build the department details for the inspection record."""
        # Get the department details
        department_details = DepartmentDetailModel.query.filter_by(
            is_active=True, is_deleted=False
        ).first()

        # Add the department details to the data dictionary
        if department_details:
            self.data["department_details"] = {
                "logo_url": department_details.logo_url,
                "email": department_details.email,
                "address_line1": department_details.address_line1,
                "address_line2": department_details.address_line2,
                "phone": department_details.phone,
                "website": department_details.website,
            }

        return self

    def build_project_details(self):
        """Populate project specific details."""
        project_id = self.inspection.case_file.project_id
        self.data["project_details"] = ServiceUtils.get_project_details(
            project_id, self.inspection.case_file.id, self.inspection.project_status_id
        )
        return self

    def build_inspection_scope(self):
        """Populate the inspection scope data."""
        #  if there is an existing ir and we are building the same ir, then the inspection scope should not be built
        if (
            self.existing_ir is not None
            and self.existing_ir.ir_status.id == self.ir_status
        ):
            self.data["inspection_scope"] = self.existing_ir.inspection_scope
            return self
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
                    number = ServiceUtils.get_requirement_source_number_field(
                        first_rq_detail
                    )

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
        #  if there is an existing ir and we are building the same ir, then
        # the preliminary review details should not be built
        if (
            self.existing_ir is not None
            and self.existing_ir.ir_status.id == self.ir_status
        ):
            self.data["preliminary_review_details"] = (
                self.existing_ir.preliminary_review_details
            )
            return self
        preliminary_review_details = {}
        #  No preliminary_review_details for ir when it is PRELIMINARY
        if self.ir_status == IRStatusEnum.PRELIMINARY.value:
            preliminary_review_details = None
        elif self.ir_status == IRStatusEnum.FINAL.value:
            inspection_record = InspectionRecordModel.get_by_inspection_id(
                self.inspection.id
            )
            if inspection_record is None:
                return self
            approvals = InspectionRecordApprovalModel.get_approvals_by_ir(
                inspection_record.id
            )
            # Build comma separated dates from the approval requests
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
                # Bulid the project details if not yet build to get the proponent label
                if not self.data.get("project_details"):
                    self.build_project_details()
                data["proponent_label"] = self.data["project_details"][
                    "proponent_label"
                ]
                data["primary_last_name"] = self.inspection.primary_officer.last_name
                preliminary_review_details = render_template_with_data(
                    "PRELIMINARY_REVIEW_DETAILS", PRELIMINARY_REVIEW_DETAILS, data
                )
                self.data["preliminary_review_details"] = preliminary_review_details
        return self

    def build_finding_statement(self):
        """Build the finding statement for the inspection record."""
        #  if there is an existing ir and we are building the same ir, then the finding statement should not be built
        if (
            self.existing_ir is not None
            and self.existing_ir.ir_status.id == self.ir_status
        ):
            self.data["finding_statement"] = self.existing_ir.finding_statement
            return self
        self.data["finding_statement"] = render_template_with_data(
            "FINDING_STATEMENT", FINDING_STATEMENT, data={}
        )
        return self

    def build_enforcement_summary(self):
        """Build the enforcement summary for the inspection record."""
        #  if there is an existing ir and we are building the same ir, then the enforcement summary should not be built
        if (
            self.existing_ir is not None
            and self.existing_ir.ir_status.id == self.ir_status
        ):
            self.data["enforcement_summary"] = self.existing_ir.enforcement_summary
            return self
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
            enforcement_summary_lines = []
            for action_id, requirements in grouped_enforcementactions.items():
                for requirement in requirements:
                    if EnforcementActionOptionEnum(action_id) in valid_actions:
                        summary_line = self._generate_enforcement_summary_lines(
                            EnforcementActionOptionEnum(action_id), requirement
                        )
                        if summary_line:
                            enforcement_summary_lines.append(summary_line)
            # Add a line for Regulatory Considerations in the requirements
            if any(
                req.req_type == InspectionRequirementTypeEnum.REG
                for req in self.requirements
            ):
                enforcement_summary_lines.append(
                    "<p>See Regulatory Considerations Section for additional information.</p>"
                )
            if len(enforcement_summary_lines) > 0:
                enforcement_summary_lines.append(
                    render_template_with_data(
                        "ENFORCEMENT_SUMMARY.DEFAULT",
                        ENFORCEMENT_SUMMARY.get("DEFAULT"),
                        {
                            "project_name": self.data["project_details"].get("name"),
                            "act": "Environmental Assessment Act (2018)",
                        },
                    )
                )
                self.data["enforcement_summary"] = (
                    f"<p class='editor-paragraph' dir='ltr'>{'</br>'.join(enforcement_summary_lines)}</p>"
                )
        return self

    def build_action_required_by_rp(self):
        """Build the action required by proponent."""
        #  if there is an existing ir and we are building the same ir,
        # then the action_required_by_rp should not be built
        if (
            self.existing_ir is not None
            and self.existing_ir.ir_status.id == self.ir_status
        ):
            self.data["action_required_by_rp"] = self.existing_ir.action_required_by_rp
            return self
        if self.ir_status == IRStatusEnum.FINAL.value:
            self.data["action_required_by_rp"] = None
            return self
        # Check if officer_details are populated
        if not self.data["officer_details"].get("primary_officer"):
            self.build_officer_details()

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

    def build_requirement_details(self):
        """Build the requirement details for the inspection record."""
        result = []
        if not self.requirements:
            self.requirements = InspectionRequirementModel.get_by_inspection_id(
                self.inspection.id
            )
        result = ServiceUtils.get_formatted_requirement_details(
            self.requirements, photo_required=True
        )
        self.data["requirement_details"] = result
        return self

    def build_regulatory_considerations(self):
        """Build the regulatory considerations for the inspection record."""
        if not self.requirements:
            self.requirements = InspectionRequirementModel.get_by_inspection_id(
                self.inspection.id
            )
        # There will be only one regulatory consideration possible for an inspection
        regulatory_consideration = next(
            (
                req
                for req in self.requirements
                if req.req_type == InspectionRequirementTypeEnum.REG
            ),
            None,
        )
        if regulatory_consideration:
            photos = []
            figures = []
            photos, figures = ServiceUtils.get_photos_and_figures(
                regulatory_consideration.id
            )
            self.data["regulatory_consideration"] = {
                "findings": regulatory_consideration.findings,
                "photos": photos,
                "figures": figures,
            }
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
        if action == EnforcementActionOptionEnum.REFERRAL_TO_ADMINISTRATIVE_PENALTY:
            return render_template_with_data(
                "ENFORCEMENT_SUMMARY.ADMINISTRATIVE_PENALTY",
                ENFORCEMENT_SUMMARY.get("ADMINISTRATIVE_PENALTY"),
                {"req_sort_order": requirement.sort_order},
            )
        if requirement.requirement_source_details:
            #  Identify the first requirement source detail
            first_rq_detail = requirement.requirement_source_details[0]
            number = ServiceUtils.get_requirement_source_number_field(first_rq_detail)
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
