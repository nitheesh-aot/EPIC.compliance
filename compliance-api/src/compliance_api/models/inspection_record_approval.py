"""Model for InspectionRecordApproval."""

from enum import Enum

from sqlalchemy import Boolean, Column, DateTime
from sqlalchemy import Enum as SqlEnum
from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned
from .utils import with_session


class IRApprovalStatusEnum(Enum):
    """IRApprovalStatusEnum."""

    DECISION_PENDING = "Decision Pending"
    APPROVED = "Approved"
    NOT_APPROVED = "Not Approved"


class InspectionRecordApproval(BaseModelVersioned):
    """InspectionRecordApproval."""

    __tablename__ = "inspection_record_approvals"

    id = Column(
        Integer, primary_key=True, autoincrement=True, comment="The unique identifier"
    )
    inspection_record_id = Column(
        Integer,
        ForeignKey("inspection_records.id", name="ir_approvals_ir_id_fkey"),
        nullable=False,
        comment="The unique identifier of the inspection record",
    )
    date_report_sent = Column(
        DateTime(timezone=True), nullable=True, comment="Date when the report was sent"
    )
    date_expected_return = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Expected return date for response",
    )
    date_response = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Date when the response was received",
    )
    response_provided = Column(
        Boolean, default=False, comment="Indicate if the proponent has responded or not"
    )
    approved_by_id = Column(
        Integer,
        ForeignKey(
            "staff_users.id", name="ir_approval_approved_by_id_staff_user_id_fkey"
        ),
        nullable=True,
        comment="Person who approved the inspection record",
    )
    ir_status_id = Column(
        ForeignKey("ir_status_options.id", name="ir_status_id_status_options_fkey"),
        nullable=False,
        comment="Status of the inspection record",
    )
    approval_status = Column(
        SqlEnum(IRApprovalStatusEnum),
        nullable=True,
        comment="State of the inspection record",
        default=IRApprovalStatusEnum.DECISION_PENDING,
    )
    approved_date = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="The approved date",
    )
    approved_by = relationship(
        "StaffUser", foreign_keys=[approved_by_id], lazy="joined"
    )
    inspection_record = relationship(
        "InspectionRecord", foreign_keys=[inspection_record_id], lazy="joined"
    )

    @classmethod
    @with_session
    def create_inspection_record_approval(
        cls, inspection_record_approval_data, session=None
    ):
        """Persist inspection record approval data in database."""
        inspection_record_approval = InspectionRecordApproval(
            **inspection_record_approval_data
        )
        session.add(inspection_record_approval)
        session.flush()
        return inspection_record_approval

    @classmethod
    def get_approvals_by_ir(cls, inspection_record_id: int):
        """Return all the approval entries by inspection record id."""
        return (
            cls.query.filter(
                cls.inspection_record_id == inspection_record_id,
                cls.is_active.is_(True),
                cls.is_deleted.is_(False),
            )
            .order_by(cls.created_date.desc())
            .all()
        )

    @classmethod
    def get_latest_approval_by_ir(cls, inspection_record_id: int):
        """Return all the approval entries by inspection record id."""
        return (
            cls.query.filter(
                cls.inspection_record_id == inspection_record_id,
                cls.is_active.is_(True),
                cls.is_deleted.is_(False),
            )
            .order_by(cls.created_date.desc())
            .first()
        )

    @classmethod
    @with_session
    def update_approval(cls, approval_id, approval_update_data, session=None):
        """Update the inspection record approval."""
        approval = cls.find_by_id(approval_id)
        if not approval:
            return None
        approval.update(approval_update_data, commit=False)
        session.flush()
        return approval
