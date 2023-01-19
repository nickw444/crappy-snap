import os
import subprocess
import time
from os import path

from flask import (Blueprint, render_template, request, current_app, abort,
                   send_file, jsonify, url_for)

bp = Blueprint(__name__, 'routes')


@bp.route('/')
def index():
    return render_template('index.html')


@bp.route('/capture')
def capture():
    captures_path = current_app.config['CAPTURES_PATH']
    filename = '1547852765.jpg'
    filename = "{}.jpg".format(int(time.time()))
    output_path = path.join(captures_path, filename)
    
    subprocess.call(
        ['killall', '-9', 'PTPCamera'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL)
    p = subprocess.Popen([
        'gphoto2',
        '--capture-image-and-download',
        '--filename=' + output_path
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = p.communicate()
    if p.returncode != 0:
        raise RuntimeError(
            'Cannot capture image: {}'.format(stderr.decode('utf-8')))
    
    if not os.path.exists(output_path):
        raise RuntimeError('Output file does not exist. No capture occurred')

    return jsonify({
        'filename': filename,
        'preview': url_for('.get_capture', filename=filename)
    })


@bp.route('/delete')
def delete():
    captures_path = current_app.config['CAPTURES_PATH']
    filename = request.args.get('i')
    if filename:
        os.remove(path.join(captures_path, filename))
        return 'OK'

    # Bad request - file doesn't exist.
    abort(400)


@bp.route('/captures/<path:filename>')
def get_capture(filename):
    captures_path = current_app.config['CAPTURES_PATH']
    image_path = path.join(captures_path, filename)
    return send_file(image_path)
