"""Model to handle the image uploads in inspection requirements."""

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..base_model import BaseModelVersioned
from .inspection_enum import ImageType


class InspectionRequirementImage(BaseModelVersioned):
    """InspectionRequirementImage."""

    __tablename__ = "inspection_req_images"
    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        comment="The unique identifier",
    )
    requirement_id = Column(
        Integer,
        ForeignKey(
            "inspection_requirements.id", name="inspection_req_images_req_id_fkey"
        ),
        nullable=False,
        index=True,
        comment="The requirement id",
    )
    sort_order = Column(
        Integer, nullable=False, comment="The order of images. grouped by the type."
    )
    image_type = Column(Enum(ImageType), nullable=False)
    original_file_name = Column(
        String, nullable=False, comment="The original filename of the uploaded image"
    )
    date_taken = Column(
        DateTime(timezone=True),
        nullable=False,
        comment="The time of the image when it is captured",
    )
    taken_by_id = Column(
        Integer,
        ForeignKey("staff_users.id", name="inspection_images_taken_by_fkey"),
        nullable=False,
        comment="The unique identifier of the staff who captured the image",
    )
    caption = Column(String, nullable=True, comment="The caption of the image")
    url = Column(
        String, nullable=False, comment="The actual url of the final uploaded image"
    )
    taken_by = relationship("StaffUser", foreign_keys=[taken_by_id], lazy="joined")
    inspection_requirement = relationship(
        "InspectionRequirement", foreign_keys=[requirement_id], lazy="select"
    )
