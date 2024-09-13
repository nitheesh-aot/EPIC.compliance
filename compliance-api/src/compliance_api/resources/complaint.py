"""API endpoints for managing complaints."""

from http import HTTPStatus

from flask import current_app
from flask_restx import Namespace, Resource

from compliance_api.auth import auth
from compliance_api.schemas import ComplaintCreateSchema, ComplaintSchema, KeyValueSchema
from compliance_api.services import ComplaintService
from compliance_api.utils.util import cors_preflight

from .apihelper import Api as ApiHelper


API = Namespace("complaints", description="Endpoints for Complaints")

keyvalue_list_schema = ApiHelper.convert_ma_schema_to_restx_model(
    API, KeyValueSchema(), "List"
)

complaint_create_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, ComplaintCreateSchema(), "Complaint"
)

complaint_list_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, ComplaintSchema(), "ComplaintList"
)


@cors_preflight("GET, OPTIONS")
@API.route("/sources", methods=["GET", "OPTIONS"])
class ComplaintSources(Resource):
    """Resource for complaint sources."""

    @staticmethod
    @API.response(code=200, description="Success", model=[keyvalue_list_schema])
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Fetch all complaint sources"
    )
    @auth.require
    def get():
        """Fetch all complaint sources."""
        complaint_sources = ComplaintService.get_complaint_sources()
        complaint_sources_schema = KeyValueSchema(many=True)
        return complaint_sources_schema.dump(complaint_sources), HTTPStatus.OK


@cors_preflight("GET, OPTIONS")
@API.route("/requirement-sources", methods=["GET", "OPTIONS"])
class RequirementSources(Resource):
    """Resource for requirement sources."""

    @staticmethod
    @API.response(code=200, description="Success", model=[keyvalue_list_schema])
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Fetch all requrement sources"
    )
    @auth.require
    def get():
        """Fetch all requirement sources."""
        requirement_sources = ComplaintService.get_requirement_sources()
        requirement_sources_schema = KeyValueSchema(many=True)
        return requirement_sources_schema.dump(requirement_sources), HTTPStatus.OK


@cors_preflight("GET, OPTIONS, POST")
@API.route("", methods=["POST", "GET", "OPTIONS"])
class Complaints(Resource):
    """Resource for managing complaints."""

    @staticmethod
    @auth.require
    @ApiHelper.swagger_decorators(API, endpoint_description="Create an complaint")
    @API.expect(complaint_create_model)
    @API.response(code=201, model=complaint_list_model, description="ComplaintCreated")
    @API.response(400, "Bad Request")
    def post():
        """Create an complaint."""
        current_app.logger.info(f"Creating Complaint with payload: {API.payload}")
        complaint_data = ComplaintCreateSchema().load(API.payload)
        created_complaint = ComplaintService.create(complaint_data)
        return ComplaintSchema().dump(created_complaint), HTTPStatus.CREATED
