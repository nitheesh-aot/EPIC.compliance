"""Model for InspectionRecordApproval."""

from enum import Enum

from sqlalchemy import Column, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship

from ..utils.database import with_session
from .base_model import BaseModelVersioned


class IRApprovalStatusEnum(Enum):
    """IRApprovalStatusEnum."""

    DECISION_PENDING = "Decision Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


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
    approved_by_id = Column(
        Integer, nullable=True, comment="Person who approved the inspection record"
    )
    ir_status_id = Column(
        ForeignKey("ir_status_options.id", name="ir_status_id_status_options_fkey"),
        nullable=False,
        comment="Status of the inspection record",
    )
    approved_by = relationship(
        "StaffUser", foreign_keys=[approved_by_id], lazy="joined"
    )
    inspection_record = relationship(
        "InspectionRecord", foreign_keys=[inspection_record_id], lazy="joined"
    )

    @classmethod
    @with_session
    def create_inspection_record_approval(cls, inspection_record_approval_data, session=None):
        """Persist inspection record approval data in database."""
        inspection_record_approval = InspectionRecordApproval(**inspection_record_approval_data)
        session.add(inspection_record_approval)
        session.flush()
        return inspection_record_approval
