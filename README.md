# Crappy Snap (v2) 📸 📸

Ever wanted a photo booth at your event? Well now you can. Get a webcam + a gphoto compatible DSLR ready and you're good to go.

## How it works
A web interface renders your webcam using HTML5 tech. A user can click the snap button or press any key, which invokes a request to the backend web server. This triggers the DSLR. The DSLR image is saved into the static dir of the app and is served back to the client. The client displays this image and the user is given the choice to delete it or continue. 

## Is it stable?
It worked all night at my 20th? So yes maybe...
 
## Requirements
- gphoto2

## Installing

You'll need some Python 3 goodness. It's based on Flask. (Ported from a PHP app by @tiggy).

### Install Gphoto
**OSX**
```sh
brew install gphoto2
```

**Linux**

```sh
sudo apt-get install gphoto2
```

### Install & run Crappy Snap

```sh
pipenv install
pipenv run python run.py
```
