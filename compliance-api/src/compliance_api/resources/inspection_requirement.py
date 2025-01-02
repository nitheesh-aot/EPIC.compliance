"""InspectionRequirementResource."""

from http import HTTPStatus

from flask_restx import Namespace, Resource

from compliance_api.auth import auth
from compliance_api.schemas.inspection_requirement import InspectionRequirementCreateSchema, InspectionRequirementSchema
from compliance_api.services import InspectionRequirementService
from compliance_api.utils.util import cors_preflight

from .apihelper import Api as ApiHelper


API = Namespace("requirements", description="Endpoints for Inspection Requirement")
inspection_requirement_create_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, InspectionRequirementCreateSchema(), "InspectionRequirement"
)

inspection_requirement_list_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, InspectionRequirementSchema(), "InspectionRequirementList"
)


@cors_preflight("GET, OPTIONS, POST")
@API.route("", methods=["POST", "GET", "OPTIONS"])
class InspectionRequirements(Resource):
    """InspectionRequirements."""

    @staticmethod
    @ApiHelper.swagger_decorators(API, endpoint_description="Create an inspection")
    @API.expect(inspection_requirement_create_model)
    @API.response(
        code=201,
        model=inspection_requirement_list_model,
        description="InspectionCreated",
    )
    @API.response(400, "Bad Request")
    @auth.require
    def post(inspection_id):
        """Create an inspection."""
        requirement_data = InspectionRequirementCreateSchema().load(API.payload)
        created_requirement = InspectionRequirementService.create(
            inspection_id, requirement_data
        )
        return (
            InspectionRequirementSchema().dump(created_requirement),
            HTTPStatus.CREATED,
        )
