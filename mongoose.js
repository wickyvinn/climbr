// All things mongo
var mongoose = require('mongoose');
var Schema 	= mongoose.Schema;

// connect to db

exports.connectToDb = function() {
	var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/climbr';
	mongoose.connect(uristring, function (err, res) {
	  if (err) console.log('ERROR connecting to: ' + uristring + '. ' + err);
	 	else console.log('Succeeded connected to: ' + uristring);
	});
}


/////////////////////////
// !! SCHEMA BIDNAS !! //
/////////////////////////

var User 		 = new Schema({
	username: 		String
})

var PermInfo = new Schema({ 
	user_id: 			String, 
	first_name: 	String, 
	gender: 			String, 
	weight: 			Number, 
	top_cert: 		Boolean, 
	lead_cert: 		Boolean,
	rope_high: 		String,
	rope_low: 		String,
	boulder_high: String,
	boulder_low: 	String
});


var Users 		= mongoose.model('users', User);
var PermInfos = mongoose.model('perminfos', PermInfo)


exports.Users 		= Users;
exports.PermInfos = PermInfos;
