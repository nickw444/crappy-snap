.. Flask Boilerplate documentation master file, created by
   sphinx-quickstart on Wed Dec 24 00:04:11 2014.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

.. include:: ../README.rst

Getting Started
******************************************

1. Get the skeleton project
##########################################

**Using Git**

Open a bash/zsh console.

.. code-block:: bash
    
    mkdir -p ~/projects/my_new_project/
    cd ~/projects/my_new_project/
    git clone -b release git@github.com:nickw444/Flask-Boilerplate.git .
    rm -rf .git

You will probably wish to change where you install the project to by changing
the path given to mkdir and cd. 


**OR: Using your GUI**

Download the latest `tarball <https://github.com/user/repository/tarball/release/>`_ or 
`zipball <https://github.com/user/repository/zipball/zipball/>`_ from github and extract 
it where you want to start building your app.


Open a terminal session and execute:

.. code-block:: bash
    
    cd /path/to/expanded/folder



2. Install project dependencies
##########################################

Ensure you are cd'd into the directory of your project (You should be if you
followed the above steps correctly).

.. code-block:: bash
    
    sudo pip3 install flask-boilerplate-buildutils
    

    
3. Test it out
##########################################

.. code-block:: bash
    
    source .env
    python3 run.py

This will install the project's local dependencies to the virtual environment. 
``source .env`` activates the virtual environment and installs dependencies, and ``python3 run.py`` runs the actual program.

See :doc:`autoenv` for streamlining this process even more. See :doc:`env` for more info 
on what the ``.env`` file provides.


4. Developing with Flask-Boilerplate
##########################################
See the :doc:`development` to learn how to structure your project using the
boilerplate.

See the :doc:`configuration` to learn how to to correctly configure your project.


.. toctree::
   :maxdepth: 2
   :hidden:

   index
   running
   env
   autoenv
   configuration
   develop_mysql
   develop_ci
   development
   deployment
