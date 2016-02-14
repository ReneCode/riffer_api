var mongoose = require('mongoose');


module.exports = function(counterModel) {
	var userSchema = new mongoose.Schema({
		userid:  {
			type: Number,
			required: true,
			default: 0
		},
		date: { 
			type: Date,
			default: new Date() 
		},
		name: {
			type: String,
			required: true
		}
	});

	userSchema.pre('save', function(next){
		var user = this;
		// upsert is important
		// that will create the first counter-document if there are no counter-documents
		counterModel.findByIdAndUpdate({_id:'userId'}, {$inc:{seq:1}}, {new: true, upsert: true}, function(err, cnt) {
			if (err) {
				next(err);
			}
			user.userid = cnt.seq;
			next();
		});
	});
/*
	userSchema.pre('save', function(next) {
		var user = this;
		console.log('>>>' + user.name);
		counterModel.findAndModify({
			query: {_id:'userId'}, 
			update: {$inc:{seq:1}}, 
			new:true, function(err, counter) {

		});
		console.log('>###>>' + user.name);
			if (err) {
				return next(err);
			}
			if (counter == null) {
				// no counter for userId found -> create it
				var first = new counterModel({_id:'userId'});
				first.save();
				user.userid = 1;
		console.log('AAAAA');
			}
			else {
				user.userid = counter.seq;
		console.log('BBBB');
			}
			next(); 	
		}); 
	});

*/
	return userSchema;
};



