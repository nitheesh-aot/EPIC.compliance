"""Warning Letter Service."""

from typing import List

from compliance_api.exceptions import ResourceNotFoundError, UnprocessableEntityError
from compliance_api.models.case_file import CaseFile as CaseFileModel
from compliance_api.models.db import session_scope
from compliance_api.models.department_detail import DepartmentDetail as DepartmentDetailModel
from compliance_api.models.enforcement_action import EnforcementActionOptionEnum
from compliance_api.models.inspection import InspectionRequirement as InspectionRequirementModel
from compliance_api.models.warning_letter import WarningLetter as WarningLetterModel
from compliance_api.models.warning_letter import \
    WarningLetterInspectionRequirementMap as WarningLetterInspectionRequirementMapModel
from compliance_api.models.warning_letter import WarningLetterStatusEnum
from compliance_api.services.docgen_service.docgen_service import DocGenService
from compliance_api.services.epic_track_service.track_service import TrackService
from compliance_api.services.service_utils import ServiceUtils
from compliance_api.services.warning_letter.warning_letter_template_constant import WARNING_LETTER_CONTENT
from compliance_api.utils.constant import OFFICE_BRANCH, OFFICE_NAME, UNAPPROVED_PROJECT_CODE
from compliance_api.utils.template_renderer import render_template_with_data


