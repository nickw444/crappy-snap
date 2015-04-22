from Application import app
from flask import render_template, flash
from flask.ext.classy import FlaskView, route
from flask_wtf import Form
from wtforms import (
    TextField,
    validators,
    IntegerField,
    PasswordField,
    SubmitField,
    BooleanField,
    FileField
)
from Application.lib.uploads import main_uploads
from flask_boilerplate_utils.forms import ValidFileFormat

import os

class UploadsView(FlaskView):
    route_base = '/uploads/'

    @route('/', methods=['GET','POST'])
    def index(self):
        form = FileUploadForm()
        if form.validate_on_submit():
            filename = main_uploads.save(form.file_upload.data)
            flash("Uploaded %s" % (filename), 'success')


        # Spit out all the pre-existing uploaded images
        if not os.path.exists(main_uploads._config.destination):
            os.makedirs(main_uploads._config.destination)

        image_urls = map(main_uploads.url, os.listdir(main_uploads._config.destination))

        return render_template('/uploads_view/index.html', 
            form=form, 
            image_urls=image_urls)

UploadsView.register(app)



class FileUploadForm(Form):
    submit = SubmitField('Submit', [validators.Optional()])
    file_upload = FileField('Uploadable File', [
            validators.Required(), 
            ValidFileFormat(main_uploads) # Ensure the filetype is what is defined.
        ])