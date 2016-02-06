

var bodyparser = require('body-parser');
var express = require('express');


/*
	REST interface

	POST  	create a new riff
	GET     get all/some riffs (with filter)
	PUT     update a riff
	DEL     delete (remove) a riff
*/

module.exports = function(wagner) {
	var api = express.Router();
	api.use(bodyparser.json());

	// get single riff
	api.get('/riff/:id', wagner.invoke( function(Riff) {
		return function(req, res) {
			Riff.findOne({_id:req.params.id}, function(err, data) {
				res.json(data);
			});
		};
	}));

 	// create a riff
 	api.post('/riff', wagner.invoke(function(Riff) {
		return function(req, res) {
			var p = req.body;
			Riff.create(p, function(err, data) {
				if (err) {
					res.send(err);
				} else {
					res.send(data);
				}
			});

		};
	}));

	// query riffs - get multiple riffs
	// parameter:
	//		skip
	//		limit
	//		newerthan
 	api.get('/riff', wagner.invoke(function(Riff) {
 		return function(req, res) {
 			var skip = req.query.skip || 0;
 			var limit = req.query.limit || 50;
 			var newerthan = req.query.newerthan;
 			var filter = {};
 			if (newerthan) {
 				filter = { date: {$gt: newerthan}}
 			}
 			Riff.find(filter).sort('-date').skip(skip).limit(limit).exec(function(err, data) {
 				res.json(data.reverse());
 			});
 		};
 	}));

	return api;
};



