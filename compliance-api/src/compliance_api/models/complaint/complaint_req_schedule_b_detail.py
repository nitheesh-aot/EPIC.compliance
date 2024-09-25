"""ComplaintReqScheduleBDetail model."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModel


class ComplaintReqScheduleBDetail(BaseModel):
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

    @classmethod
    def create(cls, requirement_obj, session=None):
        """Create schedule b details."""
        requirement_more = ComplaintReqScheduleBDetail(**requirement_obj)
        if session:
            session.add(requirement_more)
            session.flush()
        else:
            requirement_more.save()
        return requirement_more
