import sys
import os
from flask_boilerplate_buildutils.configuration import (
    make_keys,
    BaseConfiguration
)

key_store = os.path.dirname(os.path.abspath(__file__))
key_store = os.path.abspath(os.path.join(key_store,'../../../'))
keys = make_keys(key_store)


class Config(BaseConfiguration):
    # General App Config
    APP_NAME = 'Boilerplate'
    APP_DESCRIPTION = 'Welcome to my website'
    DB_BASE = 'boilerplate'
    
    # Mail Configuration
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_SSL = False
    MAIL_USERNAME = ''
    MAIL_PASSWORD = ''

    # Babel configuration
    BABEL_DEFAULT_LOCALE = 'en'
    BABEL_DEFAULT_TIMEZONE = 'Australia/Sydney'

    # Security Configuration
    SECURITY_RECOVERABLE = True
    SECURITY_CHANGEABLE = True
    SECURITY_EMAIL_SENDER = 'security@localhost'
    SECURITY_UNAUTHORIZED_VIEW = '/unauthorised'    
    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_SALT = keys['SECURITY_PASSWORD_SALT']
    SECRET_KEY = keys['SECRET_KEY']

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
class Production(Config):
    # SQL Configuration for Production
    DB_DRIVER = 'postgresql'
    DB_USERNAME = 'username'
    DB_PASSWORD = 'password'
    DB_HOST = '127.0.0.1'
    DB_DATABASE = ''
    SENTRY_DSN = ''

class Development(Config):

    DEBUG = True
    DB_DRIVER = 'sqlite'
    DB_DATABASE = Config.DB_BASE

class MySQLStd(Development):

    DB_DRIVER = 'mysql+pymysql'
    DB_USERNAME = 'dev'
    DB_HOST = '127.0.0.1'
    DB_DATABASE = 'DEV_%s' % Development.DB_BASE


class CI(Production):
    
    SQLALCHEMY_ECHO = False
    DEBUG = True

    DB_DRIVER = 'mysql+pymysql'
    DB_USERNAME = 'ci'
    DB_HOST = '127.0.0.1'
    DB_PASSWORD = None
    DB_DATABASE = 'CI_%s' % Development.DB_BASE


def get_config():
    """
    Choose a configuration class.
    Flask Boilerplate Utils will choose one depending on 
    your Environment Variables. 

    Set FLASK_CONFIG=<CLASS NAME> in your bash/zsh profile
    
    export 'FLASK_CONFIG=<CLASS NAME>' >> ~/.bashrc
    export 'FLASK_CONFIG=<CLASS NAME>' >> ~/.zshrc

    Alternatively, invoke the application using the 
    --config or -c argument and supply a class.

    You can also override this function.
    """
    from flask_boilerplate_buildutils.configuration import choose_config
    return choose_config(config_module=sys.modules[__name__])