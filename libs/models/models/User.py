from .Base import Base
from flask.ext.security import UserMixin

from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    Boolean,
    DateTime,
    String,
    Table,
)
from sqlalchemy.orm import relationship

roles_users = Table('roles_users', Base.metadata,
        Column('user_id', Integer, ForeignKey('user.id')),
        Column('role_id', Integer, ForeignKey('role.id')))

class User(Base, UserMixin):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True)
    password = Column(String(255))
    active = Column(Boolean())
    confirmed_at = Column(DateTime())
    roles = relationship('Role', secondary=roles_users)
    lazy_roles = relationship('Role', secondary=roles_users, lazy='dynamic')

    def is_admin(self):
        return self.has_role('admin')