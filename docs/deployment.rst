Deployment
==================================================

Deployment Using Supervisor
***************************************

Debian, Ubuntu and Similar
#######################################

#. Install Supervisor, Python3.4, Postgresql and Git (Only do this for the first time you deploy on the server)
    
    .. code-block:: bash
        
        sudo apt-get update
        sudo apt-get install python3 python3-dev python3-setuptools git postgresql libpq-dev nginx
        sudo apt-get install supervisor
        sudo service supervisor restart
        sudo easy_install3 pip
        sudo pip3 install flask-boilerplate-buildutils

#. Setup a Deployment Folder, User Account, Nginx and Supervisor.
    
    .. code-block:: bash
        sudo useradd -d /deploy/ -m -s /bin/bash -U deploy
        sudo chown deploy:root /etc/supervisor/conf.d
        sudo chmod 774 /etc/supervisor/conf.d
        sudo rm /etc/nginx/sites-enabled/default
        sudo chown deploy:root /etc/nginx/sites-enabled
        sudo chmod 774 /etc/nginx/sites-enabled
        sudo su deploy
        echo "export FLASK_CONFIG=Production" >> ~/.bashrc
        cd ~/
        mkdir logs
        mkdir appliance

#. Copy your project to the server.

**Option 1:** Configure a git deploy key for the server
    
    This option will take a bit of extra configuration, but will let you simply
    perform a git pull every time you want to upgrade to a new release. You could
    even setup a web hook to automatically do this when a commit is pushed to a
    specific branch

    Generate a deploy key:

    .. code-block:: bash
        ssh-keygen -f ~/.ssh/id_rsa -N "";
        cat ~/.ssh/id_rsa.pub

    Go to your project settings on github, and find the menu option "Deploy Keys"
    Add this above printed key to the deploy keys for your project.

    At this stage you should be ready to clone your project.

    .. code-block:: bash

        cd ~/appliance/
        git clone <ssh git clone url> com.mycompany.myapp

    Your repository should now be cloned to the folder ``com.mycompany.myapp``. 
    Obviously you should give this a useful name. Keeping reverse fqdn notation
    neatens things up down the line.

**Option 2:** (Easier) Upload project to the server

    Easier to begin with, but a pain to manage. Simply upload your project
    directory to ``/deploy/appliance/com.mycompany.myapp/``

    Your project should now be in the folder ``com.mycompany.myapp``. 
    Obviously you should give this a useful name. Keeping reverse fqdn notation
    neatens things up down the line.


#. Make sure it all works normally
    
    Since the server is running a minimal installation, it does not have autoenv. 
    (You could install it if you found it convenient). However, for now, you can
    manually invoke autoenv scripts.

    Warning; Magic:

    .. code-block:: bash
        
        source .env

    This will install all of your defined libraries. If you ever feel the 
    requirement to update the libraries defined in your project's requirements,
    simply run ``upgrade`` from the command line.

    .. code-block:: bash

        python3.4 run.py meinheld

    If you're having trouble, try running it in debug:
    
    .. code-block:: bash

        python3.4 run.py server

    Once you're satisfied it's working, we'll continue and get this starting
    up automatically.



#. Configure Supervisor

    I have included sample supervisord scripts with the boilerplate repository.
    Feel free to use these as they compliment this tutorial.

    You will need to edit ``Deploy/supervisor.conf`` to reflect the name you
    give the project/folder.

    .. code-block:: bash
        
        ln -s /deploy/appliance/com.mycompany.myapp/Deploy/supervisor.conf /etc/supervisor/conf.d/com.mycompany.myapp.conf

    Return to a super user on the system

    .. code-block:: bash

        exit; #exit to a superuser.
        whoami  # (Make sure this is root or someone with sudo)

        sudo supervisorctl reload
        sudo supervisorctl 

    From supervisor you can now check the status of your application. With any
    luck it should be running!



#. Configure Nginx for Superior Static.
    
    Routing /static/ through flask is considered a waste, and can slow down
    resources on your webapp like css files and javascript.

    By routing it through nginx we can pull it straight from the disk and
    send it to the client without Flask as the middle man.

    You will need to edit ``Deploy/nginx.conf`` to reflect the name you
    give the project/folder.

    .. code-block:: bash
        sudo su deploy # Return to the deploy user.

        ln -s /deploy/appliance/com.mycompany.myapp/Deploy/nginx.conf /etc/nginx/sites-enabled/com.mycompany.myapp.conf


    Return to a super user on the system

    .. code-block:: bash

        exit; #exit to a superuser
        whoami  # (Make sure this is root or someone with sudo)

        sudo nginx -t #Test the nginx configuration.
        sudo service nginx restart

    Nginx will now route requests on port 80 (Standard web port) to flask running 
    on 127.0.0.1:8000.

#. You're done!

    Congrats, you're now up and running. If you are using supervisor and nginx, 
    when you make changes to your ``Deploy/*`` config files, they will be automatically
    updated. It is just a matter of reloading nginx and supervisor.
