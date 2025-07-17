"""Resource to return all inspection requirements for the grid view."""

from datetime import datetime
from http import HTTPStatus
from io import BytesIO

from flask import request, send_file
from flask_restx import Namespace, Resource

from compliance_api.auth import auth
from compliance_api.schemas.inspection_requirement_grid import InspectionRequirementGridItemSchema
from compliance_api.services import InspectionRequirementService
from compliance_api.utils.util import cors_preflight

from .apihelper import Api as ApiHelper


API = Namespace(
    "inspection-requirements", description="Endpoints for Inspection Requirements Grid"
)
inspection_requirement_list_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, InspectionRequirementGridItemSchema(), "InspectionRequirementList"
)


@cors_preflight("GET, OPTIONS, POST")
@API.route("", methods=["GET", "POST", "OPTIONS"])
class InspectionRequirements(Resource):
    """InspectionRequirements."""

    @staticmethod
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Fetch all inspection requirements"
    )
    @API.doc(
        params={
            "topic_id": {
                "description": "The topic of the inspection requirement",
                "type": "integer",
                "required": False,
            },
            "summary": {
                "description": "The summary of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "compliance_finding_id": {
                "description": "The compliance finding of the inspection requirement",
                "type": "integer",
                "required": False,
            },
            "enforcement_action_id": {
                "description": "The enforcement action of the inspection requirement",
                "type": "integer",
                "required": False,
            },
            "approval_status": {
                "description": "The approval status of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "requirement_source_id": {
                "description": "The requirement source of the inspection requirement",
                "type": "integer",
                "required": False,
            },
            "ir_number": {
                "description": "The inspection requirement number",
                "type": "string",
                "required": False,
            },
            "date_issued": {
                "description": "The date issued of the inspection requirement",
                "type": "date",
                "required": False,
            },
            "primary_officer_id": {
                "description": "The primary officer of the inspection requirement",
                "type": "integer",
                "required": False,
            },
            "inspection_status": {
                "description": "The inspection status of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "project_id": {
                "description": "The project of the inspection requirement",
                "type": "integer",
                "required": False,
            },
            "page_no": {
                "description": "The page number of the inspection requirement",
                "type": "integer",
                "required": False,
            },
            "page_size": {
                "description": "The number of items per page of the inspection requirement",
                "type": "integer",
                "required": False,
            },
        }
    )
    @API.response(
        code=200, description="Success", model=[inspection_requirement_list_model]
    )
    @auth.require
    def get():
        """Return all inspection requirements for the grid."""
        response, total = InspectionRequirementService.get_all_inspection_requirements(
            request.args
        )
        return {
            "items": InspectionRequirementGridItemSchema(many=True).dump(response),
            "total": total,
        }, HTTPStatus.OK


@cors_preflight("POST, OPTIONS")
@API.route("/export", methods=["POST", "OPTIONS"])
class InspectionRequirementsExport(Resource):
    """Export all inspection requirements as Excel."""

    @staticmethod
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Export all inspection requirements as Excel"
    )
    @API.doc(
        params={
            "topic_id": {
                "description": "The topic of the inspection requirement",
                "type": "integer",
                "required": False,
            },
            "summary": {
                "description": "The summary of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "compliance_finding_id": {
                "description": "The compliance finding of the inspection requirement",
                "type": "integer",
                "required": False,
            },
            "enforcement_action_id": {
                "description": "The enforcement action of the inspection requirement",
                "type": "integer",
                "required": False,
            },
            "approval_status": {
                "description": "The approval status of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "requirement_source_id": {
                "description": "The requirement source of the inspection requirement",
                "type": "integer",
                "required": False,
            },
            "ir_number": {
                "description": "The inspection requirement number",
                "type": "string",
                "required": False,
            },
            "date_issued": {
                "description": "The date issued of the inspection requirement",
                "type": "date",
                "required": False,
            },
            "primary_officer_id": {
                "description": "The primary officer of the inspection requirement",
                "type": "integer",
                "required": False,
            },
            "inspection_status": {
                "description": "The inspection status of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "project_id": {
                "description": "The project of the inspection requirement",
                "type": "integer",
                "required": False,
            },
        }
    )
    @API.response(code=200, description="Success - Excel file download")
    @auth.require
    def post():
        """Export all inspection requirements as Excel."""
        args = dict(request.args)
        output = InspectionRequirementService.generate_inspection_requirements_excel(
            args
        )

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"inspection_requirements_{timestamp}.xlsx"

        # Return the Excel file as a downloadable attachment
        return send_file(BytesIO(output), as_attachment=True, download_name=filename)
