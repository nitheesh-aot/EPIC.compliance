"""Warning Letter Resource."""

from http import HTTPStatus

from flask_restx import Namespace, Resource

from compliance_api.auth import auth
from compliance_api.exceptions import ResourceNotFoundError
from compliance_api.schemas.warning_letter import (
    WarningLetterCreateSchema, WarningLetterIssueSchema, WarningLetterSchema, WarningLetterStatusSchema,
    WarningLetterUpdateSchema)
from compliance_api.services.warning_letter.warning_letter import WarningLetterService
from compliance_api.utils.constant import PermissionEnum

from ..utils.util import cors_preflight
from .apihelper import Api as ApiHelper


API = Namespace("warning-letters", description="Endpoints for Warning Letters")

warning_letter_create_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, WarningLetterCreateSchema(), "WarningLetterCreate"
)

warning_letter_list_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, WarningLetterSchema(), "WarningLetterList"
)
warning_letter_update_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, WarningLetterUpdateSchema(), "WarningLetterUpdate"
)
warning_letter_status_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, WarningLetterStatusSchema(), "WarningLetterStatus"
)
warning_letter_issue_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, WarningLetterIssueSchema(), "WarningLetterIssue"
)


@cors_preflight("GET, OPTIONS, POST")
@API.route("", methods=["POST", "GET", "OPTIONS"])
class WarningLetters(Resource):
    """Resource for managing warning letters."""

    @staticmethod
    @auth.require
    @API.response(code=200, description="Success", model=[warning_letter_list_model])
    @ApiHelper.swagger_decorators(API, endpoint_description="Fetch all warning letters")
    def get(inspection_id):
        """Fetch all warning letters."""
        warning_letters = WarningLetterService.get_all(inspection_id)
        warning_letter_list_schema = WarningLetterSchema(many=True)
        return warning_letter_list_schema.dump(warning_letters), HTTPStatus.OK

    @staticmethod
    @auth.require
    @ApiHelper.swagger_decorators(API, endpoint_description="Create a warning letter")
    @API.expect(warning_letter_create_model)
    @API.response(
        code=201, model=warning_letter_list_model, description="WarningLetterCreated"
    )
    @API.response(400, "Bad Request")
    def post(inspection_id):
        """Create a warning letter."""
        warning_letter_data = WarningLetterCreateSchema().load(API.payload)
        created_warning_letter = WarningLetterService.create_warning_letter(
            inspection_id, warning_letter_data
        )
        return WarningLetterSchema().dump(created_warning_letter), HTTPStatus.CREATED


@cors_preflight("GET, PATCH, DELETE, OPTIONS")
@API.route("/<int:warning_letter_id>", methods=["OPTIONS", "GET", "PATCH", "DELETE"])
@API.doc(params={"warning_letter_id": "The unique identifier for the warning letter"})
class WarningLetter(Resource):
    """Resource for managing a single Warning Letter."""

    @staticmethod
    @auth.require
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Fetch a warning letter by id"
    )
    @API.response(code=200, model=warning_letter_list_model, description="Success")
    @API.response(404, "Not Found")
    def get(inspection_id, warning_letter_id):
        """Fetch a warning letter by id."""
        warning_letter = WarningLetterService.get_warning_letter(
            inspection_id, warning_letter_id
        )
        if not warning_letter:
            raise ResourceNotFoundError(
                f"Warning letter with {warning_letter_id} not found"
            )
        return WarningLetterSchema().dump(warning_letter), HTTPStatus.OK

    @staticmethod
    @auth.require
    @API.response(code=200, description="Success", model=[warning_letter_list_model])
    @API.response(400, "Bad Request")
    @API.response(404, "Not Found")
    @API.expect(warning_letter_update_model)
    @ApiHelper.swagger_decorators(API, endpoint_description="Update warning letter")
    def patch(inspection_id, warning_letter_id):
        """Update warning letter."""
        warning_letter_data = WarningLetterUpdateSchema().load(API.payload)
        updated_warning_letter = WarningLetterService.update_warning_letter(
            inspection_id, warning_letter_id, warning_letter_data
        )
        return WarningLetterSchema().dump(updated_warning_letter), HTTPStatus.OK

    @staticmethod
    @auth.require
    @auth.has_one_of_roles([PermissionEnum.SUPERUSER])
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Delete a warning letter by id"
    )
    @API.response(code=204, description="Success")
    @API.response(404, "Not Found")
    def delete(inspection_id, warning_letter_id):
        """Delete warning letter."""
        WarningLetterService.delete_warning_letter(inspection_id, warning_letter_id)
        return {}, HTTPStatus.NO_CONTENT


@cors_preflight("GET, PATCH, DELETE, OPTIONS")
@API.route(
    "/warning-letter-numbers/<string:warning_letter_number>", methods=["GET", "OPTIONS"]
)
@API.doc(
    params={"warning_letter_number": "The unique identifier for the warning letter"}
)
class WarningLetterByWarningLetterNumber(Resource):
    """Resource for managing a single Warning Letter."""

    @staticmethod
    @auth.require
    @ApiHelper.swagger_decorators(
        API, endpoint_description="Fetch a warning letter by id"
    )
    @API.response(code=200, model=warning_letter_list_model, description="Success")
    @API.response(404, "Not Found")
    def get(inspection_id, warning_letter_number):
        """Fetch a warning letter by id."""
        warning_letter = (
            WarningLetterService.get_warning_letter_by_warning_letter_number(
                inspection_id, warning_letter_number
            )
        )
        if not warning_letter:
            raise ResourceNotFoundError(
                f"Warning letter with {warning_letter_number} not found"
            )
        return WarningLetterSchema().dump(warning_letter), HTTPStatus.OK


@cors_preflight("PATCH, OPTIONS")
@API.route("/<int:warning_letter_id>/issue", methods=["PATCH", "OPTIONS"])
@API.doc(params={"warning_letter_id": "The unique identifier for the warning letter"})
class WarningLetterIssue(Resource):
    """Update the inspection status."""

    @staticmethod
    @auth.require
    @API.response(400, "Bad Request")
    @API.expect(warning_letter_issue_model)
    @API.response(404, "Not Found")
    @ApiHelper.swagger_decorators(API, endpoint_description="Issue warning letter")
    @API.response(code=204, description="Warning letter issued")
    def patch(inspection_id, warning_letter_id):
        """Issue Warning Letter."""
        issue = WarningLetterIssueSchema().load(API.payload)
        WarningLetterService.issue_warning_letter(
            inspection_id, warning_letter_id, issue
        )
        return {}, HTTPStatus.NO_CONTENT
