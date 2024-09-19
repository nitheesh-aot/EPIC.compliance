"""SQLAlchemy custom types."""

import base64

from cryptography.fernet import Fernet
from flask import current_app
from sqlalchemy.types import String, TypeDecorator


# Define a custom SQLAlchemy type for encryption and decryption
class EncryptedType(TypeDecorator):
    """Custom encrypted type."""

    impl = String  # Use the base type that this will convert to/from

    def _get_cipher_suite(self):
        """Retrieve the cipher suite based on the key from the current app context."""
        key = current_app.config["DB_ECRPT_KEY"]  # Retrieve the encryption key
        return Fernet(key)

    def process_bind_param(self, value, dialect):
        """Encrypt the value before storing in the database."""
        if value is not None:
            cipher_suite = self._get_cipher_suite()
            encrypted_value = cipher_suite.encrypt(value.encode())
            return base64.b64encode(encrypted_value).decode(
                "utf-8"
            )  # Store in a base64-encoded format

    def process_result_value(self, value, dialect):
        """Decrypt the value when retrieving from the database."""
        if value is not None:
            cipher_suite = self._get_cipher_suite()
            encrypted_value = base64.b64decode(value.encode("utf-8"))
            decrypted_value = cipher_suite.decrypt(encrypted_value).decode("utf-8")
            return decrypted_value

    def process_literal_param(self, value, dialect):
        """Process literal values in SQLAlchemy expressions."""
        return self.process_bind_param(value, dialect)
