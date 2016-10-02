var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

//mysql connection
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '111111',
  database: 'user_sample',
  dateStrings: true
});

//빈 공간 0 매우기
function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}

//시간 객체를 string 객체로 변환
function TimeToString(rowtime) {
  var str = "";
  str += leadingZeros(rowtime.getFullYear(), 4);
  str += leadingZeros(rowtime.getMonth() + 1, 2);
  str += leadingZeros(rowtime.getDate(), 2);
  str += leadingZeros(rowtime.getHours(), 2);
  str += leadingZeros(rowtime.getMinutes(), 2);
  str += leadingZeros(rowtime.getSeconds(), 2);
  return str;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login');
});
//로그인 페이지
router.get('/login', function(req, res, next) {
  res.render('login');
});
//로그인 사용자 정보 확인
router.post('/login', function(req, res, next) {
  var id = req.body.id;
  var pw = req.body.pw;
  var result = {};
  console.log(req.body);
  var sql = "SELECT * FROM user WHERE id =?"
  connection.query(sql, [id], function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      result = rows;
      if (result.length != 0 && id == result[0].id) {
        if (pw != result[0].pw) {
          console.log('비밀번호 불일치');
          res.send('0');
        } else {
          console.log('로그인 성공');
          res.cookie("user_id", id);

          if (result[0].download == 'false') {
            console.log('다운로드 받아야 함');
            res.send('2');
          } else {
            console.log('다운로드 되어 있음');
            res.send('3');
          }
        }
      } else if (result.length == 0) {
        console.log('검색 결과가 없음');
        res.send('1');
      }
    }
  });
});
router.get('/logout', function(req, res, next) {
  res.clearCookie('user_id');
  res.redirect('/login');
});
//회원가입
router.get('/signup', function(req, res, next) {
  res.render('signup');
});
//다운로드 페이지
router.get('/download', function(req, res, next) {
  res.render('download');
});
router.get('/download_program', function(req, res, next) {
  //다운로드 버튼 클릭 시 사용자 정보의 download를 false 에서 true로 변환
  var sql = "UPDATE user SET download = 'true' WHERE id =?";
  connection.query(sql, [req.cookies.user_id], function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      //해당 프로그램 다운로드
      res.download(__dirname + '/Window10_64bit_Data_Collector.zip');
    }
  });
});
//차트 페이지
router.get('/chart', function(req, res, next) {
  res.render('chart');
});
//24 시간 이전의 데이터 삭제
router.post('/delete_before24hour', function(req, res, next) {
  var sql = "DELETE FROM " + req.cookies.user_id + "_os WHERE datatime <= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {

    }
  });
  sql = "DELETE FROM " + req.cookies.user_id + "_process WHERE datatime <= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      // console.log('user_process delete success');
    }
  });
  sql = "DELETE FROM " + req.cookies.user_id + "_core WHERE datatime <= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      // console.log('user_core delete success');
    }
  });
  sql = "DELETE FROM " + req.cookies.user_id + "_data_filter WHERE filter_time <= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      // console.log('data_filter delete success');
    }
  });
  sql = "DELETE FROM " + req.cookies.user_id + "_alarm WHERE datatime <= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      // console.log('user_os delete success');
    }
  });
  res.send('delete befor 24 hour data success')
});
//OS_List 페이지
router.get('/os_list', function(req, res, next) {
  res.render('os_list');
});
router.post('/os_list', function(req, res, next) {
  //마지막 시간의 사용자 OS 정보 가져오기
  var sql = "SELECT * from " + req.cookies.user_id + "_os where datatime = (SELECT MAX(datatime) FROM " + req.cookies.user_id + "_os)";
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      if (rows.length) {
        var result = [];
        result.push({
          server_name: rows[0].server_name,
          os_name: rows[0].os_name,
          user_name: rows[0].user_name,
          ip_address: rows[0].ip,
          cpu_usage: new Number(rows[0].os_kernel + rows[0].os_user),
          memory_usage: rows[0].os_memory,
          core_count: rows[0].core_count,
          data_time: rows[0].datatime
        });
        res.send(result);
      } else {
        res.send([]);
      }
    }
  });
});
//CPU Chart 페이지
router.get('/cpu_chart', function(req, res, next) {
  res.render('cpu_chart');
});
router.post('/cpu_usage', function(req, res, next) {
  var num = req.body.distance;                                  // 사용자가 선택한 인터벌 시간 길이 (분)
  var lastTime = TimeToString(new Date(req.body.lastTime));     // 사용자가 선택한 시간 변환
  var result;
  //사용자가 선택한 인터벌 시간이 Realtime 인 경우 (5분 이하)
  if (num < 30) {
    //현재로부터 5분 전의 사용자의 os 정보 탐색
    var sql = "SELECT * FROM " + req.cookies.user_id + "_os WHERE datatime >= DATE_SUB(NOW(), INTERVAL " + num + " MINUTE) ORDER BY datatime ASC";
    connection.query(sql, function(err, rows, fields) {
      if (err) {
        console.log(err);
      } else {
        if (rows.length > 0) {
          var data = [];
          var key = new Date(Date.parse(new Date()) - (1000 * 60 * num));         //현 시간으로부터 5분 전의 시간으로 Key값 지정
          var col = 0;
          // 2초 간격으로 분당 30개의 데이터가 필요함
          for (var i = 0; i < 30 * num; i++) {
            if (col == rows.length) {
              // 탐색한 쿼리의 배열이 끝날 경우
              data.push({
                "os_cpu_total": 0,
                "os_kernel": 0,
                "os_user": 0,
                "datatime": "none data"
              });
            } else if (key.toLocaleString() == rows[col].datatime) {
              // key값과 해당 쿼리의 datatime이 같을경우
              data.push({
                "cpudata": new Number((rows[col].os_kernel + rows[col].os_user)).toFixed(2),
                "os_cpu_total": new Number(rows[col].os_cpu_total),
                "os_kernel": new Number(rows[col].os_kernel),
                "os_user": new Number(rows[col].os_user),
                "datatime": rows[col].datatime
              });
              col++;
            } else if (new Date(Date.parse(key) + 1000).toLocaleString() == rows[col].datatime) {
              // key + 1초 값과 해당 쿼리의 datatime이 같을 경우
              data.push({
                "cpudata": new Number((rows[col].os_kernel + rows[col].os_user)).toFixed(2),
                "os_cpu_total": new Number(rows[col].os_cpu_total),
                "os_kernel": new Number(rows[col].os_kernel),
                "os_user": new Number(rows[col].os_user),
                "datatime": rows[col].datatime
              });
              col++;
              key = new Date(Date.parse(new Date(key)) + 1000);
            } else if (new Date(Date.parse(key) - 1000).toLocaleString() == rows[col].datatime) {
              // key - 1초 값과 해당 쿼리의 datatime이 같을 경우
              data.push({
                "cpudata": new Number((rows[col].os_kernel + rows[col].os_user)).toFixed(2),
                "os_cpu_total": new Number(rows[col].os_cpu_total),
                "os_kernel": new Number(rows[col].os_kernel),
                "os_user": new Number(rows[col].os_user),
                "datatime": rows[col].datatime
              });
              col++;
              key = new Date(Date.parse(new Date(key)) - 1000);
            } else {
              // 모두 동일하지 않으면 현 시점에 데이터가 없는 것으로 간주
              data.push({
                "os_cpu_total": 0,
                "os_kernel": 0,
                "os_user": 0,
                "datatime": "none data"
              });
            }
            // 2초 간격으로 key 값을 증가
            key = new Date(Date.parse(new Date(key)) + 2000);
          }
          res.send(data);
        } else {
          // 탐색한 쿼리가 없을 경우
          console.log('no data');
          var data = [];
          for (var i = 0; i < 30 * num; i++) {
            data.push({
              "os_cpu_total": 0,
              "os_kernel": 0,
              "os_user": 0,
              "datatime": "none data"
            });
          }
          res.send(data);
        }
      }
    });
  } else {
    // 인터벌 시간이 30분 이후일 경우
    var sql = "SELECT * FROM " + req.cookies.user_id + "_data_filter WHERE filter_time >= DATE_SUB(NOW(), INTERVAL " + num + " MINUTE) ORDER BY filter_time ASC";
    connection.query(sql, function(err, rows, fields) {
      if (err) {
        console.log(err);
      } else if (rows.length) {
        var data = [];
        var prevTime = rows[0].filter_time;
        // max 데이터 시간과 min 데이터 시간이 같고 max cpu의 값이 0일 경우 없는 데이터로 간주
        if(rows[0].max_cpu_time == rows[0].min_cpu_time && rows[0].max_cpu == 0) {
          data.push({
            "range_cpu": [0, 0.1],
            "max_cpu_time": "none data",
            "min_cpu_time": "none data",
            "cpu_avg": 0,
            "filter_time": "none data"
          });
        }
        else {
          data.push({
            "range_cpu": [new Number(rows[0].min_cpu), new Number(rows[0].max_cpu)],
            "max_cpu_time": rows[0].max_cpu_time,
            "min_cpu_time": rows[0].min_cpu_time,
            "cpu_avg": new Number(rows[0].cpu_avg),
            "filter_time": rows[0].filter_time
          });
        }
        for (var i = 1; i < rows.length; i++) {
          if (prevTime != rows[i].filter_time) {
            if(rows[i].max_cpu_time == rows[i].min_cpu_time && rows[i].max_cpu == 0) {
              data.push({
                "range_cpu": [0, 0.1],
                "max_cpu_time": "none data",
                "min_cpu_time": "none data",
                "cpu_avg": 0,
                "filter_time": "none data"
              });
            }
            else {
              data.push({
                "range_cpu": [new Number(rows[i].min_cpu), new Number(rows[i].max_cpu)],
                "max_cpu_time": rows[i].max_cpu_time,
                "min_cpu_time": rows[i].min_cpu_time,
                "cpu_avg": new Number(rows[i].cpu_avg),
                "filter_time": rows[i].filter_time
              });
            }
          }
          prevTime = rows[i].filter_time;
        }
        //탐색한 쿼리의 배열이 분의 수보다 적을 경우
        if (rows.length < num) {
          for (var i = rows.length; i < num; i++) {
            data.push({
              "range_cpu": [0, 0.1],
              "max_cpu_time": "none data",
              "min_cpu_time": "none data",
              "cpu_avg": 0,
              "filter_time": "none data",
            });
          }
        }
        res.send(data);
      } else {
        // 탐색한 쿼리가 없는 경우
        var data = [];
        for (var i = 0; i < num; i++) {
          data.push({
            "range_cpu": [0, 0.1],
            "max_cpu_time": "none data",
            "min_cpu_time": "none data",
            "cpu_avg": 0,
            "filter_time": "none data"
          });
        }
        res.send(data);
      }
    });

  }
});
router.post('/process_cpu_list', function(req, res, next) {
  // 마지막 시간의 프로세스 목록을 가져온다
  var sql = "SELECT * FROM " + req.cookies.user_id + "_process WHERE datatime =(SELECT MAX(datatime) FROM " + req.cookies.user_id + "_os) ORDER BY process_cpu DESC";
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      if (rows) {
        var result = [];
        for (var i = 0; i < rows.length; i++) {
          result.push({
            "name": rows[i].process_name,
            "process_id": rows[i].process_id,
            "progress_data": "<div id='progress_" + i + "' class='progress'><div class='area'><div class='bar' style='width: " + rows[i].process_cpu + "%'></div></div></div>",
            "data_value": rows[i].process_cpu + "%"
          });
        }
        res.send(result);
      }
      else
      {
        res.send([]);
      }
    }
  });
});
// Core CPU Chart
router.get('/cpu_core_chart', function(req, res, next) {
  res.render('cpu_core_chart');
});
router.post('/get_cpu_core_count', function(req, res, next) {
  // Core의 개수를 가져온다
  var sql = "SELECT core_count FROM " + req.cookies.user_id + "_os WHERE datatime = (SELECT MAX(datatime) FROM " + req.cookies.user_id + "_os)"
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else if(rows.length) {
      res.send(rows);
    }
    else {
      // 탐색한 쿼리가 없는경우 0 반환
      res.send(0);
    }
  });
});
router.post('/cpu_core_data', function(req, res, next) {
  console.log("cpu core data post router start");
  var num = req.body.distance;                                // 선택한 시간 5분
  var core_count = req.body.core_count;                       // core 갯수
  var lastTime = TimeToString(new Date(req.body.lastTime));   // 사용자가 선택한 시간
  console.log(num + ", " + core_count + ", " + lastTime);
  if (num < 10) {
    var sql = "SELECT * FROM " + req.cookies.user_id + "_core WHERE datatime >= DATE_SUB(NOW(), INTERVAL " + num + " MINUTE) ORDER BY datatime ASC";
    connection.query(sql, function(err, rows, fields) {
      if (err) {
        console.log(err);
      } else if (rows.length) {
        var data = [];
        for (var i = 0; i < core_count; i++) {
          data.push([]);
        }
        var key = new Date(Date.parse(new Date(req.body.lastTime)) - (1000 * 60 * num));
        var col = 0;
        for (var i = 0; i < 30 * num; i++) {
          if (col >= rows.length) {
            for (j = 0; j < core_count; j++) {
              data[j].push({
                "core_name": "none data",
                "core_total": 0,
                "core_kernel": 0,
                "core_user": 0,
                "datatime": "none data"
              });
            }
          } else if (key.toLocaleString() == rows[col].datatime) {
            for (j = 0; j < core_count; j++) {
              data[j].push({
                "core_name": rows[col + j].core_name,
                "core_total": rows[col + j].core_total,
                "core_kernel": rows[col + j].core_kernel,
                "core_user": rows[col + j].core_user,
                "datatime": rows[col + j].datatime
              });
            }
            col += parseInt(core_count);
          } else if (new Date(Date.parse(key) + 1000).toLocaleString() == rows[col].datatime) {
            for (j = 0; j < core_count; j++) {
              data[j].push({
                "core_name": rows[col + j].core_name,
                "core_total": rows[col + j].core_total,
                "core_kernel": rows[col + j].core_kernel,
                "core_user": rows[col + j].core_user,
                "datatime": rows[col + j].datatime
              });
            }
            col += parseInt(core_count);
            key = new Date(Date.parse(new Date(key)) + 1000);
          } else if (new Date(Date.parse(key) - 1000).toLocaleString() == rows[col].datatime) {
            for (j = 0; j < core_count; j++) {
              data[j].push({
                "core_name": rows[col + j].core_name,
                "core_total": rows[col + j].core_total,
                "core_kernel": rows[col + j].core_kernel,
                "core_user": rows[col + j].core_user,
                "datatime": rows[col + j].datatime
              });
            }
            col += parseInt(core_count);
            key = new Date(Date.parse(new Date(key)) - 1000);
          } else {
            for (j = 0; j < core_count; j++) {
              data[j].push({
                "core_name": "none data",
                "core_total": 0,
                "core_kernel": 0,
                "core_user": 0,
                "datatime": "none data"
              });
            }
          }
          key = new Date(Date.parse(new Date(key)) + 2000);
        }
        res.send(data);
      } else {
        var data = [];
        for (var i = 0; i < core_count; i++) {
          data.push([]);
        }
        for (var i = 0; i < 30 * num; i++) {
          for (j = 0; j < core_count; j++) {
            data[j].push({
              "core_name": "none data",
              "core_total": 0,
              "core_kernel": 0,
              "core_user": 0,
              "datatime": "none data"
            });
          }
        }
        res.send(data);
      }
    });
  }
});
//Memory Chart
router.get('/memory_chart', function(req, res, next) {
  res.render('memory_chart');
});
router.post('/memory_chart', function(req, res, next) {
  var num = req.body.distance;
  var lastTime = TimeToString(new Date(req.body.lastTime));
  var result;
  if (num < 10) {
    var sql = "SELECT os_memory, datatime FROM " + req.cookies.user_id + "_os WHERE datatime >= DATE_SUB(NOW(), INTERVAL " + num + " MINUTE) ORDER BY datatime ASC";
    connection.query(sql, function(err, rows, fields) {
      if (err) {
        console.log(err);
      } else if(rows.length) {
        var data = [];
        var key = new Date(Date.parse(new Date()) - (1000 * 60 * num));
        var col = 0;
        for (var i = 0; i < 30 * num; i++) {
          if (col == rows.length) {
            data.push({
              "memdata": 0.1,
              "datatime": "none data"
            });
          } else if (key.toLocaleString() == rows[col].datatime) {
            data.push({
              "memdata": new Number(rows[col].os_memory),
              "datatime": rows[col].datatime
            });
            col++;
          } else if (new Date(Date.parse(key) + 1000).toLocaleString() == rows[col].datatime) {
            data.push({
              "memdata": new Number(rows[col].os_memory),
              "datatime": rows[col].datatime
            });
            col++;
            key = new Date(Date.parse(key) + 1000);
          } else if (new Date(Date.parse(key) - 1000).toLocaleString() == rows[col].datatime) {
            data.push({
              "memdata": new Number(rows[col].os_memory),
              "datatime": rows[col].datatime
            });
            col++;
            key = new Date(Date.parse(key) - 1000);
          } else {
            data.push({
              "memdata": 0.1,
              "datatime": "none data"
            });
          }
          key = new Date(Date.parse(key) + 2000);
        }
        res.send(data);
      }
      else {
        var data = [];
        for(var i = 0; i < 30 * num; i++) {
          data.push({
            "memdata": 0.1,
            "datatime": "none data"
          });
        }
        res.send(data);
      }
    });
  } else {
    //선택한 시간이 30분 이후 일 경우
    var sql = "SELECT * FROM " + req.cookies.user_id + "_data_filter WHERE filter_time >= DATE_SUB(NOW(), INTERVAL " + num + " MINUTE) ORDER BY filter_time ASC";
    connection.query(sql, function(err, rows, fields) {
      if (err) {
        console.log(err);
      } else if (rows.length) {
        var data = [];
        var prevTime = rows[0].filter_time;
        if(rows[0].max_cpu_time == rows[0].min_cpu_time && rows[0].max_cpu == 0) {
          data.push({
            "memory_avg": 0.1,
            "filter_time": "none data",
            "min_cpu_time": "none data",
            "max_cpu_time": "none data"
          });
        }
        else {
          data.push({
            "memory_avg": new Number(rows[0].memory_avg),
            "filter_time": rows[0].filter_time,
            "min_cpu_time": rows[0].min_cpu_time,
            "max_cpu_time": rows[0].max_cpu_time
          });
        }
        for (var i = 1; i < rows.length; i++) {
          if (prevTime != rows[i].filter_time) {
            if(rows[i].max_cpu_time == rows[i].min_cpu_time && rows[i].max_cpu == 0) {
              data.push({
                "memory_avg": 0.1,
                "filter_time": "none data",
                "min_cpu_time": "none data",
                "max_cpu_time": "none data"
              });
            }
            else {
              data.push({
                "memory_avg": new Number(rows[i].memory_avg),
                "filter_time": rows[i].filter_time,
                "min_cpu_time": rows[i].min_cpu_time,
                "max_cpu_time": rows[i].max_cpu_time
              });
            }
          }
          prevTime = rows[i].filter_time;
        }
        if (rows.length < num) {
          for (var i = rows.length; i < num; i++) {
            data.push({
              "memory_avg": 0.1,
              "filter_time": "none data",
              "min_cpu_time": "none data",
              "max_cpu_time": "none data"
            });
          }
        }
        res.send(data);
      } else {
        var data = [];
        for (var i = 0; i < num; i++) {
          data.push({
            "memory_avg": 0.1,
            "filter_time": "none data"
          });
        }
        res.send(data);
      }
    });

  }
});
//Process Memory List
router.post('/process_memory_list', function(req, res, next) {
  var total_memory;
  //마지막 os 데이터의 메모리 값을 가지고 온다
  var sql = "SELECT os_memory FROM " + req.cookies.user_id + "_os WHERE datatime = (SELECT MAX(datatime) FROM " + req.cookies.user_id + "_os)";
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else if(rows.length) {
      total_memory = new Number(rows[0].os_memory);   // 총 메모리 양
      // 마지막 시간의 Process 목록을 가지고 온다
      sql = "SELECT * FROM " + req.cookies.user_id + "_process WHERE datatime =(SELECT MAX(datatime) FROM " + req.cookies.user_id + "_os) ORDER BY process_memory DESC";
      connection.query(sql, function(err, rows, fields) {
        if (err) {
          console.log(err);
        } else if(rows.length) {
          var result = [];
          for (var i = 0; i < rows.length; i++) {
            result.push({
              "name": rows[i].process_name,
              "process_id": rows[i].process_id,
              "progress_data": "<div id='progress_" + i + "' class='progress'><div class='area'><div class='bar' style='width: " + (rows[i].process_memory / total_memory) * 100 + "%'></div></div></div>",
              "data_value": rows[i].process_memory + "MB"
            });
          }
          res.send(result);
        }
        else {
          res.send([]);
        }
      });
    }
    else {
      res.send([]);
    }
  });
});
// Process Chart
router.get('/processes_chart', function(req, res, next) {
  res.render('processes_chart');
});
router.post('/processinfo', function(req, res, next) {
  // 마지막 시간의 프로세스 목록을 가지고 온다
  var sql = "SELECT * FROM " + req.cookies.user_id + "_process WHERE datatime =(SELECT MAX(datatime) FROM " + req.cookies.user_id + "_os)";
  connection.query(sql, function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else if(rows.length) {
      var result = [];
      for (var i = 0; i < rows.length; i++) {
        result.push({
          "name": rows[i].process_name,
          "process_id": new Number(rows[i].process_id),
          "process_cpu": new Number(rows[i].process_cpu),
          "process_memory": new Number(rows[i].process_memory),
          "process_thread": new Number(rows[i].thread_count)
        });
      }
      res.send(result);
    }
    else {
      res.send([]);
    }
  });
});
router.post('/process_id_data', function(req, res, next) {
  var process_id = req.body.process_id;
  var result;
  //해당 process_id의 데이터를 찾는다
  var sql = "SELECT * FROM " + req.cookies.user_id + "_process WHERE process_id=? and datatime >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) ORDER BY datatime ASC";
  connection.query(sql, [process_id], function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else if (rows.length) {
      var data = [];
      for (var i = 0; i < 3; i++) {
        data.push([]);
      }
      var name = rows[rows.length - 1].process_name;
      var key = new Date(Date.parse(new Date()) - (1000 * 60 * 5));
      var col = 0;
      for (var i = 0; i < 150; i++) {
        if (col == rows.length) {
          data[0].push({
            "process_name": name,
            "process_cpu": 0,
            "datatime": "none data"
          });
          data[1].push({
            "process_name": name,
            "process_memory": 0.1,
            "datatime": "none data"
          });
          data[2].push({
            "process_name": name,
            "process_thread": 0.1,
            "datatime": "none data"
          });
        } else if (key.toLocaleString() == rows[col].datatime) {
          data[0].push({
            "process_name": name,
            "process_cpu": new Number(rows[col].process_cpu),
            "datatime": rows[col].datatime
          });
          data[1].push({
            "process_name": name,
            "process_memory": new Number(rows[col].process_memory),
            "datatime": rows[col].datatime
          });
          data[2].push({
            "process_name": name,
            "process_thread": new Number(rows[col].thread_count),
            "datatime": rows[col].datatime
          });
          col++;
        } else if (new Date(Date.parse(key) + 1000).toLocaleString() == rows[col].datatime) {
          data[0].push({
            "process_name": name,
            "process_cpu": new Number(rows[col].process_cpu),
            "datatime": rows[col].datatime
          });
          data[1].push({
            "process_name": name,
            "process_memory": new Number(rows[col].process_memory),
            "datatime": rows[col].datatime
          });
          data[2].push({
            "process_name": name,
            "process_thread": new Number(rows[col].thread_count),
            "datatime": rows[col].datatime
          });
          col++;
          key = new Date(Date.parse(key) + 1000);
        } else if (new Date(Date.parse(key) - 1000).toLocaleString() == rows[col].datatime) {
          data[0].push({
            "process_name": name,
            "process_cpu": new Number(rows[col].process_cpu),
            "datatime": rows[col].datatime
          });
          data[1].push({
            "process_name": name,
            "process_memory": new Number(rows[col].process_memory),
            "datatime": rows[col].datatime
          });
          data[2].push({
            "process_name": name,
            "process_thread": new Number(rows[col].thread_count),
            "datatime": rows[col].datatime
          });
          col++;
          key = new Number(Date.parse(key) - 1000);
        } else {
          data[0].push({
            "process_name": name,
            "process_cpu": 0.1,
            "datatime": "none data"
          });
          data[1].push({
            "process_name": name,
            "process_memory": 0.1,
            "datatime": "none data"
          });
          data[2].push({
            "process_name": name,
            "process_thread": 0.1,
            "datatime": "none data"
          });
        }
        key = new Date(Date.parse(key) + 2000);
      }
      res.send(data);
    } else {
      var data = [];
      for (var i = 0; i < 3; i++) {
        data.push([]);
      }
      for (var i = 0; i < 150; i++) {
        data[0].push({
          "process_name": "none data",
          "process_cpu": 0,
          "datatime": "none data"
        });
        data[1].push({
          "process_name": "none data",
          "process_memory": 0.1,
          "datatime": "none data"
        });
        data[2].push({
          "process_name": "none data",
          "process_thread": 0.1,
          "datatime": "none data"
        });
      }
      res.send(data);
    }
  });

});
router.get('/dashboard', function(req, res, next) {
  res.render('dashboard');
});
router.get('/dashboard_chart', function(req, res, next) {
  res.render('dashboard_chart');
});
router.get('/logout', function(req, res, next) {
  req.cookies.destroy(function(err) {
    res.redirect('/');
  });
});
router.get('/realtime_sample', function(req, res, next) {
  res.render('realtime_sample');
});
router.get('/process_info_popup', function(req, res, next) {
  res.render('process_info_popup');
});
router.get('/process_info_min_max_popup', function(req, res, next) {
  res.render('process_info_min_max_popup');
});
//팝업 데이터 목록
router.post('/user_os_popup_data', function(req, res, next) {
  var datatime = req.body.datatime;
  var sql = "SELECT * FROM " + req.cookies.user_id + "_os WHERE datatime =?";
  connection.query(sql, [datatime], function(err, rows, fields) {
    if(err) {
      console.log(err);
    }
    else if(rows.length) {
      var result = [];
      result.push({
        "os_cpu_total": rows[0].os_cpu_total,
        "os_kernel": rows[0].os_kernel,
        "os_user": rows[0].os_user,
        "os_memory": rows[0].os_memory,
        "datatime": rows[0].datatime
      });
      res.send(result);
    }
    else {
      res.send([]);
    }
  });
});
//팝업 프로세스 목록
router.post('/process_popup_data', function(req, res, next) {
  var datatime = req.body.datatime;
  console.log(datatime);
  var sql = "SELECT * FROM " + req.cookies.user_id + "_process WHERE datatime =? ORDER BY process_cpu DESC";
  connection.query(sql, [datatime], function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      if (rows.length) {
        var result = [];
        for (var i = 0; i < rows.length; i++) {
          result.push({
            "name": rows[i].process_name,
            "process_id": new Number(rows[i].process_id),
            "process_cpu": new Number(rows[i].process_cpu),
            "process_memory": new Number(rows[i].process_memory),
            "process_thread": new Number(rows[i].thread_count)
          });
        }
        res.send(result);
      }
      else {
        res.send([]);
      }
    }
  });
});
router.post('/user_core_popup_data', function(req, res, next) {
  var datatime = req.body.datatime;
  var sql = "SELECT * FROM "+req.cookies.user_id+"_core WHERE datatime =?";
  connection.query(sql, [datatime], function(err, rows, fields) {
    if(err) {
      console.log(err);
    }
    else if(rows.length) {
      res.send(rows);
    }
    else {
      res.send([]);
    }
  });
});
router.get('/setting', function(req,res,next) {
  res.render('setting');
});
//사용자의 setting 정보 가져오기
router.post('/get_user_setting_info', function(req, res, next) {
  var sql = "SELECT cpu_threshold, memory_threshold, alarm_interval_time FROM user where id =?";
  connection.query(sql, [req.cookies.user_id], function(err, rows, fields) {
    if(err) {
      console.log(err);
    }
    else if(rows.length) {
      var result = [];
      result.push({
        "cpu_threshold" : rows[0].cpu_threshold,
        "memory_threshold" : rows[0].memory_threshold,
        "alarm_interval_time" : rows[0].alarm_interval_time
      });
      res.send(result);
    }
    else {
      res.send([]);
    }
  });
});
// setting 페이지의 alarm table 데이터 가져오기
router.post('/get_alarm_table_data', function(req, res, next) {
  var sql = "SELECT * FROM "+req.cookies.user_id+"_alarm ORDER BY datatime DESC";
  connection.query(sql, function(err, rows, fields) {
    if(err) {
      console.log(err);
    }
    else if(rows.length) {
      var result = [];
      for(var i = 0; i < rows.length; i++) {
        result.push({
          "datatime" : rows[i].datatime,
          "cpu_usage": new Number(rows[i].cpu_usage),
          "memory_usage": new Number(rows[i].memory_usage),
          "process_count": new Number(rows[i].process_count)
        });
      }
      res.send(result);
    }
    else {
      res.send([]);
    }
  });
});
router.post('/change_cpu_threshold', function(req, res, next) {
  var cpu_threshold = req.body.cpu_threshold;
  var sql = "UPDATE user SET cpu_threshold = ? WHERE id =?";
  connection.query(sql, [cpu_threshold, req.cookies.user_id], function(err, rows, fields) {
    if(err) {
      console.log(err);
      res.send("query error");
    }
    else {
      res.send("Change CPU Threshold Success!");
    }
  });
});
router.post('/change_memory_threshold', function(req, res, next) {
  var memory_threshold = req.body.memory_threshold;
  var sql = "UPDATE user SET memory_threshold=? WHERE id=?";
  connection.query(sql, [memory_threshold, req.cookies.user_id], function(err, rows, fields) {
    if(err) {
      console.log(err);
      res.send("query error");
    }
    else {
      res.send("Change Memory Threshold Success!");
    }
  });
});
router.post('/find_process_id', function(req, res, next) {
  var process_id = req.body.process_id;
  var sql = "SELECT * FROM "+req.cookies.user_id+"_process WHERE process_id =? and datatime >= (DATE_SUB(NOW(), INTERVAL 5 MINUTE))";
  connection.query(sql, [process_id], function(err, rows, fields) {
    if(err) {
      console.log(err);
    }
    else if(rows.length) {
      var data = [];
      data.push({"data_length": new Number(rows.length)});
      res.send(data);
    }
    else {
      res.send(0);
    }
  });
});
router.post('/get_user_alarm_interval_time', function(req, res, next) {
  var sql = "SELECT alarm_interval_time FROM user WHERE id =?";
  connection.query(sql, [req.cookies.user_id], function(err, rows, fields) {
    if(err) {
      console.log(err);
    }
    else if(rows.length) {
      res.send(rows);
    }
    else {
      res.send(0);
    }
  });
});
router.post('/get_count_of_interval_time', function(req, res, next) {
  var interval_time = req.body.interval_time;
  var sql = "SELECT * FROM "+req.cookies.user_id+"_alarm WHERE datatime >= DATE_SUB(NOW(), INTERVAL "+interval_time+" MINUTE)";
  connection.query(sql, function(err, rows, fields) {
    if(err) {
      console.log(err);
    }
    else if(rows.length) {
      var data = [];
      data.push({
        "count_alarm" : rows.length
      });
      res.send(data);
    }
    else {
      var data = [];
      data.push({
        "count_alarm" : 0
      });
      res.send(data);
    }
  });
});
router.post('/change_user_interval_time', function(req, res, next) {
  var setting_time = req.body.setting_interval_time;
  var sql = "UPDATE user SET alarm_interval_time=? WHERE id=?";
  connection.query(sql, [setting_time, req.cookies.user_id], function(err, rows, fields) {
    if(err) {
      console.log(err);
    }
    else {
      var data = [];
      data.push({
        "interval_time" : new Number(setting_time)
      });
      res.send(data);
    }
  });
});
// 알람 설정 안함
router.post('/disable_alarm', function(req, res, next) {
  var sql = "UPDATE user SET alarm_interval_time= 0 WHERE id=?";
  connection.query(sql, [req.cookies.user_id], function(err, rows, fields) {
    if(err) {
      console.log(err);
    }
    else {
      res.send("Disable User Alarm!");
    }
  });
});

module.exports = router;
