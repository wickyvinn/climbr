//////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// REQUIREMENTS //////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////


// require libraries
var express    = require('express');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var session    = require('express-session');


// set up appp
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


// require modules
var perminfojs = require("./public/js/perminfo.js");

//////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// ALL THINGS MONGO /////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/climbr';

mongoose.connect(uristring, function (err, res) {
  if (err) console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  else console.log ('Succeeded connected to: ' + uristring);
});

var users = new mongoose.Schema({ username: String });
var User = mongoose.model('users', users);

var perminfo = new mongoose.Schema({ 
	user_id: String, 
	first_name: String, 
	gender: String, 
	weight: Number, 
	top_cert: Boolean, 
	lead_cert: Boolean,
	rope_high: String,
	rope_low: String,
	boulder_high: String,
	boulder_low: String
});

var PermInfo = mongoose.model('perminfo', perminfo);


//////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// ROUTES ////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

app.route('/')
	.get(function(request, response) {
		response.render('login.html', {error: ""});
	})
	.post(function(request, response) {
		User.findOne({"username": request.body.username}, function (err, user) {
			if (!user) {
				response.render("login.html", {error: "Username not found."});
			} else {
				request.session.user = user;
				response.redirect("/seshinfo");
			}
		});
	});

app.route('/signup')
	.get(function(request, response) {
		response.render('signup.html', {error: ""});
	})
	.post(function(request, response) {
		User.findOne({"username": request.body.username}, function (err, user) {
			if (user) {
				response.render("signup.html", {error: "Username already exists."});
			} else {
				// create the user
				User.create({ username: request.body.username }, function (err, user) {
					if (err) response.send("401 - Bad Request." + err);
					else {
						// issue session
						request.session.user = user;
						response.redirect("/perminfo");
					}
				})
			}
		});
	});

app.route('/perminfo/edit')
	.get(function(request, response) {
		if (request.session.user) {
		// i really hate that i'm repeating the find perminfo query here. figure out a way to pass json through redirect?
		// make sure we handle weight and checkboxes for top/lead.
			PermInfo.findOne({"user_id": request.session.user._id}, function (err, perminfo) {
				if (err) response.send("401 - Bad Request." + err); 
				else {
					// format the data.
					var formattedPermInfo = perminfojs.formatInfo(perminfo);
					response.render("perminfo-edit.html", formattedPermInfo);
				}
			});
		} else {
			console.log("session doesn't exist.")
			response.render('login.html', { error: "Please sign in." });
		}
	})
	.post(function(request, response) {
		if (request.session.user) {
			PermInfo.update({user_id: request.session.user._id}, {$set: request.body}, {upsert: true}, 
				function(err, perminfo) {
					if (err) {
						console.log("401 - Bad Request. " + err)
						response.send("401 - Bad Request." + err);
					}
					else {
						response.writeHead(200, {"Content-Type": "text/plain"});
					}
				});

		} else {
			console.log("session doesn't exist.")
			response.render('login.html', { error: "Please sign in." });
		}
	});

app.route('/perminfo')
	.get(function(request, response) {
		if (request.session.user) {
			// check if they have permanent info data yet
			PermInfo.findOne({"user_id":request.session.user._id}, function (err, perminfo) {
				if (err) response.send("401 - Bad Request." + err); 
				else {
					if (perminfo) response.redirect("/perminfo/edit") // if so, take them to perm-info- single page rendering
					else response.render('perminfo-pages.html'); // if not, they go through pages. 
				}
			});

		} else response.render('login.html', { error: "Please sign in." });
	})
	.post(function(request, response) {
		if (request.session.user) { // check if the user is signed in.
			var weight = parseInt(request.body.weight.split(" ")[0])
			PermInfo.update({user_id: request.session.user._id}, { 
				// i probably don't really need the set, since i think the post will update the whole thing.
				$set: {
					first_name: request.body.firstName,
					gender: request.body.gender,
					weight: weight,
					top_cert: request.body.top, 
				  lead_cert: request.body.lead, 
				  rope_high: request.body.highRopeLevel,
				  rope_low: request.body.lowRopeLevel,
				  boulder_high: request.body.highBoulderLevel,
				  boulder_low: request.body.lowBoulderLevel
				}
			},
			{
				upsert: true
			}
			, function(err, perminfo) {
					if (err) response.send("401 - Bad Request." + err);
					else response.redirect('/perminfo/edit') // expose the entered data to client.
			});
		} else response.render('login.html', { error: "Please sign in." });
	})

app.route('/seshinfo')
	.get(function(request, response) {
		if (request.session.user) {
			response.render('seshinfo.html');
		} else response.render('login.html', { error: "Please sign in." });
	})
	.post(function(request, response) {
		response.send('all info done submitting.');
	})

app.route('/profile')
	.get(function(request, response) {
		response.render('profile.html');
	})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

