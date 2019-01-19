import logging

from flask import Flask

from .routes import bp as routes_bp

_LOGGER = logging.getLogger(__name__)


def create_app(config):
    _LOGGER.info('Creating app with captures path: %s',
                 config['CAPTURES_PATH'])
    app = Flask(__name__)
    app.config.update(config)
    app.register_blueprint(routes_bp)
    return app
