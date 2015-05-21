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
  userId:      String, 
  firstName:   String, 
  gender:      String, 
  weight:      Number, 
  topCert:     Boolean, 
  leadCert:    Boolean,
  ropeHigh:    String,
  ropeLow:     String,
  boulderHigh: String,
  boulderLow:  String,
  photoAddress: String
});

var SeshInfo = new Schema({
  userId:      String,
  wannaTop:    Boolean,
  wannaLead:   Boolean,
  wannaBoulder: Boolean,
  timeIn:      Date,
  timeOut:     Date
});

var Match = new Schema({
  userId:     String,
  matches:    [String] // array of userids that were swiped right
});

var Users     = mongoose.model('users', User);
var PermInfos = mongoose.model('perminfos', PermInfo);
var SeshInfos = mongoose.model('seshinfos', SeshInfo);
var Matches   = mongoose.model('matches', Match);

// queries

function findUser(username, respondFunction) {
  
  Users.findOne({"username": username}, function(err, user) {
    
    if (err) { var queryResult = new idx.Error(401, err); }
    else if (user) { var queryResult = new idx.Success(user); }
    else if (user === null) { var queryResult = new idx.Success(null); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: findUser!!!"); }
    respondFunction(queryResult)

  });
};

function createUser(body, respondFunction) {

  Users.create(body, function(err, user) {
  
    if (user) { var queryResult = new idx.Success(user); }
    else if (err) { var queryResult = new idx.Error(401, err); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: createUser!!!"); }
    respondFunction(queryResult);

  });
};

function findPermInfo(body, respondFunction) {

  PermInfos.findOne(body, function(err, perminfo) {

    if (err) { var queryResult = new idx.Error(401, err); }
    else if (perminfo) { var queryResult = new idx.Success(perminfo); }
    else if (perminfo === null) { var queryResult = new idx.Success(null); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: findPermInfo!!!"); }
    respondFunction(queryResult);

  });

};


// find sessioninfos, filter out the current user herself.
function findPermInfos(userId, respondFunction) {

  PermInfos.find( { userId: { $ne:mongoose.Types.ObjectId(userId) } }, 
    function(err, users) {
      if (err) { var queryResult = new idx.Error(401, err); }
      else if (users) { var queryResult = new idx.Success(users); }
      else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: findPermInfos!!!"); }
      respondFunction(queryResult);
    }
  );

};

function updatePermInfo(userId, body, respondFunction) {

  PermInfos.update({userId: userId}, {$set: body}, {upsert: true}, function(err, perminfo) {

    if (perminfo) { var queryResult = new idx.Success(perminfo); }
    else if (err) { var queryResult = new idx.Error(401, err); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: updatePermInfo!!!"); }
    respondFunction(queryResult);

  });

};

// find sessioninfos, filter out the current user herself.
function findSeshInfos(userId, respondFunction) {

  SeshInfos.find( { userId: { $ne:mongoose.Types.ObjectId(userId) } }, 
    function(err, users) {
      if (err) { var queryResult = new idx.Error(401, err); }
      else if (users) { var queryResult = new idx.Success(users); }
      else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: findSeshInfos!!!"); }
      respondFunction(queryResult);
    }
  ); 

}

function updateSeshInfo(userId, body, respondFunction) {

  SeshInfos.update({userId: userId}, {$set: body}, {upsert: true}, function(err, seshinfo) {

    if (seshinfo) { var queryResult = new idx.Success(seshinfo); }
    else if (err) { var queryResult = new idx.Error(401, err); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: updateSeshInfo!!!"); }
    respondFunction(queryResult);

  });

}

function addMatch(userId, matchId, respondFunction) {

  Matches.update({userId: userId}, { $push: { matches: matchId } }, {upsert: true}, function(err, matches) {
    if (matches) { var queryResult = new idx.Success(matches); }
    else if (err) { var queryResult = new idx.Error(401, err); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: addMatch!!!")}
    respondFunction(queryResult); 
  });

}


// export dat shiz

exports.Users      = Users;
exports.PermInfos  = PermInfos;
exports.SeshInfos  = SeshInfos;
exports.Matches    = Matches;

exports.findUser       = findUser;
exports.createUser     = createUser;
exports.findPermInfo   = findPermInfo;
exports.findPermInfos  = findPermInfos; 
exports.updatePermInfo = updatePermInfo;
exports.findSeshInfos  = findSeshInfos; 
exports.updateSeshInfo = updateSeshInfo;
exports.addMatch       = addMatch;
