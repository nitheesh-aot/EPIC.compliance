"""Inspection Record Data Builder."""

from compliance_api.models.inspection import Inspection as InspectionModel
from compliance_api.models.inspection import InspectionReqSourceDetail as InspectionReqSourceDetailModel
from compliance_api.models.inspection import InspectionRequirement as InspectionRequirementModel
from compliance_api.models.inspection_record import IRStatusEnum
from compliance_api.models.requirement_source import RequirementSourceEnum

from .ir_template_constant import FINDING_STATEMENT


class InspectionRecordDataBuilder:
    """InspesctionRecordDataBuilder."""

    def __init__(self, inspection: InspectionModel, ir_status: IRStatusEnum):
        """
        Initialize the builder with an inspection instance and its status.

        :param inspection: The inspection object (SQLAlchemy model instance).
        :param ir_status: The status of the inspection (PRELIMINARY or FINAL).
        """
        self.inspection = inspection
        self.ir_status = ir_status
        self.requirements = []
        self.data = {}

    def build_basic_data(self):
        """Build the basic data for the inspection record."""
        self.data["inspection_id"] = self.inspection.id
        self.data["ir_status_id"] = self.ir_status
        self.data["inspection_no"] = self.inspection.ir_number
        self.data["project_name"] = self.inspection.case_file.project.name
        return self

    def build_inspection_scope(self):
        """Populate the inspection scope data."""
        debreif_date = self.inspection.debrief_date
        inspection_scope = {
            "debrief_date": debreif_date.strftime(
                "%B %d, %Y"
            ),  # formatting of the date is needed plus handling of the null case
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
                    #  Identify the first requirement source
                    first_rq_source_id = requirement.requirement_source_details[
                        0
                    ].requirement_source_id
                    numbers = [
                        self._get_requirement_source_number_field(detail)
                        for detail in requirement.requirement_source_details
                        if detail.requirement_source_id == first_rq_source_id
                    ]
                    requirement_line = (
                        f"{','.join(numbers)} "
                        f"of {requirement.requirement_source_details[0].requirement_source.name} "
                        f"with respect to {requirement.summary}"
                    )

                    requirement_lines.append(requirement_line)

        inspection_scope["requirements"] = requirement_lines
        self.data["inspection_scope"] = inspection_scope
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
