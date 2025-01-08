"""InspectionRequirementDetailDocument Model."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned, db
from .inspection_req_source_detail import InspectionReqSourceDetail


class InspectionReqDetailDocument(BaseModelVersioned):
    """InspectionReqDetailDocument Model."""

    __tablename__ = "inspection_req_detail_documents"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier",
    )
    req_detail_id = Column(
        Integer,
        ForeignKey(
            "inspection_req_source_details.id",
            name="inspection_req_detail_documents_req_detail_id_fkey",
        ),
        comment="The unique identifier of the requirement detail",
        nullable=False,
    )
    document_type_id = Column(
        Integer,
        ForeignKey(
            "document_types.id", name="inspection_req_detail_documents_document_id_fkey"
        ),
        comment="The unique identifier of the document type",
        nullable=False,
    )
    document_title = Column(String, nullable=True, comment="The title of the document")
    section_number = Column(
        String,
        nullable=True,
        comment="The highlighted section number in the uploaded document",
    )
    section_title = Column(
        String,
        nullable=True,
        comment="The title of the section associated with the document",
    )
    description = Column(
        String, nullable=True, comment="Additional description of the document"
    )
    requirement_source_detail = relationship(
        "InspectionReqSourceDetail",
        back_populates="documents",
        lazy="select",
        uselist=False,
    )
    document_type = relationship(
        "DocumentType", foreign_keys=[document_type_id], lazy="select"
    )

    @classmethod
    def create_doc_detail(cls, doc_detail_obj, session=None):
        """Persist doc detail in database."""
        doc_detail = InspectionReqDetailDocument(**doc_detail_obj)
        if session:
            session.add(doc_detail)
            session.flush()
        else:
            doc_detail.save()
        return doc_detail

    @classmethod
    def update_doc_detail(cls, doc_detail_id, doc_detail_data, session=None):
        """Update requirement doc detail."""
        query = cls.query.filter_by(id=doc_detail_id)
        doc_detail: InspectionReqDetailDocument = query.first()
        if not doc_detail or doc_detail.is_deleted:
            return None
        query.update(doc_detail_data)
        if session:
            session.flush()
        else:
            db.session.commit()
        return doc_detail

    @classmethod
    def delete_req_doc_details_by_ids(cls, req_doc_detail_ids, session=None):
        """Delete the requirement doc details by req_doc_detail_ids."""
        cls.query.filter(InspectionReqDetailDocument.id.in_(req_doc_detail_ids)).update(
            {cls.is_deleted: True, cls.is_active: False}
        )
        if session:
            session.flush()
        else:
            db.session.commit()

    @classmethod
    def delete_by_requirement_id(cls, requirement_id, session=None):
        """Delete requirement doc details by requirement_id."""
        requirement_details = (
            db.session.query(InspectionReqSourceDetail)
            .filter_by(requirement_id=requirement_id, is_deleted=False)
            .all()
        )
        requirement_detail_ids = [detail.id for detail in requirement_details]
        cls.query.filter(cls.req_detail_id.in_(requirement_detail_ids)).update(
            {cls.is_active: False, cls.is_deleted: True}
        )
        if session:
            session.flush()
        else:
            db.session.commit()
