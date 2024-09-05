"""Enum associated with Inspection model."""

import enum


class InspectionAttendanceOptionEnum(enum.Enum):
    """Attendance option enum."""

    AGENCIES = 1
    FIRSTNATIONS = 2
    MUNICIPAL = 3
    INDEPENDENT_ENVIRONMENTAL_MOINITOR = 4
    CERTIFICATE_HOLDER_REPRESENTATIVE = 5
    REGULATED_PARTY_REPRESENTATIVE = 6
    OTHER = 7


class InspectionStatusEnum(enum.Enum):
    """Inspection Status."""

    OPEN = "Open"
    CLOSED = "Closed"
