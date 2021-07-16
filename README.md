# coolHttpd
Simple local http file server when you need multiple fake domains from your dev machine

# What?
this is a simple http file server for local machine dev. It uses the fact that a
browser	will send a host name with its request headers (even if the domain doesn't
exist/resolve on the net), and a little trickery with local hostname/ip mapping
to let you run multpiple fake domains on your local dev machine. It also has a
few cool features:
* can handle multiple domains
* colored log output to easily see whats going on
* live reload when you make changes to your config
* nice shutdown that doesnt leave sockets open

# Why?
Consider the following: you write SPA's that need localStorage to store data. How 
many times have you had to clear localStorage on localhost when you have multiple projects storing
different data sets into localstorage? Only 5	megabytes or so to play with there, that can run out quick. 

Or how about that REALLY annoying CORS security thing where you can't getImageData
from an image loaded via file:// even when the html itself was also loaded from file://
protocol? 

Maybe (if you're like me) you have quite a few local projects and you'd like to 
see them all work as if they were running from a real domain name.

Ya. you need this ;)

# Beam me up scotty!
Obviously: node JS

All you need is index.js...no dependencies here.

set up host names mapped to 127.0.0.1 in your etc/hosts file. [How to edit your hosts file](https://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/)

create a config.json and add mimetypes, domains, base path, port, etc
```json
{
  "host": "127.0.0.1",
  "port": "80",
  "basepath": "c:\\www",
  "domains": {
    "dev.com": "dev"
  },
  "mimeTypes": {
    ".html": "text/html",
    ".png": "image/png",
    ".js": "text/javascript",
    ".css": "text/css"
  },
  "four0four": "404 page text"
}
```

Im hoping you keep your web projects under a common folder. This folder that holds all your projects will act as the basepath in the config, with the domains working on
folders off this basepath. For example, say c:\www is where you keep all your web projects. Say you have 3 projects in folders like: dev, game, todo. Lets say you want dev.com to point to c:\www\dev, game.com -> c:\www\game, and todo.com -> c:\www\todo

your config would look like this:
```json
  "basepath": "c:\\www",
  "domains": {
    "dev.com": "dev",
    "game.com": "game",
    "todo.com": "todo"
  }
```

if config.json is not present, the server will use the following defaults:
*	host: 127.0.0.1
*	port: 8000
*	basepath: c:\www
*	domains: { dev.com: dev } (c:\www\dev will be the root for dev.com)
*	a few basic mimetypes
*	four0four: 'oops' (404 error page text)

GET / will remap to index.html

four0four is literally just a text string that would be the html for a 404 error page. Obviously edit for your needs.

to run, just do:
```
node index.js
```

The server supports live changes to config.json and will restart automatically when changes are detected.
Laziness is the Mother of all Invention (TM) ;)

# Other things?
For now...this is what I needed for my situation. 
Might be cool to do other things, like handling REST api's, POST data handling, etc. Those are for a future coding session. Im not trying to rewrite Apache here ;)
And its a good coding exercise for nodeJS. I learned quite a bit wrangling with http, fs watch and promises. And just for funsies, ansi styling on the command line log output

things todo:
* routing. would be nice to do post, ajax, etc. not sure how to approach that yet. Ill get back to you on that ;) 
