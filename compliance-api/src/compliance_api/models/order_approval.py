"""Model for OrderApproval."""

from enum import Enum

from sqlalchemy import Column, DateTime
from sqlalchemy import Enum as SqlEnum
from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned
from .order import OrderStatusEnum
from .utils import with_session


class OrderApprovalStatusEnum(Enum):
    """OrderApprovalStatusEnum."""

    APPROVAL_PENDING = "Approval Pending"
    APPROVED = "Approved"
    NOT_APPROVED = "Not Approved"


class OrderApproval(BaseModelVersioned):
    """OrderApproval."""

    __tablename__ = "order_approvals"

    id = Column(
        Integer, primary_key=True, autoincrement=True, comment="The unique identifier"
    )
    order_id = Column(
        Integer,
        ForeignKey("orders.id", name="order_approvals_order_id_fkey"),
        nullable=False,
        comment="The unique identifier of the order",
    )
    approved_by_id = Column(
        Integer,
        ForeignKey(
            "staff_users.id", name="ir_approval_approved_by_id_staff_user_id_fkey"
        ),
        nullable=True,
        comment="Person who approved the inspection record",
    )
    order_status = Column(SqlEnum(OrderStatusEnum), nullable=True)
    approval_status = Column(
        SqlEnum(OrderApprovalStatusEnum),
        nullable=True,
        comment="State of the order",
        default=OrderApprovalStatusEnum.APPROVAL_PENDING,
    )
    approved_by = relationship(
        "StaffUser", foreign_keys=[approved_by_id], lazy="joined"
    )
    approved_date = Column(DateTime(timezone=True), nullable=True)
    order = relationship("Order", foreign_keys=[order_id], lazy="joined")

    @classmethod
    @with_session
    def create_order_approval(cls, order_approval_data, session=None):
        """Persist order approval data in database."""
        order_approval = OrderApproval(**order_approval_data)
        session.add(order_approval)
        session.flush()
        return order_approval

    @classmethod
    def get_approvals_by_order(cls, order_id: int):
        """Return all the approval entries by order id."""
        return (
            cls.query.filter(
                cls.order_id == order_id,
                cls.is_active.is_(True),
                cls.is_deleted.is_(False),
            )
            .order_by(cls.created_date.desc())
            .all()
        )

    @classmethod
    def get_latest_approval_by_order(cls, order_id: int):
        """Return all the approval entries by order id."""
        return (
            cls.query.filter(
                cls.order_id == order_id,
                cls.is_active.is_(True),
                cls.is_deleted.is_(False),
            )
            .order_by(cls.created_date.desc())
            .first()
        )

    @classmethod
    @with_session
    def update_approval(cls, approval_id, approval_update_data, session=None):
        """Update the order approval."""
        approval = cls.find_by_id(approval_id)
        if not approval:
            return None
        approval.update(approval_update_data, commit=False)
        session.flush()
        return approval
