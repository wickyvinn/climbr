var express    = require('express');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var session    = require('express-session')

var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/climbr';

mongoose.connect(uristring, function (err, res) {
  if (err) console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  else console.log ('Succeeded connected to: ' + uristring);
});

var users = new mongoose.Schema({ username: String });
var User = mongoose.model('users', users);

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
		response.render('signup.html');
	})
	.post(function(request, response) {
		response.render('perminfo-pages.html');
	})

app.route('/perminfo')
	.get(function(request, response) {
		response.render('perminfo-pages.html');
	})
	.post(function(request, response) {
		var personalInfo = request.body;
		var firstName = request.body.firstName;
		var gender = request.body.gender;
		var weight = request.body.weight;
		var top = request.body.top;
		var lead = request.body.lead;
		var ropeLevelRange = request.body.lowRopeLevel + " to " + request.body.highRopeLevel
		var boulderLevelRange = request.body.lowBoulderLevel + " to " + request.body.highBoulderLevel
		response.render('perminfo-verify.html', { firstName: firstName, gender: gender, weight: weight, top: top, lead: lead, ropeLevelRange: ropeLevelRange, boulderLevelRange: boulderLevelRange });
	})

app.route('/seshinfo')
	.get(function(request, response) {
		response.render('seshinfo.html');
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

