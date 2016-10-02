var express = require('express');
var router = express.Router();
// var mysql = require('mysql');

// var connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '111111',
//   database: 'user_sample'
// });

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
// router.get('/sample', function(req, res, next) {
//   // res.send('get sample');
//   console.log('get sample');
//   console.log(req.params);
//   // res.send('<a href="/login">login</a>')
// });
// router.post('/chk/sample', function(req,res,next) {
//   console.log('hello');
//   // alert('hihi');
//   // res.send('/chk/sample');
//   // res.send('<a href="/login">Back login<a>')
//   console.log(req.body());
// });

module.exports = router;
