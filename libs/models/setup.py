import os
from setuptools import setup

readme_path = os.path.join(os.path.dirname(
  os.path.abspath(__file__)),
  'README.rst',
)
long_description = open(readme_path).read()
version_path = os.path.join(os.path.dirname(
  os.path.abspath(__file__)),
  'VERSION',
)
version = open(version_path).read()



setup(
  name='models',
  version=version,
  packages=['models'],
  long_description=long_description,
  include_package_data=True,
  zip_safe=False,
  install_requires=[
    'sqlalchemy',
    'flask-security'
  ],
)
