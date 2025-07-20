"""Resource to return all inspection requirements for the grid view."""

from datetime import datetime
from http import HTTPStatus
from io import BytesIO

from flask import request, send_file
from flask_restx import Namespace, Resource

from compliance_api.auth import auth
from compliance_api.schemas.inspection_requirement_grid import InspectionRequirementGridItemSchema
from compliance_api.services import InspectionRequirementService

from .apihelper import Api as ApiHelper


API = Namespace(
    "inspection-requirements", description="Endpoints for Inspection Requirements Grid"
)
inspection_requirement_list_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, InspectionRequirementGridItemSchema(), "InspectionRequirementList"
)


@API.route("", methods=["GET", "POST", "OPTIONS"])
class InspectionRequirements(Resource):
    """InspectionRequirements."""

    @staticmethod
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Fetch all inspection requirements"
    )
    @API.doc(
        params={
            "tpc_ids": {
                "description": "The comma separated list of topic ids",
                "type": "string",
                "required": False,
            },
            "summary": {
                "description": "The summary of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "cmd_fnd_ids": {
                "description": "The comma separated list of compliance finding ids",
                "type": "string",
                "required": False,
            },
            "enf_actn_ids": {
                "description": "The comma separated list of enforcement action ids",
                "type": "string",
                "required": False,
            },
            "apprv_sts": {
                "description": "The comma separated list of approval statuses of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "req_src_ids": {
                "description": "The comma separated list of requirement source ids of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "req_src_num": {
                "description": "The requirement source number of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "ir_no": {
                "description": "The inspection record number",
                "type": "string",
                "required": False,
            },
            "date_issued": {
                "description": "The comma separated list of date issued of the inspection requirement",
                "type": "date",
                "required": False,
            },
            "prm_offc_ids": {
                "description": "The comma separated list of primary officer ids of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "insp_sts": {
                "description": "The comma separated list of inspection status of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "project_ids": {
                "description": "The comma separated list of project ids of the inspection requirement",
                "type": "string",
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


@API.route("/export", methods=["POST", "OPTIONS"])
class InspectionRequirementsExport(Resource):
    """Export all inspection requirements as Excel."""

    @staticmethod
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Export all inspection requirements as Excel"
    )
    @API.doc(
        params={
            "topic_ids": {
                "description": "The comma separated list of topic ids of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "summary": {
                "description": "The summary of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "compliance_finding_ids": {
                "description": "The comma separated list of compliance finding ids of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "enforcement_action_ids": {
                "description": "The comma separated list of enforcement action ids of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "approval_statuses": {
                "description": "The comma separated list of approval statuses of the inspection requirement",
                "type": "string",
                "required": False,
            },
            "requirement_source_ids": {
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
