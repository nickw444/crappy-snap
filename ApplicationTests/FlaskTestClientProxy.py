class FlaskTestClientProxy(object):
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        environ['REMOTE_ADDR'] = environ.get('REMOTE_ADDR', '127.0.0.1')
        environ['HTTP_USER_AGENT'] = environ.get('HTTP_USER_AGENT', 'Chrome')
        return self.app(environ, start_response)