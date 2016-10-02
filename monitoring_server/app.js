var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var mysql = require('mysql');

var net = require('net');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// var port = normalizePort(process.env.PORT || '3000')
// app.set('port', port);

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

//소켓 통신 서버 구축
var nowTime;
var server = net.createServer(function(client) {
  var tempData = "";
  nowTime = new Date();
  console.log("connection time : " + nowTime);
  console.log('Client connection: ');
  console.log('   local = %s: %s', client.localAddress, client.localPort);
  console.log('   remote = %s: %s', client.remoteAddress, client.remotePort);
  client.setEncoding('utf8');
  client.on('data', function(data) {
    console.log('Received data from client on port %d', client.remotePort);
    // 전송받은 데이터 누적
    tempData += (data.toString());
  });
  client.on('end', function() {
    // 통신이 끝나면 데이터를 db에 저장
    if (tempData) {
      var jsonObj = JSON.parse(tempData);

      input_db(jsonObj, function(msg) {
        console.log(msg);
      });
    }
    tempData = "";
    console.log('Client disconnected');
    server.getConnections(function(err, count) {
      console.log('Remaining Connections : ' + count);
    });
  });
  client.on('error', function(err) {
    console.log('Socket Timed out');
  });
});
server.listen(28000, function() {
  console.log('Server listening : ' + JSON.stringify(server.address()));
  server.on('close', function() {
    console.log('Server Terminated');
  });
  server.on('error', function(err) {
    console.log('Server Error : ' + JSON.stringify(err));
  });
});

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '111111',
  database: 'user_sample',
  dateStrings: true
});

function input_db(jsonObj, callback) {
  var user = jsonObj.User;
  var datatime = jsonObj.DataTime;
  var os_info = jsonObj.OS_Information;
  var proc_info = jsonObj.Processes_Information;
  var core_info = jsonObj.OS_Information.CPU_Core_Info;
  var last_connect_time;

  // 알람 테이블 저장 함수 호출
  insert_alarm(user, datatime, os_info, proc_info.length);

  console.log('find last connect time');
  // 마지막 접속 시간 가져오기
  var sql = "SELECT last_connect_time FROM user WHERE id=?";
  connection.query(sql, [user.id], function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else if (rows) {
      last_connect_time = rows[0].last_connect_time;
      console.log('get last_connect_time success');
      //마지막 접속시간으로부터 이전의 데이터를 필터링 하는 함수 호출
      // var setting_date = new Date();
      // if(last_connect_time < setting_date.toLocaleString())
      // {
      //   last_connect_time = setting_date.setDate(setting_date.getDate() - 1);
      // }
      data_filtering(last_connect_time, user.id, function(msg) {
        console.log(msg);
      });
    }
  });

  // 사용자 os table에 데이터 저장
  sql = "INSERT INTO "+user.id+"_os (id, server_name, os_name, user_name, ip, os_cpu_total, os_idle, os_kernel, os_user, core_count, os_memory, datatime) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
  connection.query(sql, [user.id, os_info.Server_Name, os_info.OS_Name, os_info.User_Name, os_info.IP_Address, parseFloat(os_info.CPU_Total), parseFloat(os_info.CPU_Idle_Usage), parseFloat(os_info.CPU_Kernel_Usage), parseFloat(os_info.CPU_User_Usage), parseInt(os_info.CPU_Core_Count), parseFloat(os_info.OS_Memory), datatime.DataTime], function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      // console.log('insert user_os success');
    }
  });

  // 사용자 core table에 데이터 저장
  sql = "INSERT INTO "+user.id+"_core (id, datatime, core_name, core_total, core_idle, core_kernel, core_user) VALUES (?, ?, ?, ?, ?, ?, ?)";
  for (var idx in core_info) {
    connection.query(sql, [user.id, datatime.DataTime, core_info[idx].Core_Name, parseFloat(core_info[idx].Core_Total), parseFloat(core_info[idx].Core_Idle_Usage), parseFloat(core_info[idx].Core_Kernel_Usage), parseFloat(core_info[idx].Core_User_Usage)], function(err, rows, fields) {
      if (err) {
        console.log(err);
      } else {
        // console.log('insert user_core_success');
      }
    });
  }

  // 사용자 process table에 데이터 저장
  sql = "INSERT INTO "+user.id+"_process (id, datatime, process_name, process_id, process_cpu, process_memory, thread_count) VALUES (?, ?, ?, ?, ?, ?, ?)";
  for (var idx in proc_info) {
    // console.log(proc_info[idx]);
    connection.query(sql, [user.id, datatime.DataTime, proc_info[idx].Process_Name, parseInt(proc_info[idx].Process_ID), parseFloat(proc_info[idx].Process_CPU), parseFloat(proc_info[idx].Process_Memory), parseInt(proc_info[idx].Process_Threads)], function(err, rows, fields) {
      if (err) {
        console.log(err);
      } else {
        // console.log('insert user_process success');
      }
    });
  }

  // 사용자의 마지막 접속 시간 변환
  sql = "UPDATE user set last_connect_time =? WHERE id =?"
  connection.query(sql, [new Date().toLocaleString(), user.id], function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      console.log('update last connect time for user');
    }
  });

  if (typeof callback === 'function') {
    callback('insert data success');
  }
}

