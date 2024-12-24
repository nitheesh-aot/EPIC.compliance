"""RequirementSourceDocumentMap Model."""

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned


class RequirementSourceDocumentMap(BaseModelVersioned):
    """RequirementSourceDocumentMap Model."""

    __tablename__ = "requirement_source_document_maps"

    id = Column(
        Integer, primary_key=True, autoincrement=True, comment="The unique identifier"
    )
    requirement_source_id = Column(
        Integer,
        ForeignKey("requirement_sources.id", name="req_source_map_req_source_id_fkey"),
    )
    document_type_id = Column(
        Integer,
        ForeignKey("document_types.id", name="req_doc_type_id_document_types_id_fkey"),
    )
    requirement_source = relationship(
        "RequirementSource", foreign_keys=[requirement_source_id], lazy="joined"
    )
    document_type = relationship(
        "DocumentType", foreign_keys=[document_type_id], lazy="joined"
    )
