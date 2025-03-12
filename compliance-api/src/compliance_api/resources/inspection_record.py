"""Resources for inspection record."""

from http import HTTPStatus

from flask_restx import Namespace, Resource

from compliance_api.auth import auth
from compliance_api.exceptions import ResourceNotFoundError
from compliance_api.schemas import InspectionRecordCreateSchema, InspectionRecordSchema, UpdateInspectionRecordSchema
from compliance_api.services import InspectionRecordService
from compliance_api.utils.enum import PermissionEnum
from compliance_api.utils.util import cors_preflight

from .apihelper import Api as ApiHelper


API = Namespace("inspection-records",
                description="Endpoints for Inspection Record")

ir_create_request_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, InspectionRecordCreateSchema(), "IRCreateRequest"
)
ir_list_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, InspectionRecordSchema(), "IRlist"
)
ir_update_request_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, UpdateInspectionRecordSchema(), "UpdateInspection"
)


@cors_preflight("GET, OPTIONS, POST")
@API.route("", methods=["POST", "GET", "OPTIONS"])
class InspectionRecords(Resource):
    """Resource for managing inspection records."""

    @staticmethod
    @API.response(code=200, description="Success", model=[ir_list_model])
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Fetch all inspection records"
    )
    @auth.require
    def get(inspection_id):
        """Fetch all inspection records."""
        irs = InspectionRecordService.get_by_inspection_id(inspection_id)
        inspection_record_schema = InspectionRecordSchema(many=False)
        return inspection_record_schema.dump(irs), HTTPStatus.OK

    @staticmethod
    @auth.require
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Create an inspection record"
    )
    @API.expect(ir_create_request_model)
    @API.response(code=201, model=ir_list_model, description="IRCreated")
    @API.response(400, "Bad Request")
    @auth.has_one_of_roles([PermissionEnum.SUPERUSER, PermissionEnum.ADMIN])
    def post(inspection_id):
        """Create a agency."""
        ir_create_request = InspectionRecordCreateSchema().load(API.payload)
        created_ir = InspectionRecordService.create(
            ir_create_request, inspection_id)
        return InspectionRecordSchema().dump(created_ir), HTTPStatus.CREATED


@cors_preflight("PATCH, OPTIONS")
@API.route("/<int:inspection_record_id>", methods=["PATCH", "OPTIONS"])
class InspectionRecord(Resource):
    """InspectionRecord resource."""

    @staticmethod
    @API.response(code=200, description="Success", model=ir_list_model)
    @API.response(404, "Not Found")
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Fetch inspection record by id"
    )
    @auth.require
    def get(inspection_record_id):
        """Fetch inspection record by id."""
        inspection_record = InspectionRecordService.get_by_id(
            inspection_record_id)
        if not inspection_record:
            raise ResourceNotFoundError(
                f"No inspection found for the given ID : {inspection_record_id}"
            )
        return InspectionRecordSchema().dump(inspection_record), HTTPStatus.OK

    @staticmethod
    @API.response(code=200, description="Sucess", model=ir_list_model)
    @API.expect(ir_update_request_model)
    @ApiHelper.swagger_decorators(API, endpoint_description="Update inspection record")
    @API.response(404, "Not Found")
    @API.response(400, "Bad Request")
    @auth.require
    def patch(inspection_id, inspection_record_id):
        """Update inspection record."""
        ir_update_data = UpdateInspectionRecordSchema().load(API.payload)
        updated_ir = InspectionRecordService.update(
            inspection_id, inspection_record_id, ir_update_data
        )
        if not updated_ir:
            raise ResourceNotFoundError("Inspection record not found")
        return InspectionRecordSchema().dump(updated_ir), HTTPStatus.OK
