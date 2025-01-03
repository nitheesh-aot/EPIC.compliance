"""InspectionRequirementDetailDocument Model."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned


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
        uselist=False
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
