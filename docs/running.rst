Running & Usage
==================================================


About run.py
##################################################

This is the supplied runfile for the app. It makes use of the ``flask-boilerplate-utils.commands`` package to provide abstracted application execution.

.. literalinclude:: ../run.py
    :language: python


Usage
**************************

**usage ./app run [-?] {server,import,meinheld,install}**

*positional arguments:*

    :server:              Run the Flask Builtin Server (Not for production)
    :meinheld:            Run a Web Server for Hosting using meinheld.
    :install:             Install a CSS/JS package listed on bower OR A package
                        from a github repository


Extending
**************************

MainManager returns a flask-script manager object. You can override this and write your own flask-script commands.

If you wish to not override the entire manager, you can just make new BaseCommands:

After the ``manager=`` line, add your new classes:

.. code-block:: python

    from flask_boilerplate_utils.commands import BaseCommand
    from flask.ext.script import Option

    Class MyNewCommand(BaseCommand):
        option_list = (
            Option('--hostname', '-h', dest='hostname', default='0.0.0.0', type=str),
        ) + BaseCommand.option_list

        def run(self, hostname):
            # don't do anything fancy, just print the given hostname
            print(hostname)

    manager.add_command('commandname', MyNewCommand(app))

Upgrading Local Requirements
##################################################

If you update your requirements.txt files within the ``req`` folder, you will need to execute a macro to update your local virtual environment.

.. code-block:: bash

    upgrade

This will update your local requirements for the project.

Testing
##################################################

By invoking ``python3 run.py test``, all tests in the ApplicationTests folder
will be executed. 

For finer control, you can execute ``python3 -m unittest ApplicationTests`` which allows arguments to be passed.

For more details about tests, see :doc:`writing_tests`

