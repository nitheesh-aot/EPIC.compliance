"""Continuation report tables

Revision ID: 6d8d7b605eba
Revises: 21278058610c
Create Date: 2024-10-08 12:40:41.986778

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6d8d7b605eba'
down_revision = '21278058610c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('continuation_report_keys_version',
    sa.Column('id', sa.Integer(), autoincrement=False, nullable=False, comment='The unique identifier'),
    sa.Column('report_id', sa.Integer(), autoincrement=False, nullable=True, comment='The unique identifier of the report entry'),
    sa.Column('key', sa.String(), autoincrement=False, nullable=True, comment='The key which is used to provide hyperlink to other entities'),
    sa.Column('key_context', sa.Enum('INSPECTION', 'COMPLAINT', 'CASE_FILE', 'ORDER', name='contexttypeenum'), autoincrement=False, nullable=True, comment='The context of the key which is used to create hyperlinks using the key'),
    sa.Column('created_date', sa.DateTime(), autoincrement=False, nullable=True),
    sa.Column('updated_date', sa.DateTime(), autoincrement=False, nullable=True),
    sa.Column('created_by', sa.String(length=100), autoincrement=False, nullable=True),
    sa.Column('updated_by', sa.String(length=100), autoincrement=False, nullable=True),
    sa.Column('is_active', sa.Boolean(), server_default='t', autoincrement=False, nullable=True),
    sa.Column('is_deleted', sa.Boolean(), server_default='f', autoincrement=False, nullable=True),
    sa.Column('transaction_id', sa.BigInteger(), autoincrement=False, nullable=False),
    sa.Column('end_transaction_id', sa.BigInteger(), nullable=True),
    sa.Column('operation_type', sa.SmallInteger(), nullable=False),
    sa.Column('report_id_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('key_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('key_context_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('created_date_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('updated_date_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('created_by_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('updated_by_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('is_active_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('is_deleted_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.PrimaryKeyConstraint('id', 'transaction_id')
    )
    op.create_table('continuation_reports_version',
    sa.Column('id', sa.Integer(), autoincrement=False, nullable=False, comment='The unique identifier'),
    sa.Column('case_file_id', sa.Integer(), autoincrement=False, nullable=True, comment='The unique identifier of the case file associated with the inspection'),
    sa.Column('text', sa.String(), autoincrement=False, nullable=True, comment='The plane text version of the string'),
    sa.Column('rich_text', sa.String(), autoincrement=False, nullable=True, comment='The html formatted version of the text'),
    sa.Column('context_type', sa.Enum('INSPECTION', 'COMPLAINT', 'CASE_FILE', 'ORDER', name='contexttypeenum'), autoincrement=False, nullable=True, comment='Indicates the context in which the entry is made'),
    sa.Column('context_id', sa.Integer(), autoincrement=False, nullable=True, comment='The identifier of the entity referred by the context type'),
    sa.Column('system_generated', sa.Boolean(), autoincrement=False, nullable=True, comment='To indicate if the entry is generated as part of the service invocation'),
    sa.Column('created_date', sa.DateTime(), autoincrement=False, nullable=True),
    sa.Column('updated_date', sa.DateTime(), autoincrement=False, nullable=True),
    sa.Column('created_by', sa.String(length=100), autoincrement=False, nullable=True),
    sa.Column('updated_by', sa.String(length=100), autoincrement=False, nullable=True),
    sa.Column('is_active', sa.Boolean(), server_default='t', autoincrement=False, nullable=True),
    sa.Column('is_deleted', sa.Boolean(), server_default='f', autoincrement=False, nullable=True),
    sa.Column('transaction_id', sa.BigInteger(), autoincrement=False, nullable=False),
    sa.Column('end_transaction_id', sa.BigInteger(), nullable=True),
    sa.Column('operation_type', sa.SmallInteger(), nullable=False),
    sa.Column('case_file_id_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('text_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('rich_text_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('context_type_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('context_id_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('system_generated_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('created_date_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('updated_date_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('created_by_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('updated_by_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('is_active_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('is_deleted_mod', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.PrimaryKeyConstraint('id', 'transaction_id')
    )
    op.create_table('continuation_reports',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='The unique identifier'),
    sa.Column('case_file_id', sa.Integer(), nullable=False, comment='The unique identifier of the case file associated with the inspection'),
    sa.Column('text', sa.String(), nullable=True, comment='The plane text version of the string'),
    sa.Column('rich_text', sa.String(), nullable=True, comment='The html formatted version of the text'),
    sa.Column('context_type', sa.Enum('INSPECTION', 'COMPLAINT', 'CASE_FILE', 'ORDER', name='contexttypeenum'), nullable=False, comment='Indicates the context in which the entry is made'),
    sa.Column('context_id', sa.Integer(), nullable=False, comment='The identifier of the entity referred by the context type'),
    sa.Column('system_generated', sa.Boolean(), nullable=True, comment='To indicate if the entry is generated as part of the service invocation'),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.Column('updated_date', sa.DateTime(), nullable=True),
    sa.Column('created_by', sa.String(length=100), nullable=False),
    sa.Column('updated_by', sa.String(length=100), nullable=True),
    sa.Column('is_active', sa.Boolean(), server_default='t', nullable=False),
    sa.Column('is_deleted', sa.Boolean(), server_default='f', nullable=False),
    sa.ForeignKeyConstraint(['case_file_id'], ['case_files.id'], name='inspections_case_file_id_case_file_id_fkey'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('continuation_report_keys',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, comment='The unique identifier'),
    sa.Column('report_id', sa.Integer(), nullable=False, comment='The unique identifier of the report entry'),
    sa.Column('key', sa.String(), nullable=False, comment='The key which is used to provide hyperlink to other entities'),
    sa.Column('key_context', sa.Enum('INSPECTION', 'COMPLAINT', 'CASE_FILE', 'ORDER', name='contexttypeenum'), nullable=False, comment='The context of the key which is used to create hyperlinks using the key'),
    sa.Column('created_date', sa.DateTime(), nullable=False),
    sa.Column('updated_date', sa.DateTime(), nullable=True),
    sa.Column('created_by', sa.String(length=100), nullable=False),
    sa.Column('updated_by', sa.String(length=100), nullable=True),
    sa.Column('is_active', sa.Boolean(), server_default='t', nullable=False),
    sa.Column('is_deleted', sa.Boolean(), server_default='f', nullable=False),
    sa.ForeignKeyConstraint(['report_id'], ['continuation_reports.id'], name='continuation_report_keys_report_id_continuation_report_id_fkey'),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('continuation_report_keys')
    op.drop_table('continuation_reports')
    op.drop_table('continuation_reports_version')
    op.drop_table('continuation_report_keys_version')
    op.execute(sa.text("DROP TYPE IF EXISTS contexttypeenum"))
    # ### end Alembic commands ###
