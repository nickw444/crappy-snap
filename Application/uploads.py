import flask.ext.uploads as uploads

# Use lowercase only.
allowed = ('tiff',) + uploads.IMAGES
main_uploads_config = uploads.UploadConfiguration('./Application/static/uploads/',
                                 base_url='/static/uploads/',
                                 allow=allowed,
                                 deny=())
main_uploads = uploads.UploadSet('mainuploads', allowed)
main_uploads._config = main_uploads_config

def setup_uploads(app):
    with app.app_context():
        uploads.patch_request_class(app, 32 * 1024 * 1024)