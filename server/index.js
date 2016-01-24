/*
	API node-service
	provides a REST service
*/

var server = require('./server.js');

var app = server();
var http = require('http');
	
var port = 64020;
http.createServer(app).listen(port);

console.log('riffer REST Server is listing on Port:', port);