class WarningLetterService:
    """Service layer for Warning Letter operations."""

    @classmethod
    def get_all(cls, inspection_id: int) -> List[WarningLetterModel]:
        """Get all warning letters for an inspection."""
        return WarningLetterModel.get_by_params(
            {"inspection_id": inspection_id}, default_filters=False
        )

    @classmethod
    def create_warning_letter(
        cls, inspection_id: int, warning_letter_data: dict
    ) -> WarningLetterModel:
        """Create a new warning letter."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id=inspection_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        requirement_ids = warning_letter_data.get("inspection_requirement_ids", [])
        ServiceUtils.check_requirement_for_enforcement_action(
            requirement_ids, EnforcementActionOptionEnum.WARNING_LETTER.value
        )
        if WarningLetterModel.does_warning_letter_exists_by_requirement_ids(
            requirement_ids
        ):
            raise UnprocessableEntityError(
                "Warning letter already exists for these requirements."
            )
        warning_letter_obj = _create_warning_letter_obj(inspection, warning_letter_data)
        with session_scope() as session:
            created_warning_letter = WarningLetterModel.create_warning_letter(
                warning_letter_obj, session
            )
            cls.insert_or_update_inspection_requirements(
                created_warning_letter.id,
                warning_letter_data.get("inspection_requirement_ids", []),
                session,
            )
        return created_warning_letter

    @classmethod
    def get_warning_letter(
        cls, inspection_id: int, warning_letter_id: int
    ) -> WarningLetterModel:
        """Retrieve a warning letter by ID."""
        ServiceUtils.inspection_exist_check(inspection_id=inspection_id)
        return WarningLetterModel.find_by_id(warning_letter_id)

    @classmethod
    def get_warning_letter_by_warning_letter_number(
        cls, inspection_id: int, warning_letter_number: str
    ) -> WarningLetterModel:
        """Retrieve a warning letter by warning letter number."""
        ServiceUtils.inspection_exist_check(inspection_id=inspection_id)
        return WarningLetterModel.get_by_warning_letter_number(warning_letter_number)

    @classmethod
    def update_warning_letter(
        cls, inspection_id: int, warning_letter_id: int, update_data: dict
    ) -> WarningLetterModel:
        """Update an existing warning letter."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id=inspection_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        requirement_ids = update_data.get("inspection_requirement_ids", [])
        ServiceUtils.check_requirement_for_enforcement_action(
            requirement_ids, EnforcementActionOptionEnum.WARNING_LETTER.value
        )
        if WarningLetterModel.does_warning_letter_exists_by_requirement_ids(
            requirement_ids, warning_letter_id
        ):
            raise UnprocessableEntityError(
                "Warning letter already exists for these requirements."
            )
        with session_scope() as session:
            updated_warning_letter = WarningLetterModel.update_warning_letter(
                warning_letter_id, update_data, session
            )
            cls.insert_or_update_inspection_requirements(
                updated_warning_letter.id,
                update_data.get("inspection_requirement_ids", []),
                session,
            )
        return updated_warning_letter

    @classmethod
    def delete_warning_letter(cls, inspection_id: int, warning_letter_id: int) -> None:
        """Delete a warning letter by ID."""
        warning_letter = cls.get_warning_letter(inspection_id, warning_letter_id)
        if warning_letter:
            warning_letter.delete()

    @classmethod
    def insert_or_update_inspection_requirements(
        cls, warning_letter_id: int, inspection_requirement_ids: list[int], session=None
    ):
        """Insert/Update inspection requirements associated with a given warning letter."""
        if inspection_requirement_ids is not None:
            existing_requirements = (
                WarningLetterInspectionRequirementMapModel.get_by_warning_letter_id(
                    warning_letter_id
                )
            )
            existing_requirement_ids = {
                req.inspection_requirement_id for req in existing_requirements
            }

            new_requirement_ids = set(inspection_requirement_ids)
            requirement_ids_to_be_deleted = existing_requirement_ids.difference(
                new_requirement_ids
            )
            requirement_ids_to_be_added = new_requirement_ids.difference(
                existing_requirement_ids
            )

            if requirement_ids_to_be_deleted:
                WarningLetterInspectionRequirementMapModel.bulk_delete(
                    warning_letter_id, list(requirement_ids_to_be_deleted), session
                )
            if requirement_ids_to_be_added:
                WarningLetterInspectionRequirementMapModel.bulk_insert(
                    warning_letter_id, list(requirement_ids_to_be_added), session
                )

    @classmethod
    def issue_warning_letter(cls, inspection_id, warning_letter_id, issue):
        """Issue a warning letter."""
        warning_letter = WarningLetterModel.find_by_id(warning_letter_id)
        if not warning_letter:
            raise ResourceNotFoundError(
                f"Warning letter with ID {warning_letter_id} not found"
            )
        inspection = ServiceUtils.inspection_exist_check(inspection_id=inspection_id)
        ServiceUtils.access_check_update_for_inspection(inspection)
        updated_warning_letter = WarningLetterModel.update_warning_letter(
            warning_letter_id,
            {
                "status": WarningLetterStatusEnum.ISSUED,
                "date_issued": issue.get("date_issued"),
            },
        )
        return updated_warning_letter

    @classmethod
    def render(cls, inspection_id, warning_letter_id, output_format):
        """Preview warning letter."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        warning_letter = WarningLetterModel.find_by_id(warning_letter_id)
        if warning_letter is None:
            raise ResourceNotFoundError(
                f"Warning letter with ID {warning_letter_id} not found"
            )
        if inspection.id != warning_letter.inspection_id:
            raise UnprocessableEntityError(
                "Inspection and inspection record do not match"
            )
        warning_letter_data = _create_warning_letter_data(inspection, warning_letter)
        response = DocGenService.render_template(
            "WARNING_LETTER_TEMPLATE", warning_letter_data, output_format
        )
        return response


def _create_warning_letter_data(inspection, warning_letter):
    """Create warning letter data."""
    department_details = DepartmentDetailModel.query.filter_by(
        is_active=True, is_deleted=False
    ).first()
    return {
        "warning_letter": {
            "warning_letter_number": warning_letter.warning_letter_number,
            "issue_date": (
                warning_letter.date_issued.strftime("%Y-%m-%d")
                if warning_letter.date_issued
                else None
            ),
            "content": warning_letter.content,
        },
        "department_details": {
            "logo_url": department_details.logo_url,
            "email": department_details.email,
            "address_line1": department_details.address_line1,
            "address_line2": department_details.address_line2,
            "phone": department_details.phone,
            "website": department_details.website,
            "office_name": OFFICE_NAME,
            "office_branch": OFFICE_BRANCH,
        },
    }


def _create_warning_letter_obj(inspection, warning_letter_data: dict) -> dict:
    """
    Create a warning letter object as a dictionary.

    If where_as and now_therefore are not provided, they will be generated.
    If issuing_officer_id is not provided, it will be set to the primary officer of the inspection.
    If section_id is not provided, it will be set to the default section.
    """
    requirement_ids = warning_letter_data.get("inspection_requirement_ids", None)
    warning_letter_number = warning_letter_data.get("warning_letter_number", None)
    if not warning_letter_number:
        warning_letter_number = _create_warning_letter_number(
            inspection.case_file.project_id, inspection.case_file.id
        )
    content = warning_letter_data.get("content")
    if not content:
        generated_content = _create_content(
            inspection, warning_letter_number, requirement_ids
        )
        content = content or generated_content
    return {
        "warning_letter_number": warning_letter_number,
        "inspection_id": inspection.id,
        "issuing_officer_id": warning_letter_data.get(
            "issuing_officer_id", inspection.primary_officer_id
        ),
        "content": content,
        "intended_issuance_date": warning_letter_data.get("intended_issuance_date"),
        "status": WarningLetterStatusEnum.CREATED,
    }


def _create_content(inspection, warning_letter_number, requirement_ids):
    """Create where_as and now_therefore."""
    department_details = DepartmentDetailModel.query.filter_by(
        is_active=True, is_deleted=False
    ).first()
    requirements = InspectionRequirementModel.get_requirement_by_ids(requirement_ids)
    requirement_details = ServiceUtils.get_formatted_requirement_details(requirements)
    requirements = []
    for requirement in requirement_details:
        if len(requirement["requirement_source_details"]) > 0:
            requirements.append(
                {
                    "requirement_summary": requirement["requirement_summary"],
                    "requirement_source_number": requirement[
                        "requirement_source_details"
                    ][0]["requirement_source_number"],
                    "requirement_source_name": requirement[
                        "requirement_source_details"
                    ][0]["requirement_source_name"],
                }
            )
    # Create condition_line by grouping requirements by source name
    condition_lines = []
    grouped_requirements = {}

    # Group requirements by source name
    for requirement in requirements:
        source_name = requirement["requirement_source_name"]
        if source_name not in grouped_requirements:
            grouped_requirements[source_name] = []
        grouped_requirements[source_name].append(
            {"number": requirement["requirement_source_number"]}
        )

    # Create condition line for each source
    for source_name, reqs in grouped_requirements.items():
        numbers = ", ".join(req["number"] for req in reqs)
        condition_lines.append(f"{numbers} of {source_name}")
    warning_letter_content = {
        "project_details": ServiceUtils.get_project_details(
            inspection.case_file.project_id, inspection.case_file.id
        ),
        "inspection_details": {
            "id": inspection.id,
            "inspection_type": " and ".join(
                [inspection_type.type.name for inspection_type in inspection.types]
            ),
            "start_date": inspection.start_date.strftime("%Y-%m-%d"),
            "end_date": (
                inspection.end_date.strftime("%Y-%m-%d") if inspection.end_date else ""
            ),
            "ir_number": inspection.ir_number,
            "officer_name": f"{inspection.primary_officer.first_name} {inspection.primary_officer.last_name}",
            "officer_position": inspection.primary_officer.position.name,
        },
        "department_details": {
            "email": department_details.email,
            "phone": department_details.phone,
        },
        "requirement_details": requirements,
        "requirement_sources": ", ".join(
            [requirement["requirement_source_name"] for requirement in requirements]
        ),
        "condition_lines": condition_lines,
    }

    content = render_template_with_data(
        "WARNING_LETTER_CONTENT", WARNING_LETTER_CONTENT, warning_letter_content
    )
    return content


def _create_warning_letter_number(project_id: int, case_file_id: int) -> str:
    """Generate the warning letter number."""
    project_code = _get_project_abbreviation(project_id)
    case_file = CaseFileModel.find_by_id(case_file_id)
    if not case_file:
        raise ResourceNotFoundError("Given case file doesn't exist")
    if case_file.project_id != project_id:
        raise UnprocessableEntityError("Given project and case file don't match")

    count = WarningLetterModel.get_count_by_project_nd_case_file_id(
        project_id, case_file_id
    )
    serial_number = f"{count + 1:04}"
    return f"{project_code}_{case_file.case_file_number}_WN{serial_number}"


def _get_project_abbreviation(
    project_id: int,
):  # pylint: disable=inconsistent-return-statements
    """Return the project abbreviation."""
    if project_id:
        project = TrackService.get_project_by_id(project_id)
        return project.get("abbreviation")
    return UNAPPROVED_PROJECT_CODE
