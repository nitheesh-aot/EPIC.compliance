"""Enums related to document service."""

from enum import Enum


class ActionOnFileEnum(Enum):
    """ActionOnFileEnum."""

    PUT = "PUT"
    DELETE = "DELETE"
    GET = "GET"
