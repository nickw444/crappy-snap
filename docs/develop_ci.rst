Continuous Integration
==================================================

Want to run this on your CI Server? By default the MySQL driver is selected for CI. 

**Setup MySQL on your CI Server**

Open a MYSQL console using a user that has root privileges

.. code-block:: mysql

    mysql -u<user> -p<your_password>

    -- Create the user account 
    CREATE USER 'ci'@'localhost'; 
    -- Grant Privs for the ci account 
    GRANT ALL PRIVILEGES ON `ci%`.* TO 'ci'@'localhost'; 
    -- Exit Mysql 
    EXIT;

**Add a CI Build Script** on your CI Server:

.. code-block:: bash
    
    export FLASK_CONFIG=CI &&
    source .env &&
    python3 run.py test