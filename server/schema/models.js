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


	// -------------------------------------------


	// -------------------------------------------
	var userSchema = new mongoose.Schema({
		userid:  {
			type: Number,
			required: true
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

/*
	userSchema.pre('save', function(next) {
		console.log('AAAAA');
		this.name = "xyz";
		var user = this;
		counterSchema.findIdAndUpdate({_id:'userId'}, {$inc:{$seq:1}}, function(err, counter) {
			if (err) {
				return next(err);
			}
			console.log("x:", counter.seq);
			user.userid = counter.seq;
			next(); 
		});
	});
*/

//	var counterSchema = ;
	var Counter = mongoose.model('Counter', require('./counter.js')(), 'counter');
	var User = mongoose.model('User', require('./user.js')(Counter), 'user');
	var Riff = mongoose.model('Message', require('./riff.js'), 'riff');


/*
	User.pre('save', function(next) {
		console.log('AAAAA');
		this.name = "xyz";
		var user = this;
		Counter.findIdAndUpdate({_id:'userId'}, {$inc:{$seq:1}}, function(err, counter) {
			if (err) {
				return next(err);
			}
			console.log("x:", counter.seq);
			user.userid = counter.seq;
			next(); 
		});
	});
*/

//	console.log("create new counter");
//	var cnt = new Counter({_id:'userId'});
//	cnt.save();


	var models = {
		Counter: Counter,
		User: User,
		Riff: Riff,
	};

	// register models
	_.each(models, function(value, key) {
		wagner.factory(key, function() {
			return value;
		});
	});
}

