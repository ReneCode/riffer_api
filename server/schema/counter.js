var mongoose = require('mongoose');


module.exports = function() {
	var counterSchema = new mongoose.Schema({
		_id: {
			type:String, 
			require: true
		},
		seq: {
			type: Number, 
			default: 1
		}
	});
	return counterSchema;
};



