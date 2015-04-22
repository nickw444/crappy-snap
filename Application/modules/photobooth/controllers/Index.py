from flask.ext.classy import FlaskView, route
from flask import render_template, url_for, redirect
from flask.ext import menu

class Index(FlaskView):
    route_base = '/'

    def index(self):
        return render_template('photobooth/index.html', is_form=True)

    def capture(self):
        import subprocess
        import time
        filename = "{}.jpg".format(int(time.time()))

        subprocess.call(['killall', '-9', 'PTPCamera'])
        p = subprocess.Popen(['gphoto2', '--capture-image-and-download', '--filename=Application/static/captures/' + filename],  stdout=subprocess.PIPE)
        out, err = p.communicate()

        print(out.decode('UTF-8'))
        if out.decode('UTF-8') != '':
            return filename

        return ''

    @route('/delete')
    def delete(self):
        import os
        from flask import request

        filename = request.args.get('i')
        if filename:
            os.remove('Application/static/captures/{}'.format(filename))

        return ''