//////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// REQUIREMENTS //////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////


// require libraries
var express    = require('express');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var session    = require('express-session');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);
var multer     = require('multer');
var done       = false;

// set up appp
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

/*Configure the multer.*/
// looks like this 'done' variable is global but i dunno if i like that. 
app.use(multer({ dest: './public/uploads/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },
  onFileUploadStart: function (file) {
    console.log(file.originalname + ' is starting ...')
  },
  onFileUploadComplete: function (file) {
    console.log(file.fieldname + ' uploaded to  ' + file.path)
    done=true;
  }
}));


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
          else response.redirect("/perminfo/edit");
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
          else response.redirect("/perminfo/edit");
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
        else response.redirect('/matches');
      };

      db.updateSeshInfo(request.session.user._id, updateBody, respond);    
    
    } else response.render('login.html', { error: "Please sign in." });
    

  })

app.route('/matches')
  .get(function(request, response) {
    if (request.session.user) {
      var userId = request.session.user._id
      
      db.SeshInfos.find( { userId: { $ne:mongoose.Types.ObjectId(userId) } },
        function(err, seshinfos) {
          if (err) errorHandler(response, Error(401, err));
          else if (!seshinfos) errorHandler(response, Error(401, "BADBAD VERY BAD"));
          
          function respond(seshinfos, perminfos) {
            var matches = logic.joinMatches(seshinfos, perminfos);
            response.render("climbrs.html", {matches: JSON.stringify(matches)}); 
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
  });

app.route('/climbrs')
  .get(function(request, response) {
    response.render("climbrs.html");
  })

app.route('/photo')
  .get(function(request, response) {
    if (request.session.user) response.render('photo.html');
    else response.render('login.html', { error: "Please sign in." });
  })
  .post(function(request, response) {
    if (request.session.user) {
      
      var userId = request.session.user._id
      
      if (done==true) {
      
        var photoAddress = request.files.userPhoto.path.replace("public", "");

        function respond(perminfoOrError) {
          if (perminfoOrError instanceof Error) errorHandler(response, perminfoOrError);
          else {
            if (perminfoOrError.body === null) response.redirect("/photo");
            else response.end("User perminfo updated.");
          }
        };
        
        db.updatePermInfo(userId, { photoAddress: photoAddress }, respond); 

      }
    } else response.render('login.html', { error: "Please sign in." });

  });

app.listen(app.get('port'), function() {
  console.log("climbr is running at localhost:" + app.get('port') + '.');
});

