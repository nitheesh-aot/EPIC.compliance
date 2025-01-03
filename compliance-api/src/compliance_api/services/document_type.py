"""Document Type service."""

from compliance_api.models import DocumentType as DocumentTypeModel


class DocumentTypeService:
    """DocumentTypeService."""

    @classmethod
    def get_all(cls):
        """Get enforcement actions."""
        return DocumentTypeModel.get_all(sort_by="sort_order")
