from Application import app
from flask import render_template
from flask.ext.classy import FlaskView, route


class ClassyViewExample(FlaskView):
    route_base = '/classy-view/'

    def index(self):
        return render_template('index.html')

    # Go to /classy-view/blah/
    def get(self, url_data):
        return render_template('index.html', content=url_data)

    # Go to /classy-view/custom-route/
    # Route will also take parameters similar to how flask does it
    # ie you can do <int:urlthing>
    @route('/custom-route/')
    def custom_route(self):
        return render_template('index.html', content="Custom Route!")


ClassyViewExample.register(app)
