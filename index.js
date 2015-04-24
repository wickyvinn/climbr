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
var db         = require("./mongoose.js");

db.connectToDb()

///// fucking error handling

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

    function respond(userOrError) {
      if (userOrError instanceof Error) errorHandler(response, userOrError);
      else {
        if (userOrError.body === null) response.render('login.html', {error: "Username doesn't exist."}); 
        else {
          request.session.user = userOrError.body;
          response.redirect("/seshinfo"); 
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

app.route('/perminfo/edit')
  .get(function(request, response) {
    if (request.session.user) {

      function respond(perminfoOrError) {
        if (perminfoOrError instanceof Error) errorHandler(response, perminfoOrError);
        else {
          var formattedPermInfo = perminfojs.formatInfo(perminfoOrError.body);
          response.render("perminfo-edit.html", formattedPermInfo);
        }
      }

      db.findPermInfo({"user_id":request.session.user._id}, respond);

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

app.route('/perminfo')
  .get(function(request, response) {
    if (request.session.user) {

      function respond(perminfoOrError) {
        if (perminfoOrError instanceof Error) errorHandler(response, perminfoOrError);
        else {
          if (perminfoOrError.body == null) response.render('perminfo-pages.html');
          else response.redirect("/perminfo/edit");
        }
      };

      db.findPermInfo({"user_id":request.session.user._id}, respond);

    } else response.render('login.html', { error: "Please sign in." });
  })
  
  .post(function(request, response) {
    if (request.session.user) {

      // TODO: will go away when implement AJAX on perminfo-pages.html. replaced by just 'request' i think.
      var updateBody = {
          first_name: request.body.firstName,
          gender: request.body.gender,
          weight: parseInt(request.body.weight.split(" ")[0]),
          top_cert: request.body.top, 
          lead_cert: request.body.lead, 
          rope_high: request.body.highRopeLevel,
          rope_low: request.body.lowRopeLevel,
          boulder_high: request.body.highBoulderLevel,
          boulder_low: request.body.lowBoulderLevel
      }

      function respond(perminfoOrError) {
        if (perminfoOrError instanceof Error) errorHandler(response, perminfoOrError);
        else {
          if (perminfoOrError.body == null) response.render('perminfo-pages.html');
          else response.redirect("/perminfo/edit");
        }
      };

      db.updatePermInfo(request.session.user._id, updateBody, respond);

    } else response.render('login.html', { error: "Please sign in." });
  })

app.route('/seshinfo')
  .get(function(request, response) {
    if (request.session.user) {

      function respond(perminfoOrError) {
        if (perminfoOrError instanceof Error) errorHandler(response, seshinfoOrError);
        else {
          var topCert = perminfoOrError.body.top_cert;
          var leadCert = perminfoOrError.body.lead_cert;
          response.render('seshinfo.html', {topCert: topCert, leadCert: leadCert});
        }
      }
      
      db.findPermInfo(request.session.user._id, respond);
      
    } else response.render('login.html', { error: "Please sign in." });
  })
  .post(function(request, response) {
    
    var sessionLength = request.body.sessionLength 

    var time_in  = Date.now()
    var time_out = Date.now() + sessionLength*60000

    var updateBody = {
      top: request.body.top, 
      lead: request.body.lead,
      boulder: request.body.boulder,
      time_in: time_in,
      time_out: time_out
    }

    function respond(seshinfoOrError) {
      if (seshinfoOrError instanceof Error) errorHandler(response, seshinfoOrError);
      else response.render('/matches');
    };

    db.updateSeshInfo(request.session.user._id, updateBody, respond);    

    response.redirect('/matches');
  })

app.route('/matches')
  .get(function(request, response) {
    // need to be able to check for a session WITHOUT being limited that user's creds.

    var userId = request.session.user._id
    
    db.SeshInfos.find( { user_id: { $ne:mongoose.Types.ObjectId(userId) } },
      function(err, seshinfos) {
        if (err) errorHandler(response, Error(401, err));
        else if (!seshinfos) errorHandler(response, Error(401, "BADBAD VERY BAD"));
        
        function respond(seshinfos, perminfos) {
          response.render("matches.html", {seshinfos: seshinfos, perminfos: perminfos}); 
        }

        db.PermInfos.find( { user_id: { $ne:mongoose.Types.ObjectId(userId) } },
          function(err, perminfos) {
            if (err) errorHandler(response, Error(401, err));
            else if (!perminfos) errorHandler(response, Error(401, "BADBAD VERY BAD"))
            respond(seshinfos, perminfos);
          }
        )
      }
    ); 
  });

app.route('/profile')
  .get(function(request, response) {
    response.render('profile.html');
  })

app.listen(app.get('port'), function() {
  console.log("climbr is running at localhost:" + app.get('port') + '.');
});

