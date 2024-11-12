"""API endpoints for managing continuation report resource."""

from http import HTTPStatus

from flask import request
from flask_restx import Namespace, Resource

from compliance_api.auth import auth
from compliance_api.schemas import ContinuationReportCreateSchema, ContinuationReportSchema, CRGetQueryParamSchema
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
            },
            "page_no": {
                "description": "The number of page to be returned",
                "type": "integer",
                "required": True,
            },
            "page_size": {
                "description": "The number of items in the page",
                "type": "integer",
                "required": True,
            },
        }
    )
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Fetch all continuation report"
    )
    @auth.require
    def get():
        """Fetch all complaints."""
        request_params = CRGetQueryParamSchema().load(request.args)
        case_file_id = request_params.get("case_file_id")
        page_no = request_params.get("page_no")
        page_size = request_params.get("page_size")
        search_text = request_params.get("search_text")
        crs, total = ContinuationReportService.get_by_case_file_id(
            case_file_id, page_no, page_size, search_text
        )
        return {
            "items": ContinuationReportSchema(many=True).dump(crs),
            "total": total,
        }, HTTPStatus.OK

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
