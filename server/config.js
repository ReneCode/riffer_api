

module.exports = function(wagner) {

	var config = require('../config/config.json');

	wagner.factory('config', function() {
		return config;
	});

};


