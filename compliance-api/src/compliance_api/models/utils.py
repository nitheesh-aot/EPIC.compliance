"""Utility functions on a database level."""

from functools import wraps

from .db import db


def with_session(func):
    """
    Handle the database session.

    The annotated method will be supplied with an argument of the session if not passed.
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        session = kwargs.pop("session", None)  # Try getting from kwargs first

        if session is None and args:  # Check the last positional argument
            possible_session = args[-1]
            if isinstance(
                possible_session, db.session.__class__
            ):  # Ensure it's a session
                session = possible_session
                args = args[:-1]  # R
        if not session:
            session = db.session
            kwargs["session"] = session
            result = func(*args, **kwargs)
            session.commit()
            return result
        kwargs["session"] = session
        return func(*args, **kwargs)

    return wrapper