// 사용자의 알람 설정에 맞게 알람 테이블에 데이터 저장
function insert_alarm(user, datatime, user_os, process_count) {
  // 사용자의 알람 정보를 가져오기
  var sql = "SELECT * FROM user WHERE id =?";
  connection.query(sql, [user.id], function(err, rows, fields) {
    if(err) {
      console.log(err);
    }
    else {
      // CPU 나 Memory 의 임계값을 초과하면
      if(rows[0].cpu_threshold < user_os.CPU_Total || rows[0].memory_threshold < user_os.OS_Memory) {
        // 사용자의 alarm table에 저장
        var sql = "INSERT INTO "+user.id+"_alarm(datatime, cpu_usage, memory_usage, process_count) VALUES (?,?,?,?)";
        connection.query(sql, [datatime.DataTime, user_os.CPU_Total, user_os.OS_Memory, process_count], function(err, rows, fields) {
          if(err) {
            console.log(err);
          }
          else {
            console.log("success insert alarm data");
          }
        });
        sql = "UPDATE "+user.id+"_os SET filter_check='true' WHERE datatime=?";
        connection.query(sql, [datatime.DataTime], function(err, rows, fields) {
          if(err) {
            console.log(err);
          } else {
            console.log("update "+user.id+"_os success");
          }
        });
        sql = "UPDATE "+user.id+"_process SET filter_check='true' WHERE datatime=?";
        connection.query(sql, [datatime.DataTime], function(err, rows, fields) {
          if(err) {
            console.log(err);
          } else {
            console.log("update "+user.id+"_process success");
          }
        });
        sql = "UPDATE "+user.id+"_core SET filter_check='true' WHERE datatime=?";
        connection.query(sql, [datatime.DataTime], function(err, rows, fields) {
          if(err) {
            console.log(err);
          } else {
            console.log("update "+user.id+"_core success");
          }
        });
      }
    }
  });
}

// 마지막 접속 시간으로부터 이전의 데이터를 필터링 하는 함수
function data_filtering(time, user_id, callback) {
  console.log('data filtering start');
  console.log(time);
  var time_value = new Date(time);
  console.log(time_value);
  // 사용자의 마지막 접속 시간을 분단위로 변환
  var prevTime = new Date(time_value.getFullYear(), time_value.getMonth(), time_value.getDate(), time_value.getHours(), time_value.getMinutes(), 0, 0);
  // 현재 시간
  var lastTime = new Date();
  // prevTime의 1분 후의 시간
  var nextTime;
  console.log("start time => prevTime : " + prevTime.toLocaleString() + ", lastTime : " + lastTime.toLocaleString());
  var cnt = 0;
  // console.log((lastTime.getTime() - prevTime.getTime()) / (1000 * 60));

  // 현재시간으로부터 변경된 prevTime의 차가 1분을 넘지 못할 때까지
  while ((lastTime.getTime() - prevTime.getTime()) / (1000 * 60) > 1) {
    // prevTime에서 1분을 더한 시간 객체
    nextTime = new Date(Date.parse(prevTime) + 60000);
    // console.log(++cnt + " while loop");

    // prevTime부터 nextTime 까지의 데이터를 필터링 한다
    filtering_to_range(user_id, prevTime, lastTime, nextTime, function(msg) {
      console.log('msg' + prevTime.toLocaleString());
    });
    // prevTime을 nextTime의 시간으로 변환한다.
    prevTime = nextTime;
  }

  if (typeof callback === 'function') {
    callback('success filtering');
  }
}

