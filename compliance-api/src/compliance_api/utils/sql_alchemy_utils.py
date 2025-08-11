"""Utilities for SQLAlchemy."""

from sqlalchemy import and_, case


def null_if_empty(col):
    """Return a case expression that returns None if the column is empty."""
    return case((and_(col.isnot(None), col != ""), col), else_=None)
