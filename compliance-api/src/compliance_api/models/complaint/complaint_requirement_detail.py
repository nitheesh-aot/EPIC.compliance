"""Complaint requirement detail model."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModel


class ComplaintRequirementDetail(BaseModel):
    """ComplaintRequirementDetail Model Class."""

    __tablename__ = "complaint_requirement_details"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the complaints",
    )
    complaint_id = Column(
        Integer,
        ForeignKey("complaints.id", name="details_complaint_id_complaints_id"),
        nullable=False,
        comment="The associated complaint",
    )
    topic_id = Column(
        Integer,
        ForeignKey("topics.id", name="details_topic_id_topics_id"),
        nullable=False,
        comment="The topic of the requirement",
    )
    description = Column(
        String, nullable=True, comment="Any description of the requirement"
    )

    complaint = relationship("Complaint", foreign_keys=[complaint_id], lazy="select")
    topic = relationship("Topic", foreign_keys=[topic_id], lazy="select")
