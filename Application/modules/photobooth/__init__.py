from flask_boilerplate_utils.overrides import NestableBlueprint
from flask.ext import menu

photobooth = NestableBlueprint('photobooth', __name__, template_folder="templates", 
    static_folder="static",static_url_path='/resources')

from .controllers.Index import Index
Index.register(photobooth)
menu.register_flaskview(photobooth, Index)