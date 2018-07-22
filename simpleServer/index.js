/**
* main file for node.js to running a server.
* it is planned thtat the server is for a shop system with a user management.
* Users take something in the cart and buy it.
*
* @author bringItUpX
* @date 2018-07-22
*/

//Dependencies
var http = require('http');
var https = require('https');
var url  = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var fs = require('fs');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');

var httpServer = http.createServer(function(req, ret) {
	unifiedServer(req, ret);
})

httpServer.listen(3000, function(){
	console.log(' http server has started to listing on port 3000');
})

// the same for https server
// Instantiate the HTTPS server
var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions,function(req,ret){
  unifiedServer(req,ret);
});

// Start the HTTPS server
httpsServer.listen(3001,function(){
 console.log('The https server is listening on port ' + 3001);
});

var unifiedServer = function(req, ret) {

	// get url
	var parsedUrl = url.parse(req.url, true);
	// get path
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');
	console.log('received a request with path: ' + path);
	// get the http method
	var method = req.method.toLowerCase();
	// get the query
	var queryStringObject = parsedUrl.query;
	// get headers (use postman plugin for safari)
	var headers = req.headers;

	// receive payload
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
req.on('data', function (data){
	buffer += decoder.write(data);
})

req.on('end', function (){
	buffer += decoder.end();
	var data = {
		'method': method,
		'query' : queryStringObject,
		'path'  : trimmedPath,
		'headers' : headers,
		'payload' : helpers.parseJsonToObject(buffer)
	};

	var chooseHandler = typeof(router[trimmedPath]) == 'undefined' ? handlers.notFound : router[trimmedPath];
	console.log('received a request with trimmedPath: ' + trimmedPath);
	console.log('method is: ', data.method);
	console.log('payload is: ', data.payload);
	console.log('query is: ', data.query);
	chooseHandler(data, function(statusCode, data) {
		statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
		data = typeof(data) == 'object' ? data : {};

		// send response
		ret.setHeader('Content-Type', 'application/json');
		ret.writeHead(statusCode);
		ret.end(JSON.stringify(data));
		// log the send message
		console.log('statusCode: ' + statusCode + ' answer: ' + JSON.stringify(data));
	})
})
}

// the router from path to the right handler
var router = {
	"hello" : handlers.hello,
	"users" : handlers.users
};