import logging
from os import path

from crappy_snap import create_app

_LOGGER = logging.getLogger(__name__)


def main():
    logging.basicConfig()
    logging.getLogger('crappy_snap').setLevel(logging.INFO)

    captures_path = path.abspath('./captures')
    app = create_app({'CAPTURES_PATH': captures_path})
    app.run(debug=True)


if __name__ == '__main__':
    main()
