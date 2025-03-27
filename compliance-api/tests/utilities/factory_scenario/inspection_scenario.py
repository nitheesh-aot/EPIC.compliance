"""Scenario for inspection."""

from enum import Enum

from faker import Faker


fake = Faker()


class InspectionScenario:
    """Inspection Scenario."""

    default_value = Enum(
        "default_value",
        {
            "location_description": "test location description",
            "case_file_id": 1,
            "project_description": "project description",
            "utm": "utm",
            "primary_officer_id": 1,
            "project_status_id": 13,
            "start_date": "2024-08-29T20:18:55.740Z",
            "end_date": "2024-08-29T20:18:55.741Z",
            "debrief_date": "2024-08-29T20:18:55.741Z",
            "initiation_id": 1,
        },
    )
