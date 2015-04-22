#!./.venv/bin/python3

from Application import app
from flask_boilerplate_utils.commands import MainManager
import ApplicationTests

manager = MainManager(app,
    with_default_commands=False, 
    tests_module=ApplicationTests)

if __name__ == "__main__":
    manager.run(default_command="server")