//해당 1분의 데이터를 요약하여 사용자의 data_filter table에 저장한다
function filtering_to_range(user_id, prevTime, lastTime, nextTime, callback) {
  var max_cpu = null;
  var max_cpu_time = null;
  var min_cpu = null;
  var min_cpu_time = null;
  var cpu_avg = null;
  var memory_avg = null;
  var sql;

  // cpu 최대값을 가져온다
  sql = "SELECT os_cpu_total, datatime FROM "+user_id+"_os WHERE os_cpu_total = (SELECT MAX(os_cpu_total) FROM "+user_id+"_os WHERE datatime >= ? and datatime < ?)  ORDER BY datatime ASC";
  console.log("query interval prevTime : " + prevTime.toLocaleString() + ", nextTime : " + nextTime.toLocaleString());
  connection.query(sql, [prevTime, nextTime], function(err, rows, fields) {
    // console.log('max cpu');
    if (err) {
      console.log(err);
    } else if (rows.length > 0) {
      console.log('collect max data');
      console.log(rows.length > 0);
      max_cpu = rows[rows.length - 1].os_cpu_total;
      max_cpu_time = rows[rows.length - 1].datatime;
      // 최대 값 데이터를 체크하여 삭제 하지 못하도록 하는 함수
      check_max_data(user_id, max_cpu_time, function(msg) {
        console.log(msg);
      });

      // cpu 최소값을 가져온다
      sql = "SELECT os_cpu_total, datatime FROM "+user_id+"_os WHERE os_cpu_total = (SELECT MIN(os_cpu_total) FROM "+user_id+"_os WHERE datatime >= ? and datatime < ?)  ORDER BY datatime ASC";
      console.log("query interval prevTime : " + prevTime.toLocaleString() + ", nextTime : " + nextTime.toLocaleString());
      connection.query(sql, [prevTime, nextTime], function(err, rows, fields) {
        // console.log('min cpu');
        if (err) {
          console.log(err);
        } else if (rows.length > 0) {
          console.log('collect min data');
          console.log(rows);
          min_cpu = rows[rows.length - 1].os_cpu_total;
          min_cpu_time = rows[rows.length - 1].datatime;
          // 최소 값 데이터를 체크하여 삭제하지 못하도록 하는 함수
          check_min_data(user_id, min_cpu_time, function(msg) {
            console.log(msg);
          });

          // cpu와 memory의 평균 데이터를 가져온다
          sql = "SELECT AVG(os_cpu_total), AVG(os_memory) FROM "+user_id+"_os WHERE datatime >= ? and datatime < ?";
          console.log("query interval prevTime : " + prevTime.toLocaleString() + ", nextTime : " + nextTime.toLocaleString());
          connection.query(sql, [prevTime, nextTime], function(err, rows, fields) {
            // console.log('avg dpu');
            if (err) {
              console.log(err);
            } else if (rows.length > 0) {
              console.log('collect avg data');
              console.log(rows);
              cpu_avg = rows[0]['AVG(os_cpu_total)'];
              memory_avg = rows[0]['AVG(os_memory)'];

              // data filter table에 가져온 데이터를 저장한다
              sql = "INSERT INTO "+user_id+"_data_filter(id, filter_time, max_cpu, max_cpu_time, min_cpu, min_cpu_time, cpu_avg, memory_avg) VALUES (?,?,?,?,?,?,?,?)";
              console.log("query interval prevTime : " + prevTime.toLocaleString() + ", nextTime : " + nextTime.toLocaleString());
              connection.query(sql, [user_id, prevTime, max_cpu, max_cpu_time, min_cpu, min_cpu_time, cpu_avg, memory_avg], function(err, rows, fields) {
                // console.log('insert data');
                if (err) {
                  console.log(err);
                } else {
                  console.log('insert the filtering data success');

                  // 필터링이 되지 않은 데이터들 중 최소의 시간값을 가지는 datatime 값을 가져온다
                  sql = "SELECT MIN(datatime) FROM "+user_id+"_os WHERE filter_check = 'false'";
                  connection.query(sql, function(err, rows, fields) {
                    if(err) {
                      console.log(err);
                    }
                    else {
                      // console.log("delete time interval : " + (rows[0]['MIN(datatime)'] < new Date(Date.parse(new Date()) - 1000 * 60 * 5).toLocaleString()));
                      // console.log(rows[0]['MIN(datatime)'] + ", " + new Date(Date.parse(new Date()) - 1000 * 60 * 5).toLocaleString() + "=======================================");
                      // console.log(rows[0]['MIN(datatime)']);
                      // 필터링이 되지 않은 최소의 시간이 현재 시간으로부터 5분 전인 경우
                      if(rows[0]['MIN(datatime)'] < new Date(Date.parse(new Date()) - 1000 * 60 * 5).toLocaleString()) {
                        // 해당 간격에서 최대 최소 데이터를 제외한 데이터들을 삭제한다.
                        delete_data(user_id, prevTime, nextTime, function(msg) {
                          console.log(msg);
                        });
                      }
                    }
                  });
                }
              });
            } else {
              console.log('avg collect fail');
              console.log(rows);
            }
          });
        } else {
          console.log('min data collect fail');
          console.log(rows);
        }
      });
    } else {
      // 해당 간격에 데이터가 존재하지 않는 경우
      console.log('data is not exist this interval');
      console.log(rows);
      max_cpu = 0;
      max_cpu_time = prevTime.toLocaleString();
      min_cpu = 0;
      min_cpu_time = prevTime.toLocaleString();
      cpu_avg = 0;
      memory_avg = 0;

      // 없는 데이터로 사용자의 data_filter table에 저장한다
      sql = "INSERT INTO "+user_id+"_data_filter(id, filter_time, max_cpu, max_cpu_time, min_cpu, min_cpu_time, cpu_avg, memory_avg) VALUES (?,?,?,?,?,?,?,?)";
      connection.query(sql, [user_id, prevTime, max_cpu, max_cpu_time, min_cpu, min_cpu_time, cpu_avg, memory_avg], function(err, rows, fields) {
        // console.log('insert data');
        if (err) {
          console.log(err);
        } else {
          console.log('insert the filtering data success');
        }
      });
    }
  });

  if (callback === 'function') {
    callback('filtering function worked')
  }
}

