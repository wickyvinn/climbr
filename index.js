var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.route('/')
	.get(function(request, response) {
		response.render('login.html');
	})
	.post(function(request, response) {
		// verify this username doesn't exist in the database. can do via ajax. if so, next page should be via jquery.
		// go straight to session info if permanent info has already been filled out. 
		response.render('perminfo-pages.html');
	})

app.route('/signup')
	.get(function(request, response) {
		response.render('signup.html');
	})
	.post(function(request, response) {
		// verify this username doesn't exist in the database. can do via ajax. if so, next page should be via jquery.
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

