Flask Boilerplate
================================================

|build status|

.. |build status| image:: http://ci.nickwhyte.com/projects/2/status.png?ref=master
   :target: http://ci.nickwhyte.com/projects/2?ref=master

Get started with flask MVC in 30 minutes. This boilerplate skeleton includes everything to get you up and running with flask. The collection of packages bundled with this boilerplate represents a selection of packages I have found extremely helpful when getting an app up and running as quick as possible.

This skeleton is part of the flask-boilerplate project.

- `flask-boilerplate <https://github.com/nickw444/Flask-Boilerplate>`_
- `flask-boilerplate-buildutils <https://github.com/nickw444/flask-boilerplate-buildutils>`_
- `flask-boilerplate-utils <https://github.com/nickw444/flask-boilerplate-utils>`_

Features
*******************
- Promotes the use of `virtual environments <http://docs.python-guide.org/en/latest/dev/virtualenvs/>`_ through `autoenv <https://github.com/kennethreitz/autoenv>`_. 

- Abstracted boilerplate utilities in `flask-boilerplate-buildutils <http://flask-boilerplate-buildutils.readthedocs.org/en/latest/>`_ and `flask-boilerplate-utils <http://flask-boilerplate-utils.readthedocs.org/en/latest/>`_  - you can always upgrade to the latest and greatest without restructuring your skeleton.
- Instantly ready for deployment. Never mess around with gunicorn again. See :doc:`deployment` for more details on how to deploy using supervisor and nginx.
- Abstracted models module, using raw SQLAlchemy (which are then imported to flask-sqlalchemy). Prevents circular imports and allows you to share the models with non flask apps, such as a web sockets server.
- Abstracted config module, share the configuration between multiple python apps. 
- Many additional helper decorators and functions included in flask-boilerplate-utils. 


Full Documentation 
*******************************************************

Full usage available at `read the docs <http://flask-boilerplate.readthedocs.org/en/latest/>`_

Additional feature docs for flask-boilerplate-utils available at `read the docs <http://flask-boilerplate-utils.readthedocs.org/en/latest/>`_


What's Included
*******************

Everything to get you up and running with flask. Take a peek inside the
``Application/requirements.txt`` file to get an idea of what’s included.

:flask-restful:         for an extensive API
:flask-security:        for login management
:sqlalchemy:      for an ORM (Got to save the data somewhere)
:flask-classy:          for Views (MVC)
:flask-uploads:         for making your life easier with file uploads.
:flask-babel:           for easier translations and easy localisation (Timezones are hard)
:flask-wtforms:         for easy user input
:Meinheld:   for hosting on production in a single click


Prerequisites
*********************************
- You have Python 3.4 or greater installed
- You have pip3 linked to your Python 3.4 Installation
