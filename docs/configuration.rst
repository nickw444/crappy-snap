Configuration
==================================================

The boilerplate comes with some configuration already set.  Visit the ``./libs/config/config/__init__.py`` file to see what the skeleton has to offer.

Included are classes: 

    - Production
    - Development
    - MySQLStd
    - CI

You can override or subclass these provided classes.

How does config get chosen?
#########################################

The ``get_config()`` function returns a class for the desired configuration. By default, flask-boilerplate-buildutils handles this. You can override this behaviour by changing the function.

**Default Behavior**

Flask Boilerplate Build Utils will first check the command line arguments for ``'-c CONFIGNAME'`` or ``'--config CONFIGNAME'`` and use the config name from there. If no '-c' flag is set, it will check the environment to determine if you have the ``"FLASK_CONFIG"`` environment variable set. If it is set, it will set the config class string to the value of this variable. 

Once we have a config class name, the module looks up the class, and returns it as a Class, ready for usage around the app. 





