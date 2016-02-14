
var expect = require('expect');

var app = require('../server');
var wagner = require('wagner-core');


describe('Mongoose', function() {
	var server;
	var UserModel;
	var CounterModel;

	before(function(done) {
		server = app().listen(3010);
		UserModel = wagner.invoke(function(User) {
			return User;
		});


		CounterModel = wagner.invoke(function(Counter) {
			return Counter;
		});
		done();
	});

	after(function() {
		server.close();
	});

	beforeEach(function(done) {
		CounterModel.remove({}, function() {
			UserModel.remove({}, function() {
				done();
			});
		});
	});


	it ('counter is working', function(done) {
		var counter = new CounterModel({_id:'abc'});
		counter.save();
		expect(counter.seq).toBe(1);
		CounterModel.findOne({_id:'abc'}, function(err, result) {
			expect(err).toBe(null);
			expect(result._id).toBe('abc');
			expect(result.seq).toBe(1);
			done();
		});
	});


	it ('counter increment', function(done) {
		// create first record
		CounterModel.findByIdAndUpdate({_id:'userId'}, {$inc:{seq:1}}, {new: true, upsert: true}, function(err, cnt) {
			expect(err).toBe(null);
			expect(cnt.seq).toBe(1);
			// create second record
			var first = new CounterModel({_id:'userId'});
			var seq = 1;
			first.save();

			CounterModel.findByIdAndUpdate({_id:'userId'}, {$inc:{seq:1}}, {new: true, upsert:true}, function(err, cnt2) {
				expect(err).toBe(null);
				expect(cnt2.seq).toBe(2);
				done();
			});
		});	
	});

	it('user can be created and get the userid:1', function(done) {
		UserModel.create({name:'hallo'}, function(err, user) {
			expect(err).toBe(null);
			expect(user.name).toBe('hallo');
			UserModel.findOne({name:'hallo'}, function(err, result) {
				expect(err).toBe(null);
				expect(result).toBeA('object');
				expect(result.name).toBe('hallo');
				expect(result.userid).toBe(1);
				done();
			});
		});
	});

	it ('user can be created twice, second user gets userid:2', function(done) {
		UserModel.create({name:'hallo'}, function(err, u1) {
			expect(u1.name).toBe('hallo');
			UserModel.create({name:'paula'}, function(err, u2) {
				expect(u2.name).toBe('paula');
				expect(u2.userid).toBe(2);
				done();
			});
		});
	});



});
