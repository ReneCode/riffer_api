
var expect = require('expect');

var app = require('../server');
var wagner = require('wagner-core');
var superagent = require('superagent');

var URL_ROOT = 'http://localhost:3010';


describe('REST Server', function() {
	var server;
	var RiffModel;

	before(function(done) {
		server = app().listen(3010);
		RiffModel = wagner.invoke(function(Riff) {
			return Riff;
		});
		done();
	});

	beforeEach(function(done) {
		RiffModel.remove({}, function(err) {
			done();
		});
	});
	
	after(function() {
		server.close();
	});

	it('can be called', function(done) {
		var url = URL_ROOT + '/api/v1/riff';
		superagent.get(url, function(err, res) {
			expect(err).toBe(null);
			done();
		});
	});



	it('create riff / REST: POST', function(done) {
		var url = URL_ROOT + '/api/v1/riff';
		var riff = { userid: "a",
								 date: new Date(),
								 data: { x:4711 } };
		superagent.post(url)
							.send(riff)
							.end(function(err, res) {
			expect(err).toBe(null);  
			var id = res.body._id;
			expect(id).toBeA('string'); 
			expect(id.length).toBeGreaterThan(20); 
			expect(res.body.userid).toBe('a'); 
			expect(res.body.data).toEqual({x:4711});

			// find that created riff in the database
			RiffModel.findOne({_id:id}, function(err, result) {
				expect(result.userid, "a"); 
				done();
			});
		});
	});


	it('get one riff data', function(done) {
		// create riff
		var userid = "xy";
		var dt = new Date(2016,3,16,21,44,30);
		var riff = new RiffModel({userid:userid, date:dt, data:{note:2}});
		riff.save();
		// id of that riff   _id is a number, but later we use it as string
		var createdId = "" + riff._id;

		url = URL_ROOT + '/api/v1/riff/' + createdId;
		superagent.get(url, function(err, res) {
			var riff = res.body;
			var getDate = new Date(riff.date);
			expect(getDate).toEqual(dt);
			expect(riff.userid).toEqual(userid);
			expect(riff._id).toEqual(createdId);
			done();
		});
	});		

	it('get all riff data', function(done) {
		var p1 = { userid: 'a', date:new Date(2016,2,21), data:{len:44}};
		var p2 = { userid: 'b', date:new Date(2015,3,21), data:{len:55}};
		var p3 = { userid: 'c', date:new Date(2015,2,24), data:{len:66}};

		RiffModel.create([p1,p2,p3], function(err, newriffs) {

			var url = URL_ROOT + '/api/v1/riff';
			superagent.get(url, function(err, res) {
				expect(res.body.length).toBe(3); 
				var users = res.body.map(function(r) { return r.userid;} );
				expect(users).toEqual(['c','b', 'a']);
				done();
			});
			
		});
	});


	it('set default date', function(done) {
		var p1 = { userid: 'c', data:{len:66}};
		var dt = new Date();

		RiffModel.create(p1, function(err, riff) {
			var url = URL_ROOT + '/api/v1/riff';
			superagent.get(url, function(err, res) {
				expect(res.body.length).toBe(1); 
				var gotDate = new Date(res.body[0].date);
				expect(dt.getDay()).toBe(gotDate.getDay());
				expect(dt.getSeconds()).toBe(gotDate.getSeconds());
				done();
			});
			
		});
	});


	
	xit('get filted riff data / REST: GET', function(done) {
		var p1 = { riffnr: 'ab7-riff', manufacturer:'m13'};
		var p2 = { riffnr: 'ab59-riff', manufacturer:'m14'};
		var p3 = { riffnr: 'ab57-riff', manufacturer:'m24'};

		RiffModel.create([p1,p2,p3], function(err, newriffs) {
			// query on "b5"
			var url = URL_ROOT + '/api/v1/riff?q=b5';
			superagent.get(url, function(err, res) {
				assert.equal(res.body.data.length, 2); 
				assert.equal(res.body.data[0].riffnr, 'ab57-riff');
				assert.equal(res.body.data[1].manufacturer, 'm14');
				done();
			});
		});
	});
	

	xit('get case insensitive filted riff data / REST: GET', function(done) {
		var p1 = new RiffModel({ riffnr: 'ABcd-riff', note: { de_DE: 'great Motor'} });
		p1.save();
		// query on "moto"   should find "Motor"
		var search = "mot";
		var url = URL_ROOT + '/api/v1/riff?q=' + search;
		superagent.get(url, function(err, res) {
			assert.equal(res.body.data.length, 1); 
			assert.equal(res.body.data[0].riffnr, 'ABcd-riff');
			done();
		});
	});


	xit('get case insensitive filted riff data / REST: GET', function(done) {
		var p1 = { riffnr: 'mlriff', note: {de_DE:"Hallo", en_US:"hello"}, 
						description: [ 
								{de_DE:"MotorA", en_US:"de1"},
								{de_DE:"dd2", en_US:"de2"},
								{de_DE:"dd3", en_US:"de3"} ] };
		newriff = new RiffModel(p1);
		newriff.save();
		// query on "moto"   should find "Motor"
		var search = "mot";
		var url = URL_ROOT + '/api/v1/riff?q=' + search;
		superagent.get(url, function(err, res) {
			assert.equal(res.body.data.length, 1); 
			assert.equal(res.body.data[0].riffnr, 'mlriff');
			done();
		});
	});

	xit('filter by f-parameter', function(done) {
		var p1 = { riffnr: 'ab5-riff', manufacturer:'m13'};
		var p2 = { riffnr: 'ab4-riff', manufacturer:'m13'};
		var p3 = { riffnr: 'ab3-riff', manufacturer:'m14'};
		var p4 = { riffnr: 'ab2-riff', manufacturer:'m14'};
		var p5 = { riffnr: 'ab1-riff', manufacturer:'m15'};
		var p6 = { riffnr: 'ab6-riff', manufacturer:'m15'};
		var p7 = { riffnr: 'aa7-riff', manufacturer:'m16'};
		var p8 = { riffnr: 'aa8-riff', manufacturer:'m14'};

		RiffModel.create([p1,p2,p3,p4,p5,p6,p7,p8], function(err, newriffs) {
			var filter = "manufacturer:m14"
			var url = URL_ROOT + '/api/v1/riff?f=' + filter;
			superagent.get(url, function(err, res) {
				assert.equal(res.body.data.length, 3); 
				assert.equal(res.body.data[0].riffnr, 'aa8-riff');
				assert.equal(res.body.data[1].riffnr, 'ab2-riff');
				assert.equal(res.body.data[2].riffnr, 'ab3-riff');
				done();
			});
			
		});
	});

	xit('get skped, limit riff data', function(done) {
		var p1 = { riffnr: 'ab5-riff', manufacturer:'m13'};
		var p2 = { riffnr: 'ab4-riff', manufacturer:'m13'};
		var p3 = { riffnr: 'ab3-riff', manufacturer:'m13'};
		var p4 = { riffnr: 'ab2-riff', manufacturer:'m13'};
		var p5 = { riffnr: 'ab1-riff', manufacturer:'m13'};
		var p6 = { riffnr: 'ab6-riff', manufacturer:'m13'};
		var p7 = { riffnr: 'aa7-riff', manufacturer:'m13'};
		var p8 = { riffnr: 'aa8-riff', manufacturer:'m13'};

		RiffModel.create([p1,p2,p3,p4,p5,p6,p7,p8], function(err, newriffs) {
			// get 3 riffs and skip the first 2 (ab1,ab2) 
			var url = URL_ROOT + '/api/v1/riff?q=ab&limit=3&skip=2';
			superagent.get(url, function(err, res) {
				assert.equal(res.body.data.length, 3); 
				assert.equal(res.body.data[0].riffnr, 'ab3-riff');
				assert.equal(res.body.data[1].riffnr, 'ab4-riff');
				assert.equal(res.body.data[2].riffnr, 'ab5-riff');
				done();
			});
			
		});
	});

	xit('can update riff data / REST: PUT', function(done) {
		var tmpriff = {riffnr:'update', typenr:"typenr", note: { de_DE:"notiz"} };
		p1 = new RiffModel(tmpriff);
		p1.save(); 
		var id = p1._id;

		// change typenr
		var update = { typenr: "newTypenr", riffnr:"newriffNr" };
		var url = URL_ROOT + '/api/v1/riff/' + id;
		// REST: update = put-verb
		superagent.put(url)
					.send(update)
					.end(function(err, res) {
			// check if the new riff was updated
			assert.equal(res.body.data.ok, 1); 
			assert.equal(res.body.data.n, 1); 

			RiffModel.findOne({_id:id}, function(err, result) {
				// changed typenr
				assert.equal(result.typenr, "newTypenr"); 
				assert.equal(result.riffnr, "newriffNr"); 
				assert.equal(result.note.de_DE, "notiz"); 
				done();

			});
		});
	});


	xit('can delete a riff / REST: DEL', function(done) {
		// create new riff
		var tmpriff = {riffnr:'deleteriff', typenr:"typenr", note: { de_DE:"notiz"} };
		p1 = new RiffModel(tmpriff);
		p1.save(); 
		var id = p1._id;

		// delete that riff
		var url = URL_ROOT + '/api/v1/riff/' + id;
		// REST: delete = delete-verb
		superagent.del(url)
					.end(function(err, res) {
			// check if the new riff was deleted
			assert.equal(res.body.data.ok, 1); 
			assert.equal(res.body.data.n, 1); 

			RiffModel.findOne({_id:id}, function(err, result) {
				assert.equal(err, null);
				// no riff should be found
				assert.equal(result, null);
				done();
			});
		});
	});

});


