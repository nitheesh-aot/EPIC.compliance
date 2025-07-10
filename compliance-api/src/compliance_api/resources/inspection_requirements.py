
"""Resource to return all inspection requirements for the grid view."""

from flask import jsonify, request
from flask_restx import Namespace, Resource

from compliance_api.services import InspectionRequirementService
from compliance_api.auth import auth
from compliance_api.schemas.inspection_requirement_grid import InspectionRequirementGridSchema
from .apihelper import Api as ApiHelper

API = Namespace("inspection-requirements", description="Endpoints for Inspection Requirements Grid")
inspection_requirement_list_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, InspectionRequirementGridSchema(), "InspectionRequirementList"
)

@API.route("", methods=["GET", "OPTIONS"])
class InspectionRequirements(Resource):
    """InspectionRequirements."""

    @staticmethod
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Fetch all inspection requirements"
    )
    @API.doc(params={
        "topic_id": {
            "description": "The topic of the inspection requirement",
            "type": "integer",
            "required": False,
        },
        "requirement_summary": {
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
        "issuance_date": {
            "description": "The issuance date of the inspection requirement",
            "type": "date",
            "required": False,
        },
    })
    @API.response(code=200, description="Success", model=[inspection_requirement_list_model])
    @auth.require
    def get():
        """Return all inspection requirements for the grid."""
        response, status = InspectionRequirementService.get_all_inspection_requirements(
            request.args
        )
        return jsonify(response), status

