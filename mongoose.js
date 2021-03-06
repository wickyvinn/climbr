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

var Room = new Schema({
  users: [String] // array of users who can view this room
});

var AtGym = new Schema( {
  userId: String,
  atGym:  Boolean,
  lastUpdated: Date
})

var Users     = mongoose.model('users', User);
var PermInfos = mongoose.model('perminfos', PermInfo);
var SeshInfos = mongoose.model('seshinfos', SeshInfo);
var Matches   = mongoose.model('matches', Match);
var Rooms     = mongoose.model('rooms', Room);
var AtGyms    = mongoose.model('atgym', AtGym);


function getUserIds(matchArray) {
  var userIds = [];
  for (var i=0; i < matchArray.length; i++) {
    userIds.push(matchArray[i].userId);
  }
  return userIds;
}


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

function findPermInfoOfUsers(userIds, respondFunction) {
  PermInfos.find( { userId: { $in: userIds } },
    function(err, users) {
      if (err) { var queryResult = new idx.Error(401, err); }
      else if (users) { var queryResult = new idx.Success(users); }
      else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: findPermInfos!!!"); }
      respondFunction(queryResult);
    }
  );
}

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

// all people who swiped right on the user but the user hasn't swiped right on them... returns Array[userId]
function likesUser(userId, respondFunction) {

  Matches.find({ matches: userId }, { userId: true, _id: false}, function (err, matches) {

      if (err) { var queryResult = new idx.Error(401, err); }
      else if (matches) { var queryResult = new idx.Success(getUserIds(matches)); }
      else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: getMatches!!!"); }
      respondFunction(queryResult);

    });
};

// all the people the user swiped right on. gonna be an object that looks like Array[String], where String = userId
function userLikes(userId, respondFunction) {
  var matchIds = [];
  Matches.findOne({ userId:userId }, { matches: true, _id: false }, function (err, matchesObject) {

    if (err) { var queryResult = new idx.Error(401, err); }
    else if (matchesObject != null) { var queryResult = new idx.Success(matchesObject.matches); }
    else if (matchesObject === null) { var queryResult = new idx.Success([])}
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: userLikes!!!");  }
    respondFunction(queryResult);

  });
};

function checkMatch(userId, matchId, respondFunction) {

  Matches.find( {$and: [{userId: matchId}, { matches: userId }]}, function(err, match) {
    if (err) { var queryResult = new idx.Error(401, err); }
    else if (match) { var queryResult = new idx.Success(match); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: checkMatch!!!"); }
    respondFunction(queryResult);
  });
  
};

function addMatch(userId, matchId, respondFunction) {

  Matches.update( { userId:userId }, { $addToSet: { matches:matchId }}, {upsert: true}, function (err, matches) { 
    if (matches) { var queryResult = new idx.Success(matches); }
    else if (err) { var queryResult = new idx.Error(401, err); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: addMatch!!!")}
    respondFunction(queryResult); 
  });

};

function removeMatches(userId, respondFunction) {

  Matches.remove( {userId: userId}, function (err, matches) {
    if (matches) { var queryResult = new idx.Success(matches); }
    else if (err) { var queryResult = new idx.Error(401, err); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: removeMatches!!!")}
    respondFunction(queryResult); 
  });

};

function findRoom(userId, matchId, respondFunction) {
  
  Rooms.findOne({ $and: [{users:userId}, {users:matchId}]}, function (err, room) {
    
    if (err) { var queryResult = new idx.Error(401, err); }
    else if (room) { var queryResult = new idx.Success(room); }
    else if (room === null) { var queryResult = new idx.Success(null); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: findroom!!!"); }
    respondFunction(queryResult)

  });
};

function createRoom(userId, matchId, respondFunction) {

  Rooms.create({users: [userId, matchId]}, function(err, room) {
  
    if (room) { var queryResult = new idx.Success(room); }
    else if (err) { var queryResult = new idx.Error(401, err); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: createUser!!!"); }
    respondFunction(queryResult);

  });
};

function updateAtGym(userId, body, respondFunction) {

  AtGyms.update({userId: userId}, {$set: body}, {upsert: true}, function(err, atGym) {

    if (atGym) { var queryResult = new idx.Success(atGym); }
    else if (err) { var queryResult = new idx.Error(401, err); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: updateatGym!!!"); }
    respondFunction(queryResult);

  });

}

function findAtGym(userId, respondFunction) {

  AtGyms.findOne({userId: userId}, function(err, atGym) {

    if (err) { var queryResult = new idx.Error(401, err); }
    else if (atGym) { var queryResult = new idx.Success(atGym); }
    else if (atGym === null) { var queryResult = new idx.Success(null); }
    else { var queryResult = new idx.Error(401, "SHIT SHIT SOMETHING WEIRD HAPPENED: findAtGym!!!"); }
    respondFunction(queryResult);

  });

};


// export dat shiz

exports.Users      = Users;
exports.PermInfos  = PermInfos;
exports.SeshInfos  = SeshInfos;
exports.Matches    = Matches;
exports.Rooms      = Rooms;
exports.AtGyms     = AtGyms; 

exports.findUser       = findUser;
exports.createUser     = createUser;
exports.findPermInfo   = findPermInfo;
exports.findPermInfos  = findPermInfos;
exports.findPermInfoOfUsers = findPermInfoOfUsers;
exports.updatePermInfo = updatePermInfo;
exports.findSeshInfos  = findSeshInfos; 
exports.updateSeshInfo = updateSeshInfo;
exports.likesUser      = likesUser;
exports.userLikes      = userLikes;
exports.addMatch       = addMatch;
exports.checkMatch     = checkMatch;
exports.removeMatches  = removeMatches;
exports.findRoom       = findRoom;
exports.createRoom     = createRoom;
exports.updateAtGym    = updateAtGym;
exports.findAtGym      = findAtGym;


