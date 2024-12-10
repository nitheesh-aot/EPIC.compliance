"""Complaint source contact model."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned, db
from ..type import EncryptedType
from .complaint import Complaint as ComplaintModel


class ComplaintSourceContact(BaseModelVersioned):
    """Complaint source contact."""

    __tablename__ = "complaint_source_contacts"
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
    description = Column(
        String(), nullable=True, comment="Any description about the contact"
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
    complaint = relationship(
        "Complaint",
        foreign_keys=[complaint_id],
        lazy="joined",
    )

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

    @classmethod
    def update_contact(cls, complaint_id, contact_data, session=None):
        """Update contact."""
        query = cls.query.filter_by(id=complaint_id, is_deleted=False)
        contact: ComplaintSourceContact = query.first()
        if not contact:
            return None
        query.update(contact_data)
        if session:
            session.flush()
        else:
            db.session.commit()
        return contact

    @classmethod
    def get_by_complaint(cls, complaint_id):
        """Get source contact by complaint id."""
        return cls.query.filter_by(complaint_id=complaint_id, is_deleted=False).first()

    @classmethod
    def delete_by_case_file(cls, case_file_id, session=None):
        """Delete the source contact based on case file."""
        contacts = (
            cls.query.join(ComplaintModel)
            .filter(
                ComplaintModel.case_file_id == case_file_id,
                ComplaintSourceContact.is_deleted is False,
            )
            .all()
        )
        contact_ids = [contact.id for contact in contacts]
        if contact_ids:
            cls.query.filter(ComplaintSourceContact.id.in_(contact_ids)).update(
                {
                    ComplaintSourceContact.is_deleted: True,
                    ComplaintSourceContact.is_active: False,
                }
            )
            if session:
                session.flush()
            else:
                db.session.commit()

    @classmethod
    def delete_by_complaint(cls, complaint_id, session=None):
        """Delete by complaint id."""
        cls.query.filter(ComplaintSourceContact.complaint_id == complaint_id).update(
            {
                ComplaintSourceContact.is_deleted: True,
                ComplaintSourceContact.is_active: False,
            }
        )
        if session:
            session.flush()
        else:
            db.session.commit()
