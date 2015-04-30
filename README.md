# Crappy Snap!
Ever wanted a photo booth at your event? Well now you can. Get a webcam + a gphoto compatible DSLR ready and you're good to go.

## How it works
A web interface renders your webcam using HTML5 tech. A user can click the snap button or press any key, which invokes a request to the backend web server. This triggers the DSLR. The DSLR image is saved into the static dir of the app and is served back to the client. The client displays this image and the user is given the choice to delete it or continue. 

## Is it stable?
It worked all night at my 20th? So yes maybe...

## Setting it up
You'll need some Python 3.4 goodness. It's based on Flask. (Ported from a PHP app by @tiggy). It's based on the Flask-Boilerplate, so you just need to ensure you have pip installed on your machine and you should be good to go. 

**Requires Python 3 / Pip 3**

```
source .env
python run.py
```

### How can I make it work with my camera?
Easily - look in the file `/Application/modules/photobooth/controllers/Index.py` and edit the `def capture(self):` endpoint's camera shell interface.

Enjoy!
