"""Complaint requirement detail model."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import Query, relationship

from compliance_api.utils.constant import DELETE_DIC_PARAMS

from ..base_model import BaseModelVersioned, db
from ..complaint.complaint import Complaint as ComplaintModel
from .complaint_req_eac_detail import ComplaintReqEACDetail as ComplaintReqEACDetailModel
from .complaint_req_order_detail import ComplaintReqOrderDetail as ComplaintReqOrderDetailModel
from .complaint_req_schedule_b_detail import ComplaintReqScheduleBDetail as ComplaintReqScheduleBDetailModel


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
        query = cls.query.filter_by(complaint_id=complaint_id, is_deleted=False)
        requirement: ComplaintRequirementDetail = query.first()
        if not requirement:
            return None
        requirement.update(requirement_source_data, commit=False)
        if session:
            session.flush()
        else:
            db.session.commit()
        return requirement

    @classmethod
    def get_by_complaint(cls, complaint_id):
        """Get requirement details by complaint id."""
        return cls.query.filter_by(complaint_id=complaint_id, is_deleted=False).first()

    @classmethod
    def delete_by_case_file(cls, case_file_id, session=None):
        """Delete requirement details by case file."""
        detail_query = cls.query.join(ComplaintModel).filter(
            ComplaintModel.case_file_id == case_file_id,
            ComplaintRequirementDetail.is_deleted.is_(False),
        )
        _delete_details(detail_query, cls, session)

    @classmethod
    def delete_by_complaint(cls, complaint_id, session=None):
        """Delete by complaint."""
        detail_query = cls.query.join(ComplaintModel).filter(
            ComplaintRequirementDetail.complaint_id == complaint_id,
            ComplaintRequirementDetail.is_deleted.is_(False),
        )
        _delete_details(detail_query, cls, session)


def _delete_details(detail_query: Query, cls, session=None):
    """
    Delete the requirement details and related records across multiple models.

    Args:
        detail_query (Query): Query object for fetching details.
        cls: Model class to perform additional queries.
        session: Optional SQLAlchemy session. If not provided, `db.session` will be used.
    """
    def process_related_records(query, model, foreign_key, commit=False):
        """
        Process related records for a given model.

        Args:
            query (Query): Base query to join with the related model.
            model: Related model to query.
            foreign_key: The foreign key field linking the models.
            commit (bool): Whether to commit the updates.
        """
        related_records = (
            query.join(model, ComplaintRequirementDetail.id == foreign_key)
            .filter(model.is_deleted.is_(False))
            .all()
        )
        related_ids = [record.id for record in related_records]
        if related_ids:
            related_details = cls.query.filter(model.id.in_(related_ids)).all()
            for detail in related_details:
                detail.update(DELETE_DIC_PARAMS, commit=commit)

    # Fetch all requirements
    requirements = detail_query.all()
    requirement_ids = [requirement.id for requirement in requirements]

    if requirement_ids:
        # Update ComplaintRequirementDetail records
        details = cls.query.filter(ComplaintRequirementDetail.id.in_(requirement_ids)).all()
        for detail in details:
            detail.update(DELETE_DIC_PARAMS, commit=False)

        # Process related models
        process_related_records(detail_query, ComplaintReqEACDetailModel, ComplaintReqEACDetailModel.req_id)
        process_related_records(detail_query, ComplaintReqOrderDetailModel, ComplaintReqOrderDetailModel.req_id)
        process_related_records(detail_query, ComplaintReqScheduleBDetailModel, ComplaintReqScheduleBDetailModel.req_id)

    # Commit changes
    if session:
        session.flush()
    else:
        db.session.commit()
