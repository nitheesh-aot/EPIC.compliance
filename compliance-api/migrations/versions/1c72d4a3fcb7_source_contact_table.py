"""source contact table

Revision ID: 1c72d4a3fcb7
Revises: 583a92eaa5f1
Create Date: 2024-09-25 15:46:45.013940

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from compliance_api.models.type import EncryptedType
# revision identifiers, used by Alembic.
revision = '1c72d4a3fcb7'
down_revision = '583a92eaa5f1'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('complaint_source_contacts',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='The unique identifier of the source contact'),
    sa.Column('complaint_id', sa.Integer(), nullable=False),
    sa.Column('description', sa.String(), nullable=True, comment='Any description about the contact'),
    sa.Column('full_name', EncryptedType(), nullable=True, comment='The full name of the contact person'),
    sa.Column('email', EncryptedType(), nullable=True, comment='The email address of the contact person'),
    sa.Column('phone', EncryptedType(), nullable=True, comment='The phone number of the contact person'),
    sa.Column('comment', EncryptedType(), nullable=True, comment='The comments'),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.Column('updated_date', sa.DateTime(), nullable=True),
    sa.Column('created_by', sa.String(length=100), nullable=False),
    sa.Column('updated_by', sa.String(length=100), nullable=True),
    sa.Column('is_active', sa.Boolean(), server_default='t', nullable=False),
    sa.Column('is_deleted', sa.Boolean(), server_default='f', nullable=False),
    sa.ForeignKeyConstraint(['complaint_id'], ['complaints.id'], name='contact_complaint_id_complaints_id'),
    sa.PrimaryKeyConstraint('id')
    )
    op.drop_table('complaint_source_contact')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('complaint_source_contact',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False, comment='The unique identifier of the source contact'),
    sa.Column('complaint_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('full_name', sa.VARCHAR(), autoincrement=False, nullable=True, comment='The full name of the contact person'),
    sa.Column('email', sa.VARCHAR(), autoincrement=False, nullable=True, comment='The email address of the contact person'),
    sa.Column('phone', sa.VARCHAR(), autoincrement=False, nullable=True, comment='The phone number of the contact person'),
    sa.Column('comment', sa.VARCHAR(), autoincrement=False, nullable=True, comment='The comments'),
    sa.Column('created_date', postgresql.TIMESTAMP(), autoincrement=False, nullable=False),
    sa.Column('updated_date', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.Column('created_by', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('updated_by', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('is_active', sa.BOOLEAN(), server_default=sa.text('true'), autoincrement=False, nullable=False),
    sa.Column('is_deleted', sa.BOOLEAN(), server_default=sa.text('false'), autoincrement=False, nullable=False),
    sa.Column('description', sa.VARCHAR(), autoincrement=False, nullable=True, comment='Any description about the contact'),
    sa.ForeignKeyConstraint(['complaint_id'], ['complaints.id'], name='contact_complaint_id_complaints_id'),
    sa.PrimaryKeyConstraint('id', name='complaint_source_contact_pkey')
    )
    op.drop_table('complaint_source_contacts')
    # ### end Alembic commands ###