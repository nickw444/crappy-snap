import unittest

from .FlaskTestClientProxy import FlaskTestClientProxy
import Application


class BaseTestCase(unittest.TestCase):
    def setUp(self):
        Application.app.wsgi_app = FlaskTestClientProxy(Application.app.wsgi_app)
        Application.app.config['TESTING'] = True
        Application.app.config['WTF_CSRF_ENABLED'] = False
        self.app = Application.app.test_client()
        self._app = Application.app

    def tearDown(self):
        pass

    def test_sample(self):
        response = self.app.get('/')
        assert '' in response.data.decode('UTF-8')
