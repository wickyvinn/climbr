//////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// REQUIREMENTS //////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////


// require libraries
var express    = require('express');
var bodyParser = require('body-parser');
var url        = require('url');
var mongoose   = require('mongoose');
var session    = require('express-session');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);
var swig       = require('swig');

// set up app
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');


// AWS-S3
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var s3Bucket = "profile-pics-bucket";
var fs = require('fs');

// here, i think we have to be aware of how heroku populates the key/secret pair. it might be unnecessary. 
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
// });

// require modules
var logic      = require("./public/js/logic.js");
var db         = require("./mongoose.js");

db.connectToDb()

// set up sessions

app.use(cookieParser());
app.use(session({
  secret: '076ee61d63aa10a125ea872411e433b9',
  maxAge: new Date(Date.now() + 36000000),
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 3600000 }
 }));

///// error handling

var Error = function (errCode, errMsg) {
  this.errCode  = errCode;
  this.errMsg   = errMsg;
}
var Success = function (body) {
  this.body     = body;
}

exports.Error   = Error;
exports.Success = Success;

/// handle any error that is returned from a query.

function errorHandler(response, queryResult) {
  if (queryResult.errCode === 401) {
    response.render("401.html", {error: queryResult.errMsg} );
  } else if (queryResult.errCode === 404) {
    response.render("404.html", {error: queryResult.errMsg} );
  } else response.send("you forgot a code in the error declaration.");
}


//////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// ROUTES ////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

app.route('/')
  .get(function(request, response) {
    response.render('login.html', {error: ""});
  })
  .post(function(request, response) {

    function respond(userOrError)   {
      if (userOrError instanceof Error) errorHandler(response, userOrError);
      else {
        if (userOrError.body === null) response.render('login.html', {error: "Username doesn't exist."}); 
        else {
          request.session.user = userOrError.body;
          response.redirect("/perminfo"); 
        }
      }
    };

    db.findUser(request.body.username, respond);
      
  });

app.route('/signup')
  
  .get(function(request, response) {
    response.render('signup.html', {error: ""});
  })

  .post(function(request, response) {

    function respondToCreate(userOrError) {
      if (userOrError instanceof Error) errorHandler(response, userOrError);
      else {
        request.session.user = userOrError.body;
        response.redirect("/perminfo");
      }
    };

    function respondToFind(userOrError) {
      if (userOrError instanceof Error) errorHandler(response, userOrError);
      else {
        if (userOrError.body == null) db.createUser({ username: request.body.username }, respondToCreate);
        else response.render("signup.html", {error: "Username already exists."});
      }
    };

    db.findUser(request.body.username, respondToFind)
    
  });

app.route('/perminfo')
  .get(function(request, response) {
    if (request.session.user) {

      function respond(perminfoOrError) {
        if (perminfoOrError instanceof Error) errorHandler(response, perminfoOrError);
        else {
          if (perminfoOrError.body == null) response.render('perminfo-pages.html');
          else response.redirect("/seshinfo");
        }
      };

      db.findPermInfo({"userId":request.session.user._id}, respond);

    } else response.render('login.html', { error: "Please sign in." });
  })
  
  .post(function(request, response) {
    if (request.session.user) {

      // TODO: will go away when implement AJAX on perminfo-pages.html. replaced by just 'request' i think.
      var updateBody = {
          firstName: request.body.firstName,
          gender: request.body.gender,
          weight: parseInt(request.body.weight.split(" ")[0]),
          topCert: request.body.topCert, 
          leadCert: request.body.leadCert, 
          ropeHigh: request.body.ropeHigh,
          ropeLow: request.body.ropeLow,
          boulderHigh: request.body.boulderHigh,
          boulderLow: request.body.boulderLow
      }

      function respond(perminfoOrError) {
        if (perminfoOrError instanceof Error) errorHandler(response, perminfoOrError);
        else {
          if (perminfoOrError.body == null) response.render('perminfo-pages.html');
          else response.redirect("/photo");
        }
      };

      db.updatePermInfo(request.session.user._id, updateBody, respond);

    } else response.render('login.html', { error: "Please sign in." });
  })


app.route('/perminfo/edit')
  .get(function(request, response) {
    if (request.session.user) {

      function respond(perminfoOrError) {
        if (perminfoOrError instanceof Error) errorHandler(response, perminfoOrError);
        else {
          if (perminfoOrError.body === null) response.redirect("/perminfo");
          else {
            var formattedPermInfo = logic.formatInfo(perminfoOrError.body);
            response.render("perminfo-edit.html", formattedPermInfo);
          }
        };
      };

      db.findPermInfo({"userId":request.session.user._id}, respond);

    } else response.render('login.html', { error: "Please sign in." });
  })

  .post(function(request, response) {
    if (request.session.user) {
      
      function respond(perminfoOrError) {
        if (perminfoOrError instanceof Error) errorHandler(response, perminfoOrError);
        else {
          if (perminfoOrError.body === null) response.redirect("/perminfo");
          else response.redirect("/seshinfo");
        }
      };
      
      db.updatePermInfo(request.session.user._id, request.body, respond); 

    } else response.render('login.html', { error: "Please sign in." });
  });

