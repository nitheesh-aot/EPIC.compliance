"""Model for WarningLetterApproval."""

from enum import Enum

from sqlalchemy import Column, DateTime
from sqlalchemy import Enum as SqlEnum
from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned
from .utils import with_session
from .warning_letter import WarningLetterStatusEnum


class WarningLetterApprovalStatusEnum(Enum):
    """WarningLetterApprovalStatusEnum."""

    DECISION_PENDING = "Decision Pending"
    APPROVED = "Approved"
    NOT_APPROVED = "Not Approved"


class WarningLetterApproval(BaseModelVersioned):
    """WarningLetterApproval."""

    __tablename__ = "warning_letter_approvals"

    id = Column(
        Integer, primary_key=True, autoincrement=True, comment="The unique identifier"
    )
    warning_letter_id = Column(
        Integer,
        ForeignKey(
            "warning_letters.id", name="warning_letter_approvals_warning_letter_id_fkey"
        ),
        nullable=False,
        comment="The unique identifier of the warning letter",
    )
    approved_by_id = Column(
        Integer,
        ForeignKey(
            "staff_users.id", name="ir_approval_approved_by_id_staff_user_id_fkey"
        ),
        nullable=True,
        comment="Person who approved the inspection record",
    )
    warning_letter_status = Column(
        SqlEnum(WarningLetterStatusEnum),
        nullable=True,
        comment="Status of the warning letter",
    )
    approved_date = Column(DateTime(timezone=True), nullable=True)
    approval_status = Column(
        SqlEnum(WarningLetterApprovalStatusEnum),
        nullable=True,
        comment="State of the warning letter",
        default=WarningLetterApprovalStatusEnum.DECISION_PENDING,
    )
    approved_by = relationship(
        "StaffUser", foreign_keys=[approved_by_id], lazy="joined"
    )
    warning_letter = relationship(
        "WarningLetter", foreign_keys=[warning_letter_id], lazy="joined"
    )

    @classmethod
    @with_session
    def create_warning_letter_approval(cls, warning_letter_approval_data, session=None):
        """Persist warning letter approval data in database."""
        warning_letter_approval = WarningLetterApproval(**warning_letter_approval_data)
        session.add(warning_letter_approval)
        session.flush()
        return warning_letter_approval

    @classmethod
    def get_approvals_by_warning_letter(cls, warning_letter_id: int):
        """Return all the approval entries by warning letter id."""
        return (
            cls.query.filter(
                cls.warning_letter_id == warning_letter_id,
                cls.is_active.is_(True),
                cls.is_deleted.is_(False),
            )
            .order_by(cls.created_date.desc())
            .all()
        )

    @classmethod
    def get_latest_approval_by_warning_letter(cls, warning_letter_id: int):
        """Return all the approval entries by warning letter id."""
        return (
            cls.query.filter(
                cls.warning_letter_id == warning_letter_id,
                cls.is_active.is_(True),
                cls.is_deleted.is_(False),
            )
            .order_by(cls.created_date.desc())
            .first()
        )

    @classmethod
    @with_session
    def update_approval(cls, approval_id, approval_update_data, session=None):
        """Update the warning letter approval."""
        approval = cls.find_by_id(approval_id)
        if not approval:
            return None
        approval.update(approval_update_data, commit=False)
        session.flush()
        return approval
