var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
var mysql = require('mysql');
var net = require('net');

var routes = require('./routes/index');
var users = require('./routes/users');
var sample = require('./routes/sample');

var app = express();
var http = require('http');
var port = 28001;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secret'));
app.use(session({
  secret: 'weojf3920@#$dfnj',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));
//세션 미들웨어 설정
// app.use(function(req, res) {
//   var output = {};
//   output.cookies = req.cookies;
//   output.session = req.session;
//
//   //stored session
//   req.session.now = (new Date()).toUTCString();
//   //response
//   res.send(output);
// });

app.use('/', routes);
app.use('/users', users);
// app.use('/users', require('./routes/users'));
// app.use('/chk', sample);

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

var server = app.listen(28001, function() {
  console.log('server 28001');
});

module.exports = app;
