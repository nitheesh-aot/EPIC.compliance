"""Orders Resource."""

from http import HTTPStatus

from flask_restx import Namespace, Resource

from compliance_api.auth import auth
from compliance_api.exceptions import ResourceNotFoundError
from compliance_api.services.order.order import OrderService
from compliance_api.utils.constant import PermissionEnum

from ..schemas import OrderCreateSchema, OrderSchema
from ..utils.util import cors_preflight
from .apihelper import Api as ApiHelper


API = Namespace("orders", description="Endpoints for Orders")

order_create_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, OrderCreateSchema(), "OrderCreate"
)

order_list_model = ApiHelper.convert_ma_schema_to_restx_model(
    API, OrderSchema(), "OrderList"
)


@cors_preflight("GET, OPTIONS, POST")
@API.route("", methods=["POST", "GET", "OPTIONS"])
class Orders(Resource):
    """Resource for managing orders."""

    @staticmethod
    @auth.require
    @API.response(code=200, description="Success", model=[order_list_model])
    @ApiHelper.swagger_decorators(API, endpoint_description="Fetch all orders")
    def get(inspection_id):
        """Fetch all orders."""
        orders = OrderService.get_all(inspection_id)
        order_list_schema = OrderSchema(many=True)
        return order_list_schema.dump(orders), HTTPStatus.OK

    @staticmethod
    @auth.require
    @ApiHelper.swagger_decorators(API, endpoint_description="Create an order")
    @API.expect(order_create_model)
    @API.response(code=201, model=order_list_model, description="OrderCreated")
    @API.response(400, "Bad Request")
    def post(inspection_id):
        """Create an order."""
        order_data = OrderCreateSchema().load(API.payload)
        created_order = OrderService.create_order(inspection_id, order_data)
        return OrderSchema().dump(created_order), HTTPStatus.CREATED


@cors_preflight("GET, PATCH, DELETE, OPTIONS")
@API.route("/<int:order_id>", methods=["OPTIONS", "GET", "PATCH", "DELETE"])
@API.doc(params={"order_id": "The unique identifier for the order"})
class Order(Resource):
    """Resource for managing a single Order."""

    @staticmethod
    @auth.require
    @ApiHelper.swagger_decorators(API, endpoint_description="Fetch an order by id")
    @API.response(code=200, model=order_list_model, description="Success")
    @API.response(404, "Not Found")
    def get(inspection_id, order_id):
        """Fetch an order by id."""
        order = OrderService.get_order(inspection_id, order_id)
        if not order:
            raise ResourceNotFoundError(f"Order with {order_id} not found")
        return OrderSchema().dump(order), HTTPStatus.OK

    @staticmethod
    @auth.require
    @API.response(code=200, description="Success", model=[order_list_model])
    @API.response(400, "Bad Request")
    @API.response(404, "Not Found")
    @API.expect(order_list_model)
    @ApiHelper.swagger_decorators(API, endpoint_description="Update order")
    def patch(inspection_id, order_id):
        """Update order."""
        order_data = OrderSchema().load(API.payload)
        updated_order = OrderService.update_order(inspection_id, order_id, order_data)
        return OrderSchema().dump(updated_order), HTTPStatus.OK

    @staticmethod
    @auth.require
    @auth.has_one_of_roles([PermissionEnum.SUPERUSER])
    @ApiHelper.swagger_decorators(API, endpoint_description="Delete an Order by id")
    @API.response(code=204, description="Success")
    @API.response(404, "Not Found")
    def delete(inspection_id, order_id):
        """Delete order."""
        OrderService.delete_order(inspection_id, order_id)
        return {}, HTTPStatus.NO_CONTENT


@cors_preflight("GET, PATCH, DELETE, OPTIONS")
@API.route("/order-numbers/<string:order_number>", methods=["GET", "OPTIONS"])
@API.doc(params={"order_number": "The unique identifier for the order"})
class OrderByOrderNumber(Resource):
    """Resource for managing a single Order."""

    @staticmethod
    @auth.require
    @ApiHelper.swagger_decorators(API, endpoint_description="Fetch an order by id")
    @API.response(code=200, model=order_list_model, description="Success")
    @API.response(404, "Not Found")
    def get(inspection_id, order_number):
        """Fetch an order by id."""
        order = OrderService.get_order_by_order_number(inspection_id, order_number)
        if not order:
            raise ResourceNotFoundError(f"Order with {order_number} not found")
        return OrderSchema().dump(order), HTTPStatus.OK
