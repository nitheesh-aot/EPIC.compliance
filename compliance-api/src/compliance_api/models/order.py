"""Order model."""

import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import relationship

from compliance_api.utils.constant import DELETE_DIC_PARAMS

from .base_model import BaseModelVersioned
from .case_file import CaseFile as CaseFileModel
from .inspection import Inspection as InspectionModel
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
    is_deleted = Column(Boolean, default=False, server_default="f", nullable=False)
    __table_args__ = (
        Index(
            "unique_non_deleted_order_number",  # Index name
            "order_number",
            unique=True,
            postgresql_where=(is_deleted is False),  # Condition for uniqueness
        ),
    )

    @classmethod
    @with_session
    def create(cls, order_data: dict, session=None):
        """Create a new order."""
        order = Order(**order_data)
        session.add(order)
        session.flush()
        return order

    @classmethod
    def get_count_by_project_nd_case_file_id(cls, project_id: int, case_file_id: int):
        """Get count of orders by project and case file id."""
        result = (
            cls.query.join(InspectionModel, InspectionModel.id == cls.inspection_id)
            .join(CaseFileModel, CaseFileModel.id == InspectionModel.case_file_id)
            .with_entities(
                InspectionModel.case_file_id,
                CaseFileModel.project_id,
                func.count(cls.id).label("order_count"),  # pylint: disable=not-callable
            )
            .filter(
                CaseFileModel.project_id == project_id,
                InspectionModel.case_file_id == case_file_id,
                cls.is_active.is_(True),
                cls.is_deleted.is_(False),
            )
            .group_by(InspectionModel.case_file_id, CaseFileModel.project_id)
            .first()
        )
        return result.order_count if result else 0

    @classmethod
    def get_by_order_number(cls, order_number: str):
        """Find an order by order number."""
        return cls.query.filter_by(order_number=order_number, is_deleted=False).first()
