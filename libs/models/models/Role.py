from .Base import Base
from flask.ext.security import RoleMixin
from .User import roles_users

from sqlalchemy import (
    Column,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

class Role(Base, RoleMixin):
    __tablename__ = 'role'


    id = Column(Integer(), primary_key=True)
    name = Column(String(80), unique=True)
    description = Column(String(255))

    users = relationship('User', secondary=roles_users)
    lazy_users = relationship('User', secondary=roles_users, lazy='dynamic')