// 해당 간격의 최대값의 시간데이터를 기준으로 filter_check 칼럼의 값을 true로 변환하여 삭제하지 못하도록 한다.
function check_max_data(user_id, max_cpu_time, callback) {
  sql = "UPDATE "+user_id+"_os SET filter_check = 'true' WHERE datatime = ?";
  connection.query(sql, [max_cpu_time], function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      console.log('update_os');
    }
  });
  sql = "UPDATE "+user_id+"_core SET filter_check = 'true' WHERE datatime = ?";
  connection.query(sql, [max_cpu_time], function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      console.log('update_core');
    }
  });
  sql = "UPDATE "+user_id+"_process SET filter_check = 'true' WHERE datatime = ?";
  connection.query(sql, [max_cpu_time], function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      console.log('update_process');
    }
  });

  if (typeof callback === 'function') {
    callback('check max data success');
  }
}

// 해당 간격의 최소값의 시간데이터를 기준으로 filter_check 칼럼의 값을 true로 변환하여 삭제하지 못하도록 한다.
function check_min_data(user_id, min_cpu_time, callback) {
  sql = "UPDATE "+user_id+"_os SET filter_check = 'true' WHERE datatime = ?";
  connection.query(sql, [min_cpu_time], function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      console.log('update_os');
    }
  });
  sql = "UPDATE "+user_id+"_core SET filter_check = 'true' WHERE datatime = ?";
  connection.query(sql, [min_cpu_time], function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      console.log('update_core');
    }
  });
  sql = "UPDATE "+user_id+"_process SET filter_check = 'true' WHERE datatime = ?";
  connection.query(sql, [min_cpu_time], function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      console.log('update_process');
    }
  });

  if (typeof callback === 'function') {
    callback('check min data success');
  }
}

// 해당 간격의 데이터를 삭제한다
function delete_data(user_id, prevTime, nextTime, callback) {
  sql = "DELETE FROM "+user_id+"_os WHERE datatime < (DATE_SUB(NOW(), INTERVAL 5 MINUTE)) and filter_check = 'false'";
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      console.log('delete user_os data success');
    }
  });
  sql = "DELETE FROM "+user_id+"_core WHERE datatime < (DATE_SUB(NOW(), INTERVAL 5 MINUTE)) and filter_check = 'false'";
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      console.log('delete user_core data success');
    }
  });
  sql = "DELETE FROM "+user_id+"_process WHERE datatime < (DATE_SUB(NOW(), INTERVAL 5 MINUTE)) and filter_check = 'false'";
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      console.log('delete user_process data success');
    }
  });

  if (typeof callback === 'function') {
    console.log('delete data success');
  }
}

module.exports = app;
