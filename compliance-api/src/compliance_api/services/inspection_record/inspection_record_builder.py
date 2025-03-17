"""Inspection Record Data Builder."""

from compliance_api.models.inspection import Inspection as InspectionModel
from compliance_api.models.inspection import InspectionReqSourceDetail as InspectionReqSourceDetailModel
from compliance_api.models.inspection import InspectionRequirement as InspectionRequirementModel
from compliance_api.models.inspection_record import InspectionRecord as InspectionRecordModel
from compliance_api.models.inspection_record import IRProgressEnum, IRStatusEnum
from compliance_api.models.requirement_source import RequirementSourceEnum

from .ir_template_constant import FINDING_STATEMENT


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
        self.data["ir_progress"] = (
            IRProgressEnum.PRELIMINARY_APPROVED
            if self.ir_status == IRStatusEnum.PRELIMINARY.value
            else IRProgressEnum.FINALIZING_RECORD
        )

    def build_inspection_scope(self):
        """Populate the inspection scope data."""
        debreif_date = self.inspection.debrief_date
        inspection_scope = {
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

        inspection_scope["requirements"] = requirement_lines
        self.data["inspection_scope"] = inspection_scope
        return self

    def build_preliminary_review_details(self):
        """Build the preliminary review details."""
        preliminary_review_details = {}
        if self.ir_status == IRStatusEnum.PRELIMINARY:
            preliminary_review_details = None
        elif self.ir_status == IRStatusEnum.FINAL and self.existing_ir:
            raise ValueError("Yet to be implemented")
        self.data["preliminary_review_details"] = preliminary_review_details
        return self

    def build_finding_statement(self):
        """Build the finding statement for the inspection record."""
        self.data["finding_statement"] = FINDING_STATEMENT
        return self

    def build_enforcement_summary(self):
        """Build the enforcement summary for the inspection record."""
        if self.ir_status == IRStatusEnum.PRELIMINARY:
            self.data["enforcement_summary"] = None
        return self

    def build(self):
        """Return the final object."""
        return self.data

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
