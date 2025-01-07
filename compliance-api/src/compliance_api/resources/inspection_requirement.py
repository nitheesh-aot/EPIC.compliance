"""InspectionRequirementResource."""

from http import HTTPStatus

from flask_restx import Namespace, Resource

from compliance_api.auth import auth
from compliance_api.schemas.inspection_requirement import (
    InspectionRequirementCreateSchema, InspectionRequirementSchema, InspectionRequirementUpdateSchema)
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

inspection_requirement_update_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, InspectionRequirementUpdateSchema(), "InspectionRequirementUpdate"
)


@cors_preflight("GET, OPTIONS, POST")
@API.route("", methods=["POST", "GET", "OPTIONS"])
class InspectionRequirements(Resource):
    """InspectionRequirements."""

    @staticmethod
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Get all requirements by inspection"
    )
    @auth.require
    @API.response(
        code=200, description="Success", model=[inspection_requirement_list_model]
    )
    def get(inspection_id):
        """Get requirements by inspection id."""
        requirements = InspectionRequirementService.get_all(inspection_id)
        return InspectionRequirementSchema(many=True).dump(requirements), HTTPStatus.OK

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


@cors_preflight("GET, PATCH, DELETE, OPTIONS")
@API.route("/<int:requirement_id>", methods=["GET", "PATCH", "OPTIONS", "DELETE"])
class InspectionRequirement(Resource):
    """InspectionRequirement resource."""

    @staticmethod
    @API.response(
        code=200, description="Success", model=[inspection_requirement_list_model]
    )
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Fetch inspection requirement by id"
    )
    @auth.require
    def get(requirement_id):
        """Fetch all inspection requirement."""
        requirement = InspectionRequirementService.get_by_id(requirement_id)
        return InspectionRequirementSchema().dump(requirement), HTTPStatus.OK

    @staticmethod
    @API.response(
        code=200, description="Sucess", model=[inspection_requirement_list_model]
    )
    @API.expect(inspection_requirement_update_model)
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Update inspection requirement"
    )
    @auth.require
    def patch(inspection_id, requirement_id):
        """Update inspection inspection requirement."""
        requirement_data = InspectionRequirementUpdateSchema().load(API.payload)
        updated_requirement = InspectionRequirementService.update(
            inspection_id, requirement_id, requirement_data
        )
        return InspectionRequirementSchema().dump(updated_requirement), HTTPStatus.OK
