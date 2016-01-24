var mongoose = require('mongoose');

module.exports = (function() {
	var riffSchema = new mongoose.Schema({
		userid:  {
			type: String,
			required: true
		},
		date: { 
			type: Date,
			default: new Date() 
		},
		data: {}
	});
	return riffSchema;
})();



