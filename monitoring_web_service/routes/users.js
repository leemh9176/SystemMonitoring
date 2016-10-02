var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '111111',
  database: 'user_sample'
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//아이디 중복 체크
router.post('/sample', function(req, res, next) {
  console.log('post connection');
  console.log(req.body.input_id);
  var input_id = req.body.input_id;
  var sql = "SELECT * FROM user WHERE id =?";
  connection.query(sql, [input_id], function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.send('0');
    } else {
      if (rows == null || rows.length == 0) {
        console.log('아이디 없음 : 0');
        res.send('0');
      } else {
        console.log(rows);
        console.log('아이디 중복 : 1');
        res.send('1');
      }
    }
  });
});
//회원가입
router.post('/signup', function(req, res, next) {
  console.log('회원가입 스타트');
  console.log(req.body);
  var user_id = req.body.user_id;
  var user_pw = req.body.user_pw;
  var user_email = req.body.email;

  var user_os = user_id + "_os";
  var user_process = user_id + "_process";
  var user_core = user_id + "_core";
  var user_data_filter = user_id + "_data_filter";

  console.log(user_id);
  var sql = "SELECT * FROM user WHERE id=?"
  connection.query(sql, [user_id], function(err, rows, fields) {
    if(err) {
      console.log(err);
    }
    else {
      if(rows.length) {
        res.send('same');
      }
      else {
        sql = "INSERT INTO user(id, pw, email, user_os, user_process, user_core, user_data_filter, last_connect_time) VALUES (?,?,?,?,?,?,?,DATE_SUB(NOW(), INTERVAL 24 HOUR))";
        connection.query(sql, [user_id, user_pw, user_email,user_os, user_process, user_core, user_data_filter], function(err, rows, fields) {
          if(err) {
            console.log("insert user error");
            console.log(err);
          }
          else {
            making_user_table(user_id);
            console.log('making table per user');
            res.send('success');
          }
        });
      }
    }
  });
});

// 사용자의 테이블 생성
function making_user_table(user_id) {
  console.log('making table');
  console.log(user_id);
  var sql;
  sql = "CREATE TABLE " + user_id + "_os (" +
        "no int NOT NULL AUTO_INCREMENT," +
        "id varchar(30) NOT NULL," +
        "server_name varchar(100)," +
        "os_name varchar(100)," +
        "user_name varchar(100)," +
        "ip varchar(30)," +
        "os_cpu_total float," +
        "os_idle float," +
        "os_kernel float," +
        "os_user float," +
        "core_count int," +
        "os_memory float," +
        "datatime datetime NOT NULL," +
        "filter_check varchar(30) default 'false'," +
        "PRIMARY KEY (no, datatime)" +
        ")ENGINE=INNODB DEFAULT CHARACTER SET utf8 collate utf8_general_ci";
  // console.log(sql);
  connection.query(sql, function(err, rows, fields) {
    if(err) {
      console.log("user os error");
      console.log(err);
    }
    else {
      console.log("create " + user_id + "_os");
    }
  });
  console.log("making user process table");
  sql = "CREATE TABLE " + user_id + "_process (" +
        "no int NOT NULL AUTO_INCREMENT," +
        "id varchar(30) NOT NULL," +
        "datatime datetime NOT NULL," +
        "process_name varchar(100)," +
        "process_id int," +
        "process_cpu float," +
        "process_memory float," +
        "thread_count int," +
        "filter_check varchar(30) default 'false'," +
        "PRIMARY KEY(no)" +
        ")ENGINE=INNODB DEFAULT CHARACTER SET utf8 collate utf8_general_ci";
        console.log(sql);
  connection.query(sql, function(err, rows, fields) {
    if(err) {
      console.log("user process error");
      console.log(err);
    }
    else {
      console.log("create " + user_id + "_process");
    }
  });
  console.log("making user core table");
  sql = "CREATE TABLE " + user_id + "_core (" +
        "no int NOT NULL AUTO_INCREMENT," +
        "id varchar(30) NOT NULL," +
        "datatime datetime," +
        "core_name varchar(30)," +
        "core_total float," +
        "core_idle float," +
        "core_kernel float," +
        "core_user float," +
        "filter_check varchar(30) default 'false'," +
        "PRIMARY KEY(no)" +
        ")ENGINE=INNODB DEFAULT CHARACTER SET utf8 collate utf8_general_ci";
  connection.query(sql, function(err, rows, fields) {
    if(err) {
      console.log("user core error");
      console.log(err);
    }
    else {
      console.log("create " + user_id + "_core");
    }
  });
  console.log("making user data filter table");
  sql = "CREATE TABLE " + user_id + "_data_filter (" +
        "no int NOT NULL AUTO_INCREMENT," +
        "id varchar(30) NOT NULL," +
        "filter_time datetime," +
        "max_cpu float," +
        "max_cpu_time datetime," +
        "min_cpu float," +
        "min_cpu_time datetime," +
        "cpu_avg float," +
        "memory_avg float," +
        "PRIMARY KEY(no)" +
        ")ENGINE=INNODB DEFAULT CHARACTER SET utf8 collate utf8_general_ci";
  connection.query(sql, function(err, rows, fields) {
    if(err) {
      console.log("user data filter error");
      console.log(err);
    }
    else {
      console.log("create " + user_id + "_data_filter");
    }
  });
  sql = "CREATE TABLE " + user_id + "_alarm (" +
        "no int NOT NULL AUTO_INCREMENT," +
        "datatime datetime," +
        "cpu_usage float," +
        "memory_usage float," +
        "process_count int," +
        "PRIMARY KEY (no)" +
        ")ENGINE=INNODB DEFAULT CHARACTER SET utf8 collate utf8_general_ci";
  connection.query(sql, function(err, rows, fields) {
    if(err) {
      console.log("user alarm error");
      console.log(err);
    }
    else {
      console.log("create " + user_id + "_alarm");
    }
  });
}

module.exports = router;
