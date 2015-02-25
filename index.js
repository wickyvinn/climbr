var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('login.html');
});

app.get('/signup', function(request, response) {
	response.render('signup.html');
});

app.post('/signup', function(request, response) {
	var username = request.body.username
	// verify this username doesn't exist in the database. can do via ajax. if so, next page should be via jquery.
	response.render("signuptwo.html");
});

app.get('/signuptwo', function(request, response) {
	response.render("seshinfo.html");
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

