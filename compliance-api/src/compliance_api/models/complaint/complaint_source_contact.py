"""Complaint source contact model."""

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from ..base_model import BaseModel
from ..type import EncryptedType


class ComplaintSourceContact(BaseModel):
    """Complaint source contact."""

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier of the source contact",
    )
    complaint_id = Column(
        Integer,
        ForeignKey("complaints.id", name="contact_complaint_id_complaints_id"),
        nullable=False,
    )
    full_name = Column(
        EncryptedType(), nullable=True, comment="The full name of the contact person"
    )
    email = Column(
        EncryptedType(),
        nullable=True,
        comment="The email address of the contact person",
    )
    phone = Column(
        EncryptedType(), nullable=True, comment="The phone number of the contact person"
    )
    comment = Column(EncryptedType(), nullable=True, comment="The comments")
    complaint = relationship("Complaint", foreign_keys=[complaint_id], lazy="joined")

    @classmethod
    def create_contact(cls, contact_data, session=None):
        """Persist contact info in database."""
        contact = ComplaintSourceContact(**contact_data)
        if session:
            session.add(contact)
            session.flush()
        else:
            contact.save()
        return contact
