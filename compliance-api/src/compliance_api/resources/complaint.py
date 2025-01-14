"""API endpoints for managing complaints."""

from http import HTTPStatus

from flask import current_app, request
from flask_restx import Namespace, Resource

from compliance_api.auth import auth
from compliance_api.exceptions import ResourceNotFoundError
from compliance_api.schemas import (
    ComplaintCreateSchema, ComplaintSchema, ComplaintSourceContactSchema, ComplaintStatusSchema, ComplaintUpdateSchema,
    KeyValueSchema, RequirementSourceDetailSchema)
from compliance_api.services import ComplaintService
from compliance_api.utils.enum import PermissionEnum
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

complaint_source_contact_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, ComplaintSourceContactSchema(), "SourceContact"
)

complaint_requirement_details = ApiHelper.convert_ma_schema_to_restx_model(
    API, RequirementSourceDetailSchema(), "RequirementDetails"
)
complaint_update_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, ComplaintUpdateSchema(), "ComplaintUpdate"
)
complaint_status_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, ComplaintStatusSchema(), "ComplaintStatus"
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


@cors_preflight("GET, OPTIONS, POST")
@API.route("", methods=["POST", "GET", "OPTIONS"])
class Complaints(Resource):
    """Resource for managing complaints."""

    @staticmethod
    @API.response(code=200, description="Success", model=[complaint_list_model])
    @API.doc(
        params={
            "case_file_id": {
                "description": "The unique identifier of the case file",
                "type": "integer",
                "required": False,
            }
        }
    )
    @ApiHelper.swagger_decorators(API, endpoint_description="Fetch all complaints")
    @auth.require
    def get():
        """Fetch all complaints."""
        case_file_id = request.args.get("case_file_id")
        if case_file_id:
            complaints = ComplaintService.get_by_case_file_id(case_file_id)
        else:
            complaints = ComplaintService.get_all()
        complaint_list_schema = ComplaintSchema(many=True)
        return complaint_list_schema.dump(complaints), HTTPStatus.OK

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


@cors_preflight("GET, PATCH, DELETE, OPTIONS")
@API.route("/<int:complaint_id>", methods=["OPTIONS", "GET", "PATCH", "DELETE"])
@API.doc(params={"complaint_id": "The unique identifier for the complaint"})
class Complaint(Resource):
    """Resource for managing a single Complaint."""

    @staticmethod
    @ApiHelper.swagger_decorators(API, endpoint_description="Fetch a complaint by id")
    @API.response(code=200, model=complaint_list_model, description="Success")
    @API.response(404, "Not Found")
    def get(complaint_id):
        """Fetch a complaint by id."""
        complaint = ComplaintService.get_by_id(complaint_id)
        if not complaint:
            raise ResourceNotFoundError(f"Complaint with {complaint} not found")
        return ComplaintSchema().dump(complaint), HTTPStatus.OK

    @staticmethod
    @API.response(code=200, description="Sucess", model=[complaint_list_model])
    @API.expect(complaint_update_model)
    @ApiHelper.swagger_decorators(API, endpoint_description="Update complaint")
    @auth.require
    def patch(complaint_id):
        """Update complaint."""
        complaint_data = ComplaintUpdateSchema().load(API.payload)
        updated_complaint = ComplaintService.update(complaint_id, complaint_data)
        return ComplaintSchema().dump(updated_complaint), HTTPStatus.OK

    @staticmethod
    @auth.require
    @auth.has_one_of_roles([PermissionEnum.SUPERUSER])
    @ApiHelper.swagger_decorators(API, endpoint_description="Delete a Complaint by id")
    @API.response(code=204, description="Success")
    @API.response(400, "Bad Request")
    @API.response(404, "Not Found")
    def delete(complaint_id):
        """Delete complaint."""
        ComplaintService.delete_complaint(complaint_id)
        return {}, HTTPStatus.NO_CONTENT


@cors_preflight("GET, OPTIONS")
@API.route("/<int:complaint_id>/requirement-details", methods=["OPTIONS", "GET"])
@API.doc(params={"complaint_id": "The unique identifier for the complaint"})
class ComplaintRequirementDetails(Resource):
    """Resource for managing a Complaint requirement details.."""

    @staticmethod
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Fetch a complaint requirement details"
    )
    @API.response(code=200, model=complaint_requirement_details, description="Success")
    @API.response(404, "Not Found")
    def get(complaint_id):
        """Fetch a complaint requirement details."""
        requirements = ComplaintService.get_requirement_details(complaint_id)
        return RequirementSourceDetailSchema().dump(requirements), HTTPStatus.OK


@cors_preflight("GET, OPTIONS")
@API.route("/<int:complaint_id>/source-contacts", methods=["OPTIONS", "GET"])
@API.doc(params={"complaint_id": "The unique identifier for the complaint"})
class ComplaintContact(Resource):
    """Resource for managing a Complaint Contact."""

    @staticmethod
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Fetch a complaint source contact"
    )
    @API.response(code=200, model=complaint_source_contact_model, description="Success")
    @API.response(404, "Not Found")
    def get(complaint_id):
        """Fetch a complaint source contact."""
        contact = ComplaintService.get_source_contact(complaint_id)
        if not contact:
            raise ResourceNotFoundError("Complaint source contact doesn't found")
        return ComplaintSourceContactSchema().dump(contact), HTTPStatus.OK


@cors_preflight("GET, OPTIONS")
@API.route("/complaint-numbers/<string:complaint_number>", methods=["GET", "OPTIONS"])
class ComplaintByNumber(Resource):
    """Complaint resource."""

    @staticmethod
    @API.response(code=200, description="Success", model=[complaint_list_model])
    @ApiHelper.swagger_decorators(API, endpoint_description="Fetch complaint by number")
    @auth.require
    def get(complaint_number):
        """Fetch all complaint."""
        complaint = ComplaintService.get_by_complaint_no(complaint_number)
        if not complaint:
            raise ResourceNotFoundError(f"Complaint with {complaint_number} not found")
        complaint_list_schema = ComplaintSchema()
        return complaint_list_schema.dump(complaint), HTTPStatus.OK


@cors_preflight("PATCH, OPTIONS")
@API.route("/<int:complaint_id>/status", methods=["PATCH", "OPTIONS"])
@API.doc(params={"complaint_id": "The unique identifier for the complaint"})
class ComplaintStatus(Resource):
    """Update the complaint status."""

    @staticmethod
    @auth.require
    @API.expect(complaint_status_model)
    @API.response(400, "Bad Request")
    @API.response(404, "Not Found")
    @ApiHelper.swagger_decorators(API, endpoint_description="Close the complaint")
    @API.response(code=204, description="Complaint Closed")
    def patch(complaint_id):
        """Close complaint."""
        status = ComplaintStatusSchema().load(API.payload)
        ComplaintService.change_case_file_status(complaint_id, status)
        return {}, HTTPStatus.NO_CONTENT
