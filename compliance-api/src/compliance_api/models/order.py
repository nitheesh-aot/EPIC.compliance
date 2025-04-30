"""Order model."""

import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from compliance_api.utils.constant import DELETE_DIC_PARAMS

from .base_model import BaseModelVersioned
from .utils import with_session


class OrderStatusEnum(enum.Enum):
    """Order status enum."""

    OPEN = "Open"
    CLOSED = "Closed"
    RESCINDED = "Rescinded"


class OrderInspectionRequirementMap(BaseModelVersioned):
    """OrderInspectionRequirementMap Model."""

    __tablename__ = "order_inspection_requirement_maps"

    id = Column(
        Integer, primary_key=True, autoincrement=True, comment="The unique identifier"
    )
    order_id = Column(
        Integer, ForeignKey("orders.id", name="order_inspection_map_order_id_fkey")
    )
    inspection_requirement_id = Column(
        Integer,
        ForeignKey(
            "inspection_requirements.id",
            name="order_inspection_map_requirement_id_fkey",
        ),
    )
    order = relationship("Order", foreign_keys=[order_id], lazy="joined")
    inspection_requirement = relationship(
        "InspectionRequirement", foreign_keys=[inspection_requirement_id], lazy="joined"
    )

    @classmethod
    def get_by_order_id(cls, order_id):
        """Get inspection requirements by order id."""
        return cls.query.filter_by(
            order_id=order_id, is_deleted=False, is_active=True
        ).all()

    @classmethod
    @with_session
    def bulk_delete(
        cls, order_id: int, inspection_requirement_ids: list[int], session=None
    ):
        """Delete inspection requirement ids by id per order."""
        query = session.query(cls) if session else cls.query
        requirements = query.filter(
            cls.order_id == order_id,
            cls.inspection_requirement_id.in_(inspection_requirement_ids),
        )
        for requirement in requirements:
            requirement.update(DELETE_DIC_PARAMS, commit=not session)
        session.flush()

    @classmethod
    @with_session
    def bulk_insert(
        cls, order_id: int, inspection_requirement_ids: list[int], session=None
    ):
        """Insert inspection requirements per order."""
        order_inspection_requirement_map_data = [
            OrderInspectionRequirementMap(
                **{
                    "order_id": order_id,
                    "inspection_requirement_id": inspection_requirement_id,
                }
            )
            for inspection_requirement_id in inspection_requirement_ids
        ]
        session.add_all(order_inspection_requirement_map_data)
        session.flush()


class Order(BaseModelVersioned):
    """Order model."""

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    where_as = Column(String, nullable=True)
    now_therefore = Column(String, nullable=True)
    order_number = Column(String, nullable=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=True)
    date_issued = Column(DateTime(timezone=True), nullable=True)
    intended_issuance_date = Column(DateTime(timezone=True), nullable=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"), nullable=True)
    issuing_officer_id = Column(Integer, ForeignKey("staff_users.id"), nullable=False)
    issuing_officer = relationship(
        "StaffUser", foreign_keys=[issuing_officer_id], lazy="joined"
    )
    section = relationship("Section", foreign_keys=[section_id], lazy="joined")
    inspection = relationship("Inspection", foreign_keys=[inspection_id], lazy="select")
    order_status = Column(Enum(OrderStatusEnum), nullable=True)

    @classmethod
    def create(cls, order_data: dict, session=None):
        """Create a new order."""
        order = cls(**order_data)
        session.add(order)
        session.flush()
        return order
