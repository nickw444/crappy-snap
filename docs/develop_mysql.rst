Develop Using MySQL
==================================================

So, you’re sick of sqlite? No worries! 

**This guide assume you already have an existing MySQL backend installed. **

Open a MYSQL console using a user that has root privileges

.. code-block:: mysql

    mysql -u <USER> -p<PASSWORD>

    -- Create the user account 
    CREATE USER 'dev'@'localhost'; 
    -- Grant Privs for the dev account 
    GRANT ALL PRIVILEGES ON `dev%`.* TO 'dev'@'localhost'; 
    -- Exit Mysql 
    EXIT;

Set Environment Variable for MYSQL Development (The Dev Environment uses this to
determine what you want to run)

.. code-block:: bash

    echo "export FLASK_CONFIG=MySQLStd" >> ~/.bashrc 
    echo "export FLASK_CONFIG=MySQLStd" >> ~/.zshrc

Close your terminal, and re-open. You need to reload the environment variables.

The app will now execute in mysql development mode.