from Application import app, db
from models import User
from flask import render_template
from flask.ext.classy import FlaskView, route

from flask_wtf import Form
from wtforms import (
    TextField,
    validators,
    IntegerField,
    PasswordField,
    SubmitField,
    BooleanField
)

from wtforms.ext.sqlalchemy.orm import model_form
from flask_boilerplate_utils.forms import Unique

class SampleForm(FlaskView):
    route_base = '/form/'

    @route('/standard-form/', methods=['GET','POST'])
    def index(self):
        form = BackupSettingsForm()
        if form.validate_on_submit():
            print("Form Validated")

        return render_template('sample_form/form.html', form=form)

    @route('/model-form/', methods=['GET','POST'])
    def model_form(self):
        form = UserForm(obj=User.query.first())

        if form.validate_on_submit():
            print("Form Validated")

        return render_template('sample_form/model_form.html', form=form)

SampleForm.register(app)


class BackupSettingsForm(Form):
    number_field = IntegerField('Number', [validators.Required()])
    text = TextField('Text Field', [validators.Required(), Unique(model=User, field=User.email)])
    password = PasswordField('Password', [validators.Optional()])
    submit = SubmitField('Submit', [validators.Optional()])
    toggle = BooleanField('Toggle', [validators.Optional()])

UserForm = model_form(User, db_session=db.session, base_class=Form, field_args={
})
# Override the password field to set it's type manually.
UserForm.password = PasswordField('Password')
