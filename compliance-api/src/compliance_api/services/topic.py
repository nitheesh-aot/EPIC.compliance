"""Service for topics management."""

from compliance_api.exceptions import ResourceExistsError
from compliance_api.models import db
from compliance_api.models.topic import Topic as TopicModel


class TopicService:
    """Topic management service."""

    @classmethod
    def get_by_id(cls, topic_id):
        """Get topic by id."""
        topic = TopicModel.find_by_id(topic_id)
        return topic

    @classmethod
    def get_all(cls):
        """Get all topics."""
        users = TopicModel.get_all()
        return users

    @classmethod
    def create(cls, topic_data: dict, commit=True):
        """Create topic."""
        _check_existence_by_name(topic_data.get("name", None))
        topic = TopicModel(**topic_data)
        topic.flush()
        if commit:
            db.session.commit()
        return topic

    @classmethod
    def update(cls, topic_id, topic_data, commit=True):
        """Update topic."""
        _check_existence_by_name(topic_data.get("name", None), topic_id)
        topic = TopicModel.find_by_id(topic_id)
        if not topic or topic.is_deleted:
            return None
        topic.update(topic_data, commit=False)
        if commit:
            db.session.commit()
        return topic

    @classmethod
    def delete(cls, topic_id, commit=True):
        """Delete the topic entity permenantly from database."""
        topic = TopicModel.find_by_id(topic_id)
        if not topic or topic.is_deleted:
            return None
        topic.is_deleted = True
        db.session.flush()
        if commit:
            db.session.commit()
        return topic


def _check_existence_by_name(topic_name: str, topic_id: int = None):
    """Check if the topic exists."""
    existing_topic = TopicModel.get_topic_by_name(topic_name)
    if existing_topic and (not topic_id or existing_topic.id != topic_id):
        raise ResourceExistsError(f"Topic with the name {topic_name} exists")
