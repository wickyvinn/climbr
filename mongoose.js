// import modules
var idx = require("./index.js");

// all things mongo

var mongoose = require('mongoose');
var Schema  = mongoose.Schema;

// connect to db

exports.connectToDb = function() {
  var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/climbr';
  mongoose.connect(uristring, function (err, res) {
    if (err) console.log('error connecting to: ' + uristring + '. ' + err + '.');
    else console.log('connected to ' + uristring + ' successfully.');
  });
}

// schemas

var User     = new Schema({
  username:     String
})

var PermInfo = new Schema({ 
  user_id:      String, 
  first_name:   String, 
  gender:       String, 
  weight:       Number, 
  top_cert:     Boolean, 
  lead_cert:    Boolean,
  rope_high:    String,
  rope_low:     String,
  boulder_high: String,
  boulder_low:  String
});


var Users     = mongoose.model('users', User);
var PermInfos = mongoose.model('perminfos', PermInfo)


// queries

function findUser(username, respondFunction) {
  
  Users.findOne({"username": username}, function(err, user) {
    
    if (err) { var queryResult = new idx.Error(401, err); }
    else if (user) { var queryResult = new idx.Success(user); }
    else if (user === null) { var queryResult = new idx.Success(null); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENNED: findUser!!!"); }
    respondFunction(queryResult)

  });
};

function createUser(body, respondFunction) {

  Users.create(body, function(err, user) {
  
    if (user) { var queryResult = new idx.Success(user); }
    else if (err) { var queryResult = new idx.Error(401, err); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENNED: createUser!!!"); }
    respondFunction(queryResult);

  });
};

function findPermInfo(body, respondFunction) {

  PermInfos.findOne(body, function(err, perminfo) {

    if (err) { var queryResult = new idx.Error(401, err); }
    else if (perminfo) { var queryResult = new idx.Success(perminfo); }
    else if (perminfo === null) { var queryResult = new idx.Success(null); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENNED: findPermInfo!!!"); }
    respondFunction(queryResult);

  });

};

function updatePermInfo(userId, body, respondFunction) {

  PermInfos.update({user_id: userId}, {$set: body}, {upsert: true}, function(err, perminfo) {

    if (perminfo) { var queryResult = new idx.Success(perminfo); }
    else if (err) { var queryResult = new idx.Error(401, err); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENNED: updatePermInfo!!!"); }
    respondFunction(queryResult);

  });

};

// export dat shiz

exports.Users      = Users;
exports.PermInfos  = PermInfos;

exports.findUser     = findUser;
exports.createUser   = createUser;
exports.findPermInfo = findPermInfo;
exports.updatePermInfo = updatePermInfo;
