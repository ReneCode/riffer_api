
module.exports = function() {

	var express = require('express');
	var wagner = require('wagner-core');
	var cors = require('cors');

	// initialize the 'Config' service
	require('./config.js')(wagner);

	require('./schema/models.js')(wagner);

	var app = express();

	app.use(cors());

	app.use('/api/v1', require('./api.js')(wagner));

	app.use('/', function(req, res, next) {
 		res.send("Welcome to riffer. This is the API layer.");
	});


	return app;
};

