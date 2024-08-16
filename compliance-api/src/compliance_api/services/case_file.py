"""Service for handle CaseFile."""

from compliance_api.models import CASE_FILE_INITIATION_MAP, CaseFileInitiationEnum


class CaseFileService:
    """CaseFile Service."""

    @classmethod
    def get_initiation_options(cls):
        """Return the case file initiation options."""
        return [
            {"id": case.name, "name": CASE_FILE_INITIATION_MAP[case]}
            for case in CaseFileInitiationEnum
        ]
