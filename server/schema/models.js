var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function(wagner) {
	var connectUrl = 'mongodb://localhost:27017/riffer';

	var cfg = wagner.invoke(function(config) {
		return config;
	});

	if (cfg.mongodb.username) {
		connectUrl = 'mongodb://' + 
					cfg.mongodb.username + ":" + 
					cfg.mongodb.password + "@" +
					cfg.mongodb.hostname + ":" + 
					cfg.mongodb.portnum + "/riffer";
	}

	mongoose.connect(connectUrl);

	wagner.factory('db', function() {
		return mongoose;
	});

	var Riff = mongoose.model('Message', require('./riff.js'), 'riff');

	var models = {
		Riff: Riff
	};

	// register models
	_.each(models, function(value, key) {
		wagner.factory(key, function() {
			return value;
		});
	});
}

