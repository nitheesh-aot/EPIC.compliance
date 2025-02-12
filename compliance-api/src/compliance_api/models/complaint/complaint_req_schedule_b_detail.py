"""ComplaintReqScheduleBDetail model."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from compliance_api.utils.constant import DELETE_DIC_PARAMS

from ..base_model import BaseModelVersioned
from ..utils import with_session


class ComplaintReqScheduleBDetail(BaseModelVersioned):
    """ComplaintReqScheduleBDetail Model Class."""

    __tablename__ = "complaint_req_schedule_b_details"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the complaints",
    )
    req_id = Column(
        Integer,
        ForeignKey(
            "complaint_requirement_details.id",
            name="details_req_id_complaint_req_detail_id",
        ),
        nullable=False,
        comment="The unique id of the requirement details",
    )
    condition_number = Column(String, nullable=True, comment="The condition number")
    requirement_detail = relationship(
        "ComplaintRequirementDetail", foreign_keys=[req_id], lazy="select"
    )

    def to_dict(self):
        """Convert model instance to a dictionary for JSON serialization."""
        return {
            "id": self.id,
            "req_id": self.req_id,
            "condition_number": self.condition_number,
        }

    @classmethod
    @with_session
    def create(cls, requirement_obj, session=None):
        """Create schedule b details."""
        requirement_more = ComplaintReqScheduleBDetail(**requirement_obj)
        session.add(requirement_more)
        session.flush()
        return requirement_more

    @classmethod
    @with_session
    def update_details(cls, req_id, requirement_obj, session=None):
        """Update schedule b details."""
        query = cls.query.filter_by(req_id=req_id, is_deleted=False)
        requirement = query.first()
        requirement.update(requirement_obj, commit=False)
        session.flush()
        return requirement

    @classmethod
    @with_session
    def delete_details(cls, requirement_id, session=None):
        """Mark the details as deleted."""
        requirement = cls.query.filter_by(
            req_id=requirement_id, is_deleted=False
        ).first()
        requirement.update(DELETE_DIC_PARAMS, commit=False)
        session.flush()

    @classmethod
    def get_by_requirement(cls, req_id):
        """Get additional requirement source details."""
        return cls.query.filter_by(req_id=req_id, is_deleted=False).first()