app.route('/seshinfo')
  .get(function(request, response) {
    if (request.session.user) {

      function respond(perminfoOrError) {
        if (perminfoOrError instanceof Error) errorHandler(response, seshinfoOrError);
        else if (perminfoOrError.body === null) response.redirect("/perminfo");
        else response.render('seshinfo.html', 
          { topCert: perminfoOrError.body.topCert, leadCert: perminfoOrError.body.leadCert });
      }
      
      db.findPermInfo({"userId":request.session.user._id}, respond);
      
    } else response.render('login.html', { error: "Please sign in." });
  })
  .post(function(request, response) {
    if (request.session.user) {

      var sessionLength = request.body.sessionLength // in hours

      var timeIn  = Date.now()
      var timeOut = Date.now() + sessionLength*60000

      var updateBody = {
        wannaTop: request.body.wannaTop, 
        wannaLead: request.body.wannaLead,
        wannaBoulder: request.body.wannaBoulder,
        timeIn: timeIn,
        timeOut: timeOut
      }

      function respond(seshinfoOrError) {
        if (seshinfoOrError instanceof Error) errorHandler(response, seshinfoOrError);
        else response.redirect('/climbers');
      };

      db.updateSeshInfo(request.session.user._id, updateBody, respond);    
    
    } else response.render('login.html', { error: "Please sign in." });
    

  })

app.route('/climbers')
  .get(function(request, response) {
    if (request.session.user) {
      var userId = request.session.user._id
      
      db.SeshInfos.find( { userId: { $ne:mongoose.Types.ObjectId(userId) } },
        function(err, seshinfos) {
          if (err) errorHandler(response, Error(401, err));
          else if (!seshinfos) errorHandler(response, Error(401, "BADBAD VERY BAD"));
          
          function respond(seshinfos, perminfos) {
            var climbers = logic.joinClimbers(seshinfos, perminfos);
            response.render("climbers.html", {climbers: climbers}); 
          }

          db.PermInfos.find( { userId: { $ne:mongoose.Types.ObjectId(userId) } },
            function(err, perminfos) {
              if (err) errorHandler(response, Error(401, err));
              else if (!perminfos) errorHandler(response, Error(401, "BADBAD VERY BAD"))
              respond(seshinfos, perminfos);
            }
          )
        }
      ); 
      
    } else response.render('login.html', { error: "Please sign in." });
  })

app.route("/matches/any")
  .get(function(request, response) {
    if (request.session.user) {
      var userId = request.session.user._id;
      function respond(matchesOrError) {
        if (matchesOrError instanceof Error) errorHandler(response, matchesOrError);
        else {
          console.log(matchesOrError.body);
          var matchIds = matchesOrError.body.map(function (match) { JSON.stringify(match.userId) });
          console.log(matchIds);
          console.log("matches: " + matchIds);
          if (matchIds.length < 1) response.end()
          else response.send(matchIds);
        }
      };
      db.getMatches(request.session.user._id, respond);
    }
  })
app.route('/matches')  
  .get(function(request, response) {
    if (request.session.user) {

      var userId = request.session.user._id;
      var matchId = request.body;
      var url_parts = url.parse(request.url, true);
      var query = url_parts.query;
      var matchId = query.matchId;

      function respond(matchOrError) {
        if (matchOrError instanceof Error) errorHandler(response, matchOrError);
        else {
          // i hate this but findOne and count doesn't seem to work in mongoose
          if (matchOrError.body.length < 1) response.send(false)
          else response.send(true);
        };
      };

      db.checkMatch(request.session.user._id, matchId, respond);

    } else response.render('login.html', { error: "Please sign in." });
  })
  .post(function(request, response) {
    if (request.session.user) {

      var userId = request.session.user._id;
      var matchId = request.body["matchId"];

      function respond(matchesOrError) {
        if (matchesOrError instanceof Error) errorHandler(response, matchesOrError);
        else response.end();
      };

      db.addMatch(request.session.user._id, matchId, respond);

    } else response.render('login.html', { error: "Please sign in." })
  })

app.route('/swipe')
  .get(function(request, response) {
    response.render("swipe.html");
  });
app.route('/photo')
  .get(function(request, response) {
    if (request.session.user) {

      function respond(perminfoOrError) {
        if (perminfoOrError instanceof Error) errorHandler(response, perminfoOrError);
        else {
          if (perminfoOrError.body.photoAddress == null) response.render('photo.html', {defaultPhoto: "../img/camera.png"});
          else response.render('photo.html', {defaultPhoto: perminfoOrError.body.photoAddress});
        }
      };

      db.findPermInfo({"userId":request.session.user._id}, respond);
    }

    else response.render('login.html', { error: "Please sign in." });
  })
  .post(function(request, response) {
    if (request.session.user) {

      var userId = request.session.user._id
      var buf = new Buffer(request.body.base64,'base64');

      var filename = userId; 

      var data = {
        Key: filename, 
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg'
      };

      uploadPhotoToS3(data, userId, response);


    } else response.render('login.html', { error: "Please sign in." });
  });


function uploadPhotoToS3(data, userId, response) {
  var s3bucket = new AWS.S3({params: {Bucket: s3Bucket}});

  s3bucket.upload(data, function(err, data) {
          
    if (err) { 

      console.log('Error in uploading photo: ', err);
      alert("There was an error in uploading your photo, try again.");
      response.send({redirect: '/photo'})

    } else {
      
      var s3photoAddress = data.Location;

      function respond(perminfoOrError) {
        if (perminfoOrError instanceof Error) errorHandler(response, perminfoOrError);
        else {
          if (perminfoOrError.body === null) response.redirect("/photo");
          else response.send({redirect: '/perminfo/edit'});
        }
      };

      db.updatePermInfo(userId, { photoAddress: s3photoAddress }, respond); 

    }

  });
}

app.listen(app.get('port'), function() {
  console.log("climbr is running at localhost:" + app.get('port') + '.');
});

