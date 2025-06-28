"""Scenario for appendix."""

from enum import Enum

from faker import Faker


fake = Faker()


class AppendixScenario(Enum):
    """Scenario for appendix."""

    default_value = {
        "inspection_id": 1,
        "appendix_no": fake.random_number(digits=4),
        "document_title": fake.text(),
    }
