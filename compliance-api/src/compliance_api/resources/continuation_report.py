"""API endpoints for managing continuation report resource."""

from http import HTTPStatus

from flask_restx import Namespace, Resource

from compliance_api.auth import auth
from compliance_api.schemas import ContinuationReportCreateSchema, ContinuationReportSchema
from compliance_api.services import ContinuationReportService
from compliance_api.utils.util import cors_preflight

from .apihelper import Api as ApiHelper


API = Namespace("continuation-reports", description="Endpoints for Continuation Report")

cr_request_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, ContinuationReportCreateSchema(), "ContinuationReport"
)
cr_list_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, ContinuationReportSchema(), "ContinuationReportList"
)


@cors_preflight("GET, OPTIONS, POST")
@API.route("", methods=["POST", "GET", "OPTIONS"])
class Agencies(Resource):
    """Resource for managing continuation report."""

    @staticmethod
    @auth.require
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Create an continuation report entry"
    )
    @API.expect(cr_request_model)
    @API.response(code=201, model=cr_list_model, description="ReportEntryCreated")
    @API.response(400, "Bad Request")
    def post():
        """Create a agency."""
        report_data = ContinuationReportCreateSchema().load(API.payload)
        created_entry = ContinuationReportService.create(report_data)
        return ContinuationReportSchema().dump(created_entry), HTTPStatus.CREATED
