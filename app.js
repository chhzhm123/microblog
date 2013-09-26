
var fs=require('fs');
var accessLogfile = fs.createWriteStream('access.log',{flags:'a'});
var errorLogfile = fs.createWriteStream('error.log',{flags:'a'});

var express = require('express');
var routes = require('./routes');
var http = require('http');
var partials = require('express-partials');
var flash=require('connect-flash');
var ejs=require('ejs');
var path = require('path');
var app = express();


var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');

// all environments
app.set('env', 'production');
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.use(express.logger({stream: accessLogfile}));

app.use(partials());
app.use(express.favicon());
app.use(express.bodyParser());
app.use(flash());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
	secret: settings.cookieSecret,
	store: new MongoStore({
		db: settings.db
	})
}));

app.use(function(req, res, next){
  	res.locals.error = req.flash('error').toString();
    res.locals.success = req.flash('success').toString();
    res.locals.user = req.session ? req.session.user : null;
  	next();
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}
app.use(function(err, req, res, next){
    var meta = '[' + new Date() + '] ' + req.url + '\n';
    errorLogfile.write(meta + err.stack + '\n');
    next();
 });
routes(app);
exports.start = function() {
    http.createServer(app).listen(app.get('port'), function() {
      console.log('Express server listening on port ' + app.get('port'));
    });
}
