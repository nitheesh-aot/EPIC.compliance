"""API endpoints for managing continuation report resource."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource

from compliance_api.auth import auth
from compliance_api.exceptions import BadRequestError
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
    @API.response(code=200, description="Success", model=[cr_list_model])
    @API.doc(
        params={
            "case_file_id": {
                "description": "The unique identifier of the case file",
                "type": "integer",
                "required": True,
            }
        }
    )
    @ApiHelper.swagger_decorators(API, endpoint_description="Fetch all continuation report")
    @auth.require
    def get():
        """Fetch all complaints."""
        case_file_id = request.args.get("case_file_id")
        if not case_file_id:
            raise BadRequestError("Casefile id is required as a query parameter")
        crs = ContinuationReportService.get_by_case_file_id(case_file_id)
        cr_list_schema = ContinuationReportSchema(many=True)
        return cr_list_schema.dump(crs), HTTPStatus.OK

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
