import sys
from .__init__ import get_config

if __name__ == '__main__':
    if '-k' in sys.argv:
        print(getattr(get_config(), sys.argv[sys.argv.index('-k') +1]))
    else:
        print(get_config().__name__)
