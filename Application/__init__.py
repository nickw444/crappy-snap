from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.security import Security, SQLAlchemyUserDatastore
from flask_mail import Mail
from flask_boilerplate_utils import Boilerplate
# from flask_boilerplate_utils.menu import Menu
from flask.ext.menu import Menu
#  Initial App Setup
app = Flask(__name__)

# Configure the app.
import config
app.config_class = config.get_config()
app.config.from_object(app.config_class)

# Initialise the boilerplate and do Configuration Magic.
Boilerplate(app)
# Menu(app)
# Setup flask menu
Menu(app)


# Register blueprints
from Application.modules.photobooth import photobooth
app.register_blueprint(photobooth, url_prefix='')
