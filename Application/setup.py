from models import (
    User, 
    Role
)
from flask.ext.security.utils import encrypt_password

def setup_database(app):
    with app.app_context():
        admin_role = Role.query.filter_by(name='admin').first()
        if not admin_role:
            admin_role = Role(name='admin', description='Admin Users')
            app.db.session.add(admin_role)

        admin_user = User.query.filter_by(email='admin@localhost')
        
        if not admin_user:
            admin_user = User(
                email='admin@localhost', 
                password=encrypt_password('admin'))
            app.db.session.add(admin_user)
            admin_user.roles.append(role)

        app.db.session.commit()
