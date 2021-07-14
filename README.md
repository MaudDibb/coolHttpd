# coolHttpd
Simple file server when you need multiple fake domains from your dev machine

# what?
this is a simple http file server for local machine dev. It uses the fact that a
browser	will send a host name with its request headers (even if the domain doesn't
exist/resolve on the net), and a little trickery with local hostname/ip mapping
to let you run multpiple fake domains on your local dev machine

# why?
Consider you write SPA's that need localStorage to store data. How many times have 
you had to clear localStorage for localhost when you have	multiple projects storing
different data sets into localstorage? Only 5	megabytes or so to play with there. 
Or how about that REALLY annoying CORS security thing where you cant getImageData
from an image loaded via file:// even when the html itself was also loaded from file://
protocol? Maybe (like me) you have quite a few local projects and you'd like to 
see them all work as if they were running from a real domain name.

Ya. you need this ;)

# beam me up scotty!
Obviously...nodeJS

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
  }
}
```

if config.json is not present, the server will use the following defaults:
*		host: 127.0.0.1
*		port: 8000
*		basepath: c:\www
*		domains: { dev.com: dev } (c:\www\dev will be the root for dev.com)
*		a few basic mimetypes
*		four0four: 'oops' (404 error page text)

GET / will remap to index.html

to run, just do:
```
node index.js
```

The server supports live changes to config.json and will restart automatically when changes are detected.
Laziness is the Mother of all Invention (TM) ;)

# other things?
For now...this is what I needed for my situation. 
Might be cool to do other things, like handling REST api's, POST data handling, etc. Those are for a future coding session. Im not trying to rewrite Apache here ;)
