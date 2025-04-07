"""Service for inspection record."""

from compliance_api.exceptions import ResourceExistsError, UnprocessableEntityError
from compliance_api.models import InspectionRecord as InspectionRecordModel
from compliance_api.models import InspectionRecordApproval as InspectionRecordApprovalModel
from compliance_api.models import IRApprovalStatusEnum
from compliance_api.models.inspection_record import IRStatusEnum
from compliance_api.services.service_utils import ServiceUtils
from compliance_api.services.inspection_record.inspection_record_builder import InspectionRecordDataBuilder
from compliance_api.schemas import InspectionRecordPreviewSchema
from ..docgen_service.docgen_service import DocGenService
import json
import re
from jinja2 import Environment, BaseLoader


class InspectionRecordService:
    """InspectionRecordService."""

    @classmethod
    def get_by_inspection_id(cls, inspection_id):
        """Find all inspection records by inspection id."""
        return InspectionRecordModel.get_by_inspection_id(inspection_id)

    @classmethod
    def get_by_id(cls, inspection_record_id):
        """Find inspection record by id."""
        return InspectionRecordModel.find_by_id(inspection_record_id)

    @classmethod
    def create(cls, ir_request_data: dict, inspection_id):
        """Create inspection record."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id)

        existing_ir = InspectionRecordModel.get_by_inspection_id(inspection_id)
        #  Raise error, if ir exists and the request is to create another ir of the same status
        if existing_ir:
            raise ResourceExistsError(
                "IR for the given inspection already exists.")
        ir_status = ir_request_data.get("ir_status")
        ir_builder = InspectionRecordDataBuilder(
            inspection=inspection, ir_status=ir_status.value
        )
        ir_data = (
            ir_builder.build_inspection_scope()
            .build_preliminary_review_details()
            .build_finding_statement()
            .build_enforcement_summary()
            .build_action_required_by_rp()
            .build()
        )
        ir_obj = _create_ir_object(ir_data, ir_status, inspection_id)
        created_ir = InspectionRecordModel.create_inspection_record(ir_obj)
        return created_ir

    @classmethod
    def update(cls, inspection_id, inspection_record_id, ir_update_data: dict):
        """Update the inspection record."""
        field_name = ir_update_data.get("field_name")
        value = ir_update_data.get("value", None)
        ir_update_data = {field_name: value}
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        inspection_record = ServiceUtils.inspection_record_exist_check(
            inspection_record_id
        )
        ServiceUtils.access_check_update_for_inspection(inspection)
        change_track_required_fields = {
            "inspection_scope",
            "preliminary_review_details",
            "finding_statement",
        }
        if field_name in change_track_required_fields:
            #  This check is to make sure the value has actually changed
            if getattr(inspection_record, field_name) != value:
                change_info = dict(inspection_record.field_change_info or {})
                change_info[f"{field_name}_changed"] = True
                ir_update_data["field_change_info"] = change_info
        updated_inspection_record = InspectionRecordModel.update_inspection_record(
            inspection_record_id=inspection_record_id, ir_update_data=ir_update_data
        )
        return updated_inspection_record

    @classmethod
    def switch_to_final(cls, inspection_id, inspection_record_id):
        """Update the IR status to FINAL."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        inspection_record = ServiceUtils.inspection_record_exist_check(
            inspection_record_id
        )
        ServiceUtils.access_check_update_for_inspection(inspection)
        approvals = InspectionRecordApprovalModel.get_approvals_by_ir(
            inspection_record_id=inspection_record_id
        )
        if not approvals:
            raise UnprocessableEntityError(
                "IR cannot be FINAL without approval")
        latest_approval = approvals[0]
        if latest_approval.approval_status != IRApprovalStatusEnum.APPROVED:
            raise UnprocessableEntityError("Pending review for this IR")
        ir_builder = InspectionRecordDataBuilder(
            inspection=inspection,
            ir_status=IRStatusEnum.FINAL.value,
            existing_ir=inspection_record,
        )
        ir_data = (
            ir_builder.build_preliminary_review_details()
            .build_enforcement_summary()
            .build()
        )
        update_data = {
            "preliminary_review_details": ir_data.get(
                "preliminary_review_details", None
            ),
            "enforcement_summary": ir_data.get("enforcement_summary", None),
            "ir_status_id": IRStatusEnum.FINAL.value,
        }
        updated_ir = InspectionRecordModel.update_inspection_record(
            inspection_record_id, update_data
        )
        return updated_ir

    @classmethod
    def reset_field(
        cls, inspection_id: int, inspection_record_id: int, field_name: str
    ):
        """Reset a specific field in the inspection record to its default generated state.

        Args:
            inspection_id: The ID of the inspection
            inspection_record_id: The ID of the inspection record
            field_name: The field to reset (inspection_scope, preliminary_review_details, etc.)

        Returns:
            Updated inspection record object

        Raises:
            ResourceNotFoundError: If inspection or inspection record not found
            PermissionDeniedError: If user doesn't have permission
        """
        # Check if inspection exists
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        # Check user permissions
        ServiceUtils.access_check_update_for_inspection(inspection)
        inspection_record = ServiceUtils.inspection_record_exist_check(
            inspection_record_id
        )
        # Create builder with existing inspection and status
        ir_builder = InspectionRecordDataBuilder(
            inspection=inspection, ir_status=inspection_record.ir_status_id
        )
        ir_data = None
        change_info = dict(inspection_record.field_change_info)
        # Build only the requested field
        if field_name == "inspection_scope":
            ir_data = ir_builder.build_inspection_scope().build()
        elif field_name == "preliminary_review_details":
            ir_data = ir_builder.build_preliminary_review_details().build()
        elif field_name == "finding_statement":
            ir_data = ir_builder.build_finding_statement().build()
        change_info[f"{field_name}_changed"] = False
        update_data = {
            field_name: ir_data.get(field_name),
            "field_change_info": change_info,
        }
        # Update the inspection record with the reset field
        updated_inspection_record = InspectionRecordModel.update_inspection_record(
            inspection_record_id=inspection_record_id, ir_update_data=update_data
        )

        return updated_inspection_record

    @classmethod
    def preview(cls, inspection_id, inspection_record_id):
        """Preview inspection record."""
        inspection = ServiceUtils.inspection_exist_check(inspection_id)
        inspection_record = ServiceUtils.inspection_record_exist_check(
            inspection_record_id
        )
        if inspection.id != inspection_record.inspection_id:
            raise UnprocessableEntityError(
                "Inspection and inspection record do not match")
        ir_builder = InspectionRecordDataBuilder(
            inspection=inspection, ir_status=inspection_record.ir_status_id, existing_ir=inspection_record
        )
        ir_data = ir_builder.build_project_details()\
                            .build_officer_details()\
                            .build_appendices()\
                            .build_department_details()\
                            .build_inspection_scope()\
                            .build_preliminary_review_details()\
                            .build_finding_statement()\
                            .build_enforcement_summary()\
                            .build_action_required_by_rp()\
                            .build_requirement_details()\
                            .build()
        preview_data = InspectionRecordPreviewSchema().dump(ir_data)
        response = DocGenService.render_template(
            "IR_PRELIMINARY_TEMPLATE", preview_data, "html")
        return response.get("html")

    @classmethod
    def process_html_template(cls, json_response):
        """
        Process an HTML template from a JSON response.

        Args:
            json_response: A JSON string containing an HTML template with escaped quotes

        Returns:
            A properly formatted HTML string
        """
        # If the input is already a string, parse it as JSON
        if isinstance(json_response, str):
            try:
                # Try to parse as JSON
                data = json.loads(json_response)
            except json.JSONDecodeError:
                # If it's not valid JSON, assume it's already the HTML string
                return json_response
        else:
            # If it's already a dict/object, use it directly
            data = json_response

        # Extract the template from the JSON
        if isinstance(data, dict) and "template" in data:
            template = data["template"]
        else:
            # If no "template" key, assume the entire response is the template
            template = json.dumps(data) if not isinstance(data, str) else data

        # Remove the outer quotes if present
        if template.startswith('"') and template.endswith('"'):
            template = template[1:-1]

        # Replace escaped quotes with regular quotes
        template = template.replace('\\"', '"')

        return template

    @classmethod
    def render_inspection_record(cls, inspection_id, inspection_record_id=None):
        """
        Render an inspection record using the template from the API.

        Args:
            inspection_id: The ID of the inspection
            inspection_record_id: The ID of the inspection record (optional)

        Returns:
            The rendered HTML content
        """
        # Get the inspection
        inspection = ServiceUtils.inspection_exist_check(inspection_id)

        # Get the inspection record if provided
        ir_status = None
        existing_ir = None
        if inspection_record_id:
            existing_ir = ServiceUtils.inspection_record_exist_check(
                inspection_record_id)
            ir_status = existing_ir.ir_status_id
        else:
            # Default to PRELIMINARY if no record exists
            ir_status = IRStatusEnum.PRELIMINARY.value

        # Create the builder
        ir_builder = InspectionRecordDataBuilder(
            inspection=inspection,
            ir_status=ir_status,
            existing_ir=existing_ir
        )

        # Build all the data
        ir_data = (
            ir_builder.build_inspection_scope()
            .build_preliminary_review_details()
            .build_finding_statement()
            .build_enforcement_summary()
            .build_action_required_by_rp()
            .build_appendices()
            .build_department_details()
            .build_project_details()
            .build()
        )

        # Get the template from the API
        docgen_service = DocGenService()
        template_response = docgen_service.get_template(
            "ir_preliminary_template")

        # Process the template
        html_template = cls.process_html_template(template_response)

        # Render the template with Jinja2
        rendered_html = cls.render_template_with_jinja2(html_template, ir_data)

        return rendered_html

    @classmethod
    def render_template_with_jinja2(cls, template_string, data):
        """
        Render a template string using Jinja2.

        Args:
            template_string: The template string to render
            data: The data to use for rendering

        Returns:
            The rendered HTML content
        """
        # Create a Jinja2 environment
        env = Environment(loader=BaseLoader())

        # Create a template from the string
        template = env.from_string(template_string)

        # Render the template with the data
        rendered_html = template.render(**data)

        return rendered_html


def _create_ir_object(ir_data, ir_status, inspection_id):
    """
    Create the inspection record object to be persisted.

    :param ir_request_data: The input payload for the endpoint.
    :param ir_data: The inspection record builder output.
    """
    return {
        "inspection_id": inspection_id,
        "ir_status_id": ir_status.value,
        "inspection_scope": ir_data.get("inspection_scope"),
        "finding_statement": ir_data.get("finding_statement"),
        "enforcement_summary": ir_data.get("enforcement_summary", None),
        "ir_progress": ir_data.get("ir_progress"),
        "action_required_by_rp": ir_data.get("action_required_by_rp", None),
        "field_change_info": {
            "inspection_scope_changed": False,
            "preliminary_review_details_changed": False,
            "finding_statement_changed": False,
        },
    }
