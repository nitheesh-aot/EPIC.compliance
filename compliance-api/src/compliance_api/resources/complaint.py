"""API endpoints for managing complaints."""

from http import HTTPStatus

from flask_restx import Namespace, Resource

from compliance_api.auth import auth
from compliance_api.schemas import KeyValueSchema
from compliance_api.services import ComplaintService
from compliance_api.utils.util import cors_preflight

from .apihelper import Api as ApiHelper


API = Namespace("complaints", description="Endpoints for Complaints")

keyvalue_list_schema = ApiHelper.convert_ma_schema_to_restx_model(
    API, KeyValueSchema(), "List"
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
