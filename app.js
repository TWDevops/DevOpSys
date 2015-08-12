var express = require('express');

var config = require("nconf");
config.env().file({ "file":"config.json" });

var session = require('express-session');
//var DataBase = new require('./utils/DataBase.js');
//var dbase = new require('./utils/DataBase.js');
var MongoStore = require('connect-mongo')(session);

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
//var login = require('./routes/login');

var mod = require('./routes/mods.js');

var app = express(),
	swig = require('swig');

//view engine setup with swig
app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Swig will cache templates for you, but you can disable
// that and use Express's caching instead, if you like:
app.set('view cache', false);
// To disable Swig's cache, do the following:
swig.setDefaults({ cache: false });

// view engine setup with jade
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
/*app.use(session({
		secret: 'O9mITfnV0',
		saveUninitialized: false, // don't create session until something stored 
	    resave: false, //don't save session if unmodified
		store: new MongoStore({
			db:dbase.getDb(),
			autoRemove: 'interval',
			autoRemoveInterval: 10 // In minutes. Default 
		})
	}));*/
app.use(session({
	secret: 'O9mITfnV0',
	saveUninitialized: false, // don't create session until something stored 
	resave: false, //don't save session if unmodified
	store: new MongoStore({
		db: config.get("DB_NAME"),
		host: config.get("DB_HOST"),
		port: parseInt(config.get("DB_PORT")),
		collection: 'session',
		autoRemove: 'interval',
		autoRemoveInterval: 10 // In minutes. Default 
	})
}));

app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.use("/styles", express.static(__dirname + '/views/styles'));
app.use(logger('dev'));
/*app.use(function(req, res, next) {
    if(req.is("application/xml")){
	var data = '';
	    req.setEncoding('utf8');

	    req.on('data', function(chunk) { 
	        data += chunk;
	    });

	    req.on('end', function() {
		req.rawBody = data;
		next();
	    });
    }else{
	next();
    }
});*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text({defaultCharset: "utf-8", type:"application/xml"}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
	res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
	res.setHeader("Pragma", "no-cache");
	res.setHeader("Expires", 0);
    return next();
  })
console.log(app.get('env'));
app.use('/', routes);
app.use('/users', users);
//app.use('/login',login);
app.use('/mod/',mod);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
