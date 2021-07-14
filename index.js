/*
	simple  http  file server for  local machine dev.  It uses the fact that a
	browser	will send a host name with its request headers (even if the domain
	doesn't  exist / resolve on the net ),  and a little  trickery with  local 
	hostname / ip  mapping to let you run multpiple fake domains on your local 
	dev machine

	Why? consider you write SPA's that need localStorage to store data. How
	many times have you had to clear localStorage for localhost when you have
	multiple projects storing different data sets into localstorage? Only 5
	megabytes or so to play with there. Or how about that REALLY annoying CORS
	security thing where you cant getImageData from a project loaded via file:// 
	protocol? Ya. you need this ;)
	
	set up host names mapped to 127.0.0.1 in your etc/hosts file

	edit config.json and change mimetypes, domains, base path, port, etc	

	if config.json is not present, the server will use the following defaults:
		host: 127.0.0.1
		port: 8000
		basepath: c:\www
		domains: { dev.com: dev } (c:\www\dev will be the root for dev.com)
		a few basic mimetypes
		four0four: 'oops' (404 error page text)

	GET / will remap to index.html

	you can do changes to the config while the server is running. It will detect
	file changes to config.json and restart the server for you. Laziness is the 
	Mother of all Invention (TM) ;)
*/

const http = require('http');
const path = require('path');
const fs = require('fs').promises;
const fs2 = require('fs'); // need watch, which is not in fs/promises. The docs say it does. try it and see

let config = {};
let server = null;

const pathFromDomain = (p) => path.join(config.basepath,p);
const switchcase = (cases,defaultCase,fn=null) => key => 
	cases.hasOwnProperty(key) ?
		fn ? fn(cases[key]) : cases[key] :
		fn ? fn(defaultCase) : defaultCase;

const csi = (c1,c2,t) => `\u001b[${c1}m${t}\u001b[${c2}m`;
const ansi = {
	redI:	t => csi(91,39,t),
	red:    t => csi(31,39,t),
	greenI: t => csi(92,39,t),
	cyanI:  t => csi(96,39,t),
};

const reqLog = (host,url,method) => `${ansi.redI('[')}${ansi.red(host)}${ansi.redI(']')} ${ansi.greenI(url)} ${ansi.cyanI(method)}`;

const listener = function(req, res) {
	console.log(reqLog(req.headers.host,req.url,req.method));
	if (config.domains.hasOwnProperty(req.headers.host)) {
		let url = req.url;
		if (url == '/') url = 'index.html'; // Quality Of Life feature (TM)
		let p = path.join(config.domainPath(req.headers.host),url);
		fs.stat(p)
			.then(stats => {
				let size = stats.size;
				fs.readFile(p)
					.then(content => {
						res.setHeader('Content-Type', config.mimeType(path.extname(p)));
						res.setHeader('Content-Length',size);
						res.writeHead(200);
						res.end(content);
					})
					.catch(err => {
						// couldnt access file?
						res.writeHead(500);
						res.end('woops: ' + err.code);
					})
			})
			.catch(err => {
				// file doesnt exist
				res.writeHead(404);
				res.end(config.four0four);
			})
	} else {
		// unknown domain
		res.writeHead(404);
		res.end(config.four0four);
	}
}

const idGen = (id=1) => () => id++;
const nextID = idGen();
let connections = {};

// need a way to fully shutdown the server and any open connections it has.
function enableDestroy(server) {
	connections = {};
	server.on('connection', conn => {
		let key = nextID();
		connections[key] = conn;
		conn.on('close', () => {
			delete connections[key];
		})
	});

	server.destroy = cb => {
		server.close(cb);
		Object.keys(connections).forEach(key => {
			connections[key].destroy();
		});
	}
}

function startServer() {
	fs.readFile('config.json')
	.then(content => {
		config = JSON.parse(content);
	})
	.catch(err => {
		console.log(err);
		console.log('switching to default config');
		config = {
			host: '127.0.0.1',
			port: 8000,
			mimeTypes: {
				'.bmp': 'image/bmp',
				'.css': 'text/css',
				'.gif': 'image/gif',
				'.htm': 'text/html',
				'.html': 'text/html',
				'.jpeg': 'image/jpeg',
				'.jpg': 'image/jpeg',
				'.js': 'text/javascript',
				'.json': 'text/json',
				'.png': 'image/png',
				'.svg': 'image/svg+xml',
				'.xml': 'text/xml',
				'.zip': 'application/zip',			
			},
			four0four: `oops`,
			basepath: 'c:\\www',
			domains: { 'dev.com': 'dev'}
		};
	})
	.finally(()=>{
		config.mimeType = switchcase(config.mimeTypes,'text/plain');
		config.domainPath = switchcase(config.domains,'.',pathFromDomain)
		server = http.createServer(listener);
		server.listen(config.port, config.host, () => { console.log(`server running on ${config.host}, port ${config.port}`); });
		enableDestroy(server);
	});
}

// now add a watch on config.json so we can shutdown and restart the server with new config
let fsWait = false;
fs2.watch('config.json', (event, filename) => {
	// debounce, watch will fire multiple change events when saving changes to a file
	if (fsWait) return;
	fsWait = setTimeout(() => {
		fsWait = false;
	}, 100);

	// give server time to properly shutdown before restarting
	server.destroy(()=>{
		fsWait = setTimeout(()=> {
			console.log('restarting server');
			startServer();
		},250);
	});
});

// we need the server to shutdown completely on exit
process.on('SIGINT', ()=>{
	console.log('shutting it down.');
	server.destroy(()=>{});
	process.exit(0);
})

startServer();