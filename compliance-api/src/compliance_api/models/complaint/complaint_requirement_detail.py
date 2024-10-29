"""Complaint requirement detail model."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned


class ComplaintRequirementDetail(BaseModelVersioned):
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
    topic = relationship("Topic", foreign_keys=[topic_id], lazy="select")
    complaint = relationship(
        "Complaint",
        foreign_keys=[complaint_id],
        lazy="joined",
        back_populates="requirement_detail",
    )

    @classmethod
    def create_detail(cls, requirement_source_data, session=None):
        """Persist details in database."""
        requirement_source_detail = ComplaintRequirementDetail(
            **requirement_source_data
        )
        if session:
            session.add(requirement_source_detail)
            session.flush()
        else:
            requirement_source_detail.save()
        return requirement_source_detail

    @classmethod
    def update_detail(cls, complaint_id, requirement_source_data, session=None):
        """Update requirement source details."""
        query = cls.query.filter_by(id=complaint_id, is_deleted=False)
        requirement: ComplaintRequirementDetail = query.first()
        if not requirement:
            return None
        query.update(requirement_source_data)
        if session:
            session.flush()
        else:
            cls.session.commit()
        return requirement

    @classmethod
    def get_by_complaint(cls, complaint_id):
        """Get requirement details by complaint id."""
        return cls.query.filter_by(complaint_id=complaint_id, is_deleted=False).first()
