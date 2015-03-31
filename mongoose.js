/////////////// CONNECTION TO DB ///////////////

var mongoose = require('mongoose');

var uristring = 
  process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/climbr';

mongoose.connect(uristring, function (err, res) {
  if (err) console.log ('ERROR connecting to: ' + uristring + '. ' + err);
 	else console.log ('Succeeded connected to: ' + uristring);
});

////////////////// SCHEMA ////////////////////


module.exports = {
	users: function () {
		new mongoose.Schema({
		  username: String,
		  firstName: String,
		  gender: String,
		  weight: Number,
		  top: Boolean,
		  lead: Boolean, 
		  ropeLevelLow: String,
		  ropeLevelHigh: String,
		  boulderLevelLow: String,
		  boulderLevelHigh: String
		};
	},

	User: function() {
		mongoose.model('climbers', users);
	};
};
