/*
*   차트 생성 및 차트를 표현하는 다양한 함수
*/

// 차트에 표시하기
var params = null; //url을 담을 변수
//차트를 담을 변수
var os_list = null;
var cpu_chart = null;
var cpu_summary_chart = null;
var cpu_core_chart = [];
var memory_chart = null;
var memory_summary_chart = null;
var process_cpu_chart = null;
var process_memory_chart = null;
var process_thread_chart = null;
var dashboard = null;
var x_table_1 = null;
//렌더링 데이터
var time = jui.include("util.time");
var _realtime = "minutes"; //리얼타임 변수
var _interval = 1; //인터벌 변수
var time_format = "HH:mm"; //시간 표시 형식 변수
var select_time_distance = 5; //선택한 시간->분
var _rendering_time = 2000;
//인터벌 변수
var _setTimer = null;
//차트별 데이터
var cpuData = [];
var memData = [];
var Proc_cpuData = [];
var Proc_memData = [];
var Proc_countData = [];
//프로그래스 변수
var cpu_progress = [];
//테이블
var cpu_progress_table;
var memory_progress_table;
var process_info_table;
var alarm_table;
//기타
var tooltip;
var process_id;
var process_chart_render = false;
var core_count;
var core_count_get = false;
var load_process_chart_rendering = false;
var process_table_click_event = false;
var prevTime;
var setting_interval_time = 0;
var alarm_timer = null;

//현재 접속한 유저 정보
// var id;

var selectedProcessRowName;
var process_name = "System";

//윈도우 로드
window.onload = function() {
    console.log('window onload function');
    load_window();
  }
  //해당 id값으로 차트 로드
function load_window() {
  console.log('load_window');
  params = document.location.href.split("/");
  console.log(params[3]);
  process_table_click_event = false;
  clearTimeout(_setTimer);
  if (params.length < 3 || params[3] == "os_list") {
    os_list = null;
    load_os_list();
  }
  else if (params[3] == "cpu_chart") {
    cpu_chart = null;
    cpu_summary_chart = null;
    load_cpu_chart();
    load_cpu_progressbar();
  }
  else if (params[3] == "cpu_core_chart") {
    cpu_core_chart = [];
    core_count_get = false;
    load_cpu_core_chart();
    load_cpu_progressbar();
  }
  else if (params[3] == "memory_chart") {
    memory_chart = null;
    memory_summary_chart = null;
    load_memory_chart();
    load_memory_progressbar();
  }
  else if (params[3] == "processes_chart") {
    process_info_table = null;
    process_cpu_chart = null;
    process_memory_chart = null;
    process_thread_chart = null;
    process_id = 4;
    load_process_chart_rendering = false;
    process_table_click_event = true;
    $(".process_names").html('System');
    load_process_info_table();
    load_process_chart(process_id);
  }
  else if(params[3] == "setting") {
    process_id = 4;
    process_table_click_event = true;
    process_cpu_chart = null;
    process_memory_chart = null;
    process_thread_chart = null;
    $(".process_names").html('System');

    load_alarm_table();
    load_process_chart(process_id);
  }
  change_chart();
  load_user_setting_alarm_info();
  callResize();
}


//시간 설정
function five_minute() {
  _realtime = "minutes";
  _interval = 1;
  time_format = "HH:mm";
  select_time_distance = 5;
  _rendering_time = 2000;
  for (var i = 1; i <= 7; i++) document.getElementById("btn_" + i).className = "btn normal";
  document.getElementById("btn_1").className = "btn normal focus";
  clearTimeout(_setTimer);
  change_chart();
}

function thirty_minute() {
  _realtime = "minutes";
  _interval = 5;
  time_format = "HH:mm";
  select_time_distance = 30;
  _rendering_time = 60000;
  for (var i = 1; i <= 7; i++) document.getElementById("btn_" + i).className = "btn normal";
  document.getElementById("btn_2").className = "btn normal focus";
  clearTimeout(_setTimer);
  change_chart();
}

function one_hour() {
  _realtime = "minutes";
  _interval = 10;
  time_format = "HH:mm";
  select_time_distance = 60;
  _rendering_time = 60000;
  for (var i = 1; i <= 7; i++) document.getElementById("btn_" + i).className = "btn normal";
  document.getElementById("btn_3").className = "btn normal focus";
  clearTimeout(_setTimer);
  change_chart();
}

function three_hour() {
  _realtime = "minutes";
  _interval = 30;
  time_format = "HH:mm";
  select_time_distance = 180;
  _rendering_time = 60000;
  for (var i = 1; i <= 7; i++) document.getElementById("btn_" + i).className = "btn normal";
  document.getElementById("btn_4").className = "btn normal focus";
  clearTimeout(_setTimer);
  change_chart();
}

function six_hour() {
  _realtime = "minutes";
  _interval = 60;
  time_format = "HH:mm";
  select_time_distance = 360;
  _rendering_time = 60000;
  for (var i = 1; i <= 7; i++) document.getElementById("btn_" + i).className = "btn normal";
  document.getElementById("btn_5").className = "btn normal focus";
  clearTimeout(_setTimer);
  change_chart();
}

function twelve_hour() {
  _realtime = "minutes";
  _interval = 120;
  time_format = "HH:mm";
  select_time_distance = 720;
  _rendering_time = 60000;
  for (var i = 1; i <= 7; i++) document.getElementById("btn_" + i).className = "btn normal";
  document.getElementById("btn_6").className = "btn normal focus";
  clearTimeout(_setTimer);
  change_chart();
}

function one_day() {
  _realtime = "minutes";
  _interval = 180;
  time_format = "HH:mm";
  select_time_distance = 1440;
  _rendering_time = 60000;
  for (var i = 1; i <= 7; i++) document.getElementById("btn_" + i).className = "btn normal";
  document.getElementById("btn_7").className = "btn normal focus";
  clearTimeout(_setTimer);
  change_chart();
}

//setTimeout 함수 정의
function change_chart() {
  // 24시간 이전의 데이터 삭제
  $requestDelete24Hour = $.ajax({
    url: './delete_before24hour',
    type: "POST"
  });
  $requestDelete24Hour.done(function(data) {
    console.log(data);
  });
  console.log("change_chart function");
  if (params[3] == "os_list" || params.length == 3) {
    update_os_list();
  }
  else if (params[3] == "cpu_chart") {
    update_cpu_chart();
    update_cpu_progressbar();
    console.log(cpuData.length);
  } else if (params[3] == "cpu_core_chart") {
    if (core_count_get == true) {
      update_cpu_core_chart();
      update_cpu_progressbar();
      console.log("cpu_core_chart rendering");
    }
  } else if (params[3] == "memory_chart") {
    update_memory_chart();
    update_memory_progressbar();
  } else if (params[3] == "processes_chart") {
    update_process_info_table();
    update_process_chart(process_id);

  } else if(params[3] == "setting") {

    update_alarm_table();
    update_process_chart(process_id);
  }
  _setTimer = setTimeout("change_chart()", _rendering_time);
}

//os_list 차트
function load_os_list() {
  console.log("os_list Start");
  os_list = jui.create("grid.xtable", "#os_list", {
    fields: ["server_name", "os_name", "user_name", "ip_address", "cpu_usage", "memory_usage", "core_count", "data_time"],
    resize: true,
    sort: true,
    width: 1200,
    // height: 400,
    scrollWidth: 900,
    scrollHeight: 400,
    rowHeight: 40,
    buffer: "vscroll",
    tpl: {
      row: $("#tpl_row").html(),
      none: $("#tpl_none").html()
    }
  });
  var $requestOS_List = $.ajax({
    url: "./os_list",
    type: "POST"
  });
  $requestOS_List.done(function(data) {
    os_list.update(data);
  });
}

function update_os_list() {
  var $requestOS_List = $.ajax({
    url: "./os_list",
    type: "POST"
  });
  $requestOS_List.done(function(data) {

    os_list.update(data);
  })
}

//cpu_chart
function load_cpu_chart() {
  // 실시간 cpu chart 생성
  cpu_chart = jui.create("chart.builder", "#cpu_chart_realtime", {
    height: 400,
    axis: {
      x: {
        type: "dateblock",
        domain: [new Date() - time.MINUTE * select_time_distance, new Date()],
        realtime: _realtime,
        interval: _interval,
        format: time_format,
        line: true
      },
      y: {
        type: "range",
        domain: [0, 100],
        format: function(v) {
          return v + "%";
        },
        step: 4
      }
    },
    brush: [{
      type: 'stackarea',
      target: ["os_kernel", "os_user"],
      colors: [0, 1]
    }, {
      type: "stackscatter",
      hide: true,
      size: 10,
      target: ["os_kernel", "os_user"],
      axis: 0
    }, {
      type: 'line',
      target: ["cpu_avg"]
    }],
    widget: [{
      type: 'legend'
    }, {
      type: "title",
      text: "Realtime CPU Usage ( 5 Minute )"
    }],
    event: {
      mouseover: function(obj, e) {
        console.log(obj);
        console.log("mouseover");
        var data_name = obj.datakey;
        if (obj.brush.index == 1 && select_time_distance < 10) {
          tooltip = $('.popover:eq(0)');
          tooltip.find(".head").html("CPU Data");
          tooltip.find(".body").find(".message").html("Total : " + obj.data.os_cpu_total + " %</br>Kernel : " + obj.data.os_kernel + " %</br>User : " + obj.data.os_user + " %</br>Datatime : " + obj.data.datatime + "</br>(우클릭)프로세스목록")
          tooltip.css({
            display: 'block',
            left: e.pageX - tooltip.width() / 2,
            top: e.pageY - tooltip.height() - 20
          });
        }
      },
      mouseout: function(obj, e) {
        console.log('mouseout');
        if (!obj.brush.index == 0) {
          tooltip.css({
            display: 'none'
          });
        }
      },
      rclick: function(obj, e) {
        // 우클릭
        console.log('click');
        console.log(obj.data.datatime);
        var datatime_data = obj.data.datatime;
        if (obj.brush.index == 1 && datatime_data == "none data") {
          alert('none data');
        } else if (obj.brush.index == 1 && select_time_distance < 10) {
          window.open("./process_info_popup?datatime=" + obj.data.datatime, '_blank', 'width=500, height=870');

        } else {

        }
      }
    }
  });
  // 1분 요약된 cpu summary chart 생성
  cpu_summary_chart = jui.create("chart.builder", "#cpu_chart_summary", {
    height: 400,
    axis: {
      x: {
        type: "dateblock",
        domain: [new Date() - time.MINUTE * select_time_distance, new Date()],
        realtime: _realtime,
        interval: _interval,
        format: time_format,
        line: true
      },
      y: {
        type: "range",
        domain: [0, 100],
        format: function(v) {
          return v + "%";
        },
        step: 4
      }
    },
    brush: [{
      type: 'rangearea',
      target: ["range_cpu"],
      colors: [4]
    }, {
      type: 'line',
      target: ["cpu_avg"],
      colors: [4]
    }, {
      type: "scatter",
      hide: true,
      size: 10,
      colors: [4],
      target: ["range_cpu", "cpu_avg"],
      axis: 0
    }],
    widget: {
      type: 'legend'
    },
    event: {
      mouseover: function(obj, e) {
        console.log(obj);
        console.log("mouseover");
        var data_name = obj.datakey;
        if (obj.brush.index == 2 && select_time_distance > 10) {
          tooltip = $('.popover:eq(0)');
          tooltip.find(".head").html("CPU Data");
          tooltip.find(".body").find(".message").html("AVG CPU : " + obj.data.cpu_avg + " %</br>Max CPU : " + obj.data.range_cpu[1] + " %</br>Min CPU : " + obj.data.range_cpu[0] + " %</br>Filter Time : " + obj.data.filter_time + "</br>(우클릭)프로세스목록")
          tooltip.css({
            display: 'block',
            left: e.pageX - tooltip.width() / 2,
            top: e.pageY - tooltip.height() - 20
          });
        }
      },
      mouseout: function(obj, e) {
        console.log('mouseout');
        if (!obj.brush.index == 0) {
          tooltip.css({
            display: 'none'
          });
        }
      },
      rclick: function(obj, e) {
        console.log('click');
        var datatime_data = obj.data.filter_time;
        console.log(datatime_data);
        if (obj.brush.index == 2 && datatime_data == "none data") {
          alert('none data');
        } else if (obj.brush.index == 2 && select_time_distance > 10) {
          window.open("./process_info_min_max_popup?mindatatime=" + obj.data.min_cpu_time+"&maxdatatime=" + obj.data.max_cpu_time, '_blank', 'width=900, height=830');

        } else {

        }
      }
    }
  });

  //CPU Usage ajax 통신
  var postData = {
    "distance": select_time_distance,
    "lastTime": new Date()
  };
  prevTime = postData.lastTime;
  var $requestCPUUsage = $.ajax({
    url: './cpu_usage',
    type: "POST",
    data: postData
  });
  $requestCPUUsage.done(function(data) {
    console.log(data);
    cpu_chart.axis(0).update(data);
    cpu_chart.render();
  });
}

// process cpu progressbar 생성
function load_cpu_progressbar() {
  if (params[3] == "dashboard") return;
  cpu_progress_table = jui.create("grid.xtable", "#CPU_progressbar_table", {
    fields: ["name", "process_id", "progress_data", "data_value"],
    colshow: [0, 1, 2, 3],
    sort: [0, 3],
    sortLoading: true,
    resize: true,
    buffer: "scroll",
    bufferCount: 40,
    scrollHeight: 700,
    event: {
      colmenu: function(column, e) {
        this.showColumnMenu(e.pageX - 25);
      }
    },
    tpl: {
      row: $("#tpl_row").html(),
      none: $("#tpl_none").html(),
      menu: $("#tpl_menu").html(),
      loading: $("#tpl_loading").html()
    }
  });
  var $requestProcessCPU = $.ajax({
    url: './process_cpu_list',
    type: "POST"
  });
  $requestProcessCPU.done(function(data) {
    cpu_progress_table.update(data);
  });
}

// CPU Chart Update
function update_cpu_chart() {
  console.log("update CPU chart");
  var postData = {
    "distance": select_time_distance,
    "lastTime": new Date()
  };
  prevTime = postData.lastTime;
  var $requestCPUUsage = $.ajax({
    url: './cpu_usage',
    type: "POST",
    data: postData
  });
  $requestCPUUsage.done(function(data) {
    if (select_time_distance < 10) {
      // 실시간 인 경우
      $("#cpu_chart_summary").css({
        display: 'none'
      });
      $("#cpu_chart_realtime").css({
        display: 'block'
      });
      cpu_chart.axis(0).updateGrid("x", {
        domain: [new Date() - time.MINUTE * select_time_distance, new Date()],
        interval: _interval,
        format: time_format
      });
      cpu_chart.axis(0).update(data);
      cpu_chart.render();
    } else {
      // 30분 이후 인 경우
      $("#cpu_chart_realtime").css({
        display: 'none'
      });
      $("#cpu_chart_summary").css({
        display: 'block'
      });
      cpu_summary_chart.axis(0).updateGrid("x", {
        domain: [new Date() - time.MINUTE * select_time_distance, new Date()],
        interval: _interval,
        format: time_format
      });
      cpu_summary_chart.axis(0).update(data);
      cpu_summary_chart.render(true);
    }
  });
}

// cpu progressbar update
function update_cpu_progressbar() {
  var $requestProcessCPU = $.ajax({
    url: './process_cpu_list',
    type: "POST"
  });
  $requestProcessCPU.done(function(data) {
    cpu_progress_table.update(data);
  });
}

//core_chart
function load_cpu_core_chart() {
  console.log("load cpu core");
  // 코어 갯수 가져오기
  var $requestCPU_Core_count = $.ajax({
    url: './get_cpu_core_count',
    type: "POST"
  });
  $requestCPU_Core_count.done(function(data) {
    console.log("get core count : " + data);
    core_count_get = true;
    console.log(data[0].core_count);
    core_count = new Number(data[0].core_count);
    var chart_view = $('.chart_view');
    cpu_core_chart = [];
    // 코어 갯수만큼 차트 생성
    for (var i = 0; i < core_count; i++) {
      console.log("append cpu_core_" + i);
      chart_view.append("<div class ='core_container'><div id='cpu_core_" + i + "' style='margin-left: 10px; margin-right: 10px;'></div></div>");
      cpu_core_chart[i] = jui.create("chart.builder", "#cpu_core_" + i, {
        height: 300,
        axis: {
          x: {
            type: "dateblock",
            domain: [new Date() - time.MINUTE * select_time_distance, new Date()],
            realtime: _realtime,
            interval: _interval,
            format: time_format,
            line: true
          },
          y: {
            type: "range",
            domain: [0, 100],
            format: function(v) {
              return v + " %"
            },
            step: 4
          }
        },
        brush: [{
          type: 'stackarea',
          target: ["core_kernel", "core_user"],
          clip: true,
          axis: 0
        }, {
          type: "stackscatter",
          hide: true,
          size: 10,
          target: ["core_kernel", "core_user"],
          axis: 0
        }],
        widget: [{
          type: "legend"
        }, {
          type: "title",
          text: "CPU_Core " + i
        }],
        event: {
          mouseover: function(obj, e) {
            console.log(obj);
            var core_name = obj.data.core_name;
            if (obj.brush.index == 1 && obj.data.core_name != null) {
              console.log('tooltip');
              var class_value = '.' + obj.data.core_name;
              // tooltip = $('core_container').find(class_value);
              tooltip = $('.popover:eq(0)');
              console.log(tooltip);
              tooltip.find(".head").html("CPU Core Data");
              tooltip.find(".body").find(".message").html("Core_CPU : " + obj.data.core_total + " %</br>Core_kernel : " + obj.data.core_kernel + " %</br>Core_User : " + obj.data.core_user + "</br>(우클릭)프로세스목록");
              tooltip.css({
                display: 'block',
                left: e.pageX - tooltip.width() / 2,
                top: e.pageY - tooltip.height() - 20
              });
            }
          },
          mouseout: function(obj, e) {
            if (!obj.brush.index == 0) {
              tooltip.css({
                display: 'none'
              });
            }
          },
          rclick: function(obj, e) {
            console.log('click====================');
            console.log(obj.data.datatime);
            var datatime_data = obj.data.datatime;
            if (obj.brush.index == 1 && datatime_data == "none data") {
              alert('none data');
            } else {
              window.open("./process_info_popup?datatime=" + obj.data.datatime, '_blank', 'width=500, height=870');
            }
          }
        }
      });
    }
  });
}

function update_cpu_core_chart() {
  console.log("update core chart ========================");
  var postData = {
    "distance": select_time_distance,
    "core_count": core_count,
    "lastTime": new Date()
  }
  var $requestCPU_Core_data = $.ajax({
    url: "./cpu_core_data",
    type: "POST",
    data: postData
  });
  $requestCPU_Core_data.done(function(data) {
    console.log("core data success");
    console.log(data);
    for (var i = 0; i < core_count; i++) {
      cpu_core_chart[i].axis(0).updateGrid("x", {
        domain: [new Date() - time.MINUTE * select_time_distance, new Date()],
        interval: _interval,
        format: time_format
      });
      cpu_core_chart[i].axis(0).update(data[i]);
      cpu_core_chart[i].render();
    }
  });
}

//메모리 차트
function load_memory_chart() {
  //초기 생성 시 담을 Sample_data
  var sample_data = [];
  for(var i = 0; i < 150; i++) {
    sample_data.push({
      "memdata": 0.1,
      "memory_avg": 0.1,
      "datatime": "none data"
    })
  }
  memory_chart = jui.create("chart.builder", "#memory_chart", {
    height: 400,
    axis: {
      x: {
        type: "dateblock",
        domain: [new Date() - time.MINUTE * select_time_distance, new Date()],
        realtime: _realtime,
        interval: _interval,
        format: time_format,
        line: true
      },
      y: {
        type: "range",
        domain: function(d) {
          return d.memdata * 1.2
        },
        format: function(v) {
          return v + " MB";
        },
        step: 4
      },
      data: sample_data
    },
    brush: [{
      type: 'splitarea',
      target: ["memdata"],
      clip: true,
      axis: 0,
      colors: [5]
    }, {
      type: "scatter",
      hide: true,
      size: 10,
      target: ["memdata"],
      axis: 0,
      colors: [5]
    }],
    widget: [{
      type: "legend"
    }, {
      type: "title",
      text: "Memory Usage"
    }],
    event: {
      mouseover: function(obj, e) {
        console.log(obj);
        console.log("mouseover");
        if (obj.brush.index == 1 && select_time_distance < 10) {
          tooltip = $('.popover:eq(0)');
          tooltip.find(".head").html("Memory Data");
          tooltip.find(".body").find(".message").html("data : " + obj.data.memdata + " MB</br>datatime : " + obj.data.datatime + "</br>(클릭)프로세스목록")
          tooltip.css({
            display: 'block',
            left: e.pageX - tooltip.width() / 2,
            top: e.pageY - tooltip.height() - 20
          });
        }
      },
      mouseout: function(obj, e) {
        console.log('mouseout');
        if (!obj.brush.index == 0) {
          tooltip.css({
            display: 'none'
          });
        }
      },
      rclick: function(obj, e) {
        console.log('click====================');
        console.log(obj.data.datatime);
        var datatime_data = obj.data.datatime;
        if (obj.brush.index == 1 && datatime_data == "none data") {
          alert('none data');
        } else if (obj.brush.index == 1 && select_time_distance < 10) {
          window.open("./process_info_popup?datatime=" + obj.data.datatime, '_blank', 'width=500, height=870');
        } else {
          window.open("./process_info_popup?datatime=" + obj.data.filter_time, '_blank', 'width=500, height=800');
        }
      }
    }
  });
  memory_summary_chart = jui.create("chart.builder", "#memory_chart_summary", {
    height: 400,
    axis: {
      x: {
        type: "dateblock",
        domain: [new Date() - time.MINUTE * select_time_distance, new Date()],
        realtime: _realtime,
        interval: _interval,
        format: time_format,
        line: true
      },
      y: {
        type: "range",
        domain: function(d) {
          return d.memory_avg * 1.2;
        },
        format: function(v) {
          return v + " MB";
        },
        step: 4
      },
      data: sample_data
    },
    brush: [{
      type: 'splitarea',
      target: ["memory_avg"],
      clip: true,
      axis: 0,
      colors: [10]
    }, {
      type: "scatter",
      hide: true,
      size: 10,
      target: ["memory_avg"],
      axis: 0,
      colors: [10]
    }],
    widget: {
      type: "legend"
    },
    event: {
      mouseover: function(obj, e) {
        console.log(obj);
        console.log("mouseover");
        if (obj.brush.index == 1 && select_time_distance > 10) {
          tooltip = $('.popover:eq(0)');
          tooltip.find(".head").html("Memory Data");
          tooltip.find(".body").find(".message").html("AVG Memory : " + obj.data.memory_avg + " MB</br>Filter Time : " + obj.data.filter_time + "</br>(클릭)프로세스목록");
          tooltip.css({
            display: 'block',
            left: e.pageX - tooltip.width() / 2,
            top: e.pageY - tooltip.height() - 20
          });
        }
      },
      mouseout: function(obj, e) {
        console.log('mouseout');
        if (!obj.brush.index == 0) {
          tooltip.css({
            display: 'none'
          });
        }
      },
      rclick: function(obj, e) {
        console.log('click');
        var datatime_data = obj.data.filter_time;
        console.log(datatime_data);
        if (obj.brush.index == 1 && datatime_data == "none data") {
          alert('none data');
        } else if (obj.brush.index == 1 && select_time_distance > 10) {
          window.open("./process_info_min_max_popup?mindatatime=" + obj.data.min_cpu_time+"&maxdatatime=" + obj.data.max_cpu_time, '_blank', 'width=900, height=830');

        } else {

        }
      }
    }
  });
  var postData = {
    "distance": select_time_distance,
    "lastTime": new Date()
  }
  prevTime = postData.lastTime;
  var $requestMemoryUsage = $.ajax({
    url: '/memory_chart',
    type: "POST",
    data: postData
  });
  $requestMemoryUsage.done(function(data) {
    memory_chart.axis(0).update(data);
    memory_chart.render();
  });
}

function load_memory_progressbar() {
  memory_progress_table = jui.create("grid.xtable", "#Memory_progressbar_table", {
    fields: ["name", "process_id", "progress_data", "data_value"],
    colshow: [0, 1, 2, 3],
    sort: [0, 3],
    sortLoading: true,
    resize: true,
    buffer: "scroll",
    bufferCount: 40,
    scrollHeight: 700,
    event: {
      colmenu: function(column, e) {
        this.showColumnMenu(e.pageX - 25);
      }
    },
    tpl: {
      row: $("#tpl_row").html(),
      none: $("#tpl_none").html(),
      menu: $("#tpl_menu").html(),
      loading: $("#tpl_loading").html()
    }
  });
  var $requestProcessMemory = $.ajax({
    url: './process_memory_list',
    type: "POST"
  });
  $requestProcessMemory.done(function(data) {
    memory_progress_table.update(data);
  });
}

function update_memory_chart() {
  console.log("update Memory chart");
  var postData = {
    "distance": select_time_distance,
    "lastTime": new Date()
  }
  prevTime = postData.lastTime;
  var $requestMemoryUsage = $.ajax({
    url: '/memory_chart',
    type: "POST",
    data: postData
  });
  $requestMemoryUsage.done(function(data) {
    if (select_time_distance < 10) {
      console.log("update memory");
      $("#memory_chart_summary").css({
        display: 'none'
      });
      $("#memory_chart").css({
        display: 'block'
      });
      memory_chart.axis(0).updateGrid("x", {
        domain: [new Date() - time.MINUTE * select_time_distance, new Date()],
        interval: _interval,
        format: time_format
      });
      memory_chart.axis(0).update(data);
      memory_chart.render();
    } else {
      console.log('memory summary update');
      $("#memory_chart").css({
        display: 'none'
      });
      $("#memory_chart_summary").css({
        display: 'block'
      });
      memory_summary_chart.axis(0).updateGrid("x", {
        domain: [new Date() - time.MINUTE * select_time_distance, new Date()],
        interval: _interval,
        format: time_format
      });
      memory_summary_chart.axis(0).update(data);
      memory_summary_chart.render(true);
    }
  });
}

//progress bar 테이블에 표시
function update_memory_progressbar() {
  var $requestProcessMemory = $.ajax({
    url: './process_memory_list',
    type: "POST"
  });
  $requestProcessMemory.done(function(data) {
    memory_progress_table.update(data);
  });
}

//프로세스 차트 로더
function load_process_info_table() {
  process_info_table = jui.create("grid.xtable", "#process_info_table", {
    fields: ["name", "process_id", "process_cpu", "process_memory", "process_thread"],
    colshow: [0, 1, 2, 3, 4],
    sort: [0, 1, 2, 3, 4],
    sortLoading: true,
    sortCache: true,
    resize: true,
    buffer: "scroll",
    bufferCount: 40,
    scrollHeight: 700,
    tpl: {
      row: $("#tpl_row").html(),
      none: $("#tpl_none").html(),
      loading: $("#tpl_loading").html()
    },
    event: {
      select: function(row, e) {
        selectedProcessRowName = row.data.process_id;
        process_name = row.data.name;
        if(process_table_click_event) {
          $(this.root).find("tbody tr").removeClass("selected");
          $(row.element).addClass("selected");
          $(".process_names").html(row.data.name);
        }

        console.log(row.data);
        process_id = row.data.process_id;
        update_process_chart(process_id);
      }
    }
  });
  var $requestProcessInfo = $.ajax({
    url: './processinfo',
    type: "POST"
  });
  $requestProcessInfo.done(function(data) {
    process_info_table.update(data);
  });
}

function update_process_info_table() {
  var $requestProcessInfo = $.ajax({
    url: './processinfo',
    type: "POST"
  });
  $requestProcessInfo.done(function(data) {
    process_info_table.update(data);
  });
}

function load_process_chart(pid) {
  console.log("load process chart start");
  // 해당 process id 를 가지고 cpu, memory. thread 차트를 만듬
  var sample_data = [];
  for(var i = 0; i < 3; i++) {
    sample_data.push([]);
  }
  for(var i = 0; i < 150; i++) {
    sample_data[0].push({"process_cpu": 0, "datatime": "none data"});
    sample_data[1].push({"process_memory": 0.1, "datatime": "none data"});
    sample_data[2].push({"process_thread": 0.1, "datatime": "none data"});
  }
  process_cpu_chart = jui.create("chart.builder", "#process_cpu_chart", {
    height: 225,
    axis: {
      x: {
        type: "dateblock",
        domain: [new Date - time.MINUTE * select_time_distance, new Date()],
        realtime: _realtime,
        interval: _interval,
        format: time_format,
        line: true
      },
      y: {
        type: "range",
        domain: [0, 100],
        format: function(v) {
          return v + ' %';
        },
        step: 4
      },
      data : sample_data[0]
    },
    brush: [{
      type: 'splitarea',
      target: ["process_cpu"],
      clip: true,
      axis: 0,
      colors: [2]
    }, {
      type: "scatter",
      hide: true,
      size: 10,
      target: ["process_cpu"],
      axis: 0,
      colors:[2]
    }],
    widget: {
      type: "legend"
    },
    event: {
      mouseover: function(obj, e) {
        console.log(obj);
        console.log("mouseover");
        console.log(obj.dataKey);
        if (obj.brush.index == 1) {
          tooltip = $('.popover:eq(0)');
          tooltip.find(".head").html(process_name + " CPU Data");
          tooltip.find(".body").find(".message").html("Process CPU : " + obj.data.process_cpu + " %</br>datatime : " + obj.data.datatime);
          console.log(tooltip);
          tooltip.css({
            display: 'block',
            left: e.pageX - tooltip.width() / 2,
            top: e.pageY - tooltip.height() - 20
          });
        }
      },
      mouseout: function(obj, e) {
        console.log('mouseout');
        if (!obj.brush.index == 0) {
          tooltip.css({
            display: 'none'
          });
        }
      }
    }
  });
  process_memory_chart = jui.create("chart.builder", "#process_memory_chart", {
    height: 225,
    axis: {
      x: {
        type: "dateblock",
        domain: [new Date - time.MINUTE * select_time_distance, new Date()],
        realtime: _realtime,
        interval: _interval,
        format: time_format,
        line: true
      },
      y: {
        type: "range",
        // domain: [0, 1024],
        domain: function(d) {
          return d.process_memory * 1.2;
        },
        format: function(v) {
          return v + ' MB';
        },
        step: 4
      },
      data : sample_data[1]
    },
    brush: [{
      type: 'splitarea',
      target: ["process_memory"],
      clip: true,
      axis: 0,
      colors: [3]
    }, {
      type: "scatter",
      hide: true,
      size: 10,
      target: ["process_memory"],
      axis: 0,
      colors: [3]
    }],
    widget: {
      type: "legend"
    },
    event: {
      mouseover: function(obj, e) {
        console.log(obj);
        console.log("mouseover");
        console.log(obj.dataKey);
        if (obj.brush.index == 1) {
          tooltip = $('.popover:eq(0)');
          tooltip.find(".head").html(process_name + " Memory Data");
          tooltip.find(".body").find(".message").html("Process Memory : " + obj.data.process_memory + " MB</br>datatime : " + obj.data.datatime);
          console.log(tooltip);
          tooltip.css({
            display: 'block',
            left: e.pageX - tooltip.width() / 2,
            top: e.pageY - tooltip.height() - 20
          });
        }
      },
      mouseout: function(obj, e) {
        console.log('mouseout');
        if (!obj.brush.index == 0) {
          tooltip.css({
            display: 'none'
          });
        }
      }
    }
  });
  process_thread_chart = jui.create("chart.builder", "#process_thread_chart", {
    height: 225,
    axis: {
      x: {
        type: "dateblock",
        domain: [new Date - time.MINUTE * select_time_distance, new Date()],
        realtime: _realtime,
        interval: _interval,
        format: time_format,
        line: true
      },
      y: {
        type: "range",
        domain: function(d) {
          return d.process_thread * 1.2;
        },
        step: 4
      },
      data : sample_data[2]
    },
    brush: [{
      type: 'splitarea',
      target: ["process_thread"],
      clip: true,
      axis: 0,
      colors: [4]
    }, {
      type: "scatter",
      hide: true,
      size: 10,
      target: ["process_thread"],
      axis: 0,
      colors: [4]
    }],
    widget: {
      type: "legend"
    },
    event: {
      mouseover: function(obj, e) {
        console.log(obj);
        console.log("mouseover");
        if (obj.brush.index == 1 ) {
          tooltip = $('.popover:eq(0)');
          tooltip.find(".head").html(process_name + " Thread Data");
          tooltip.find(".body").find(".message").html("Process Thread : " + obj.data.process_thread + "</br>datatime : " + obj.data.datatime);
          tooltip.css({
            display: 'block',
            left: e.pageX - tooltip.width() / 2,
            top: e.pageY - tooltip.height() - 20
          });
        }
      },
      mouseout: function(obj, e) {
        console.log('mouseout');
        if (!obj.brush.index == 0) {
          tooltip.css({
            display: 'none'
          });
        }
      }
    }
  });
  var postData = {
    "process_id": pid
  }
  var $requestProcessIDdata = $.ajax({
    url: './process_id_data',
    type: "POST",
    data: postData
  });
  $requestProcessIDdata.done(function(data) {
    process_cpu_chart.axis(0).update(data[0]);
    process_cpu_chart.render(true);

    process_memory_chart.axis(0).update(data[1]);
    process_memory_chart.render(true);

    process_thread_chart.axis(0).update(data[2]);
    process_thread_chart.render(true);
  });
  $requestProcessIDdata.fail(function(jqXHR, textStatus) {
    console.log(jqXHR);
    console.log(textStatus);
  });
}

function update_process_chart(pid) {
  console.log(pid);
  var postData = {
    "process_id": pid
  }

  var $requestProcessIDdata = $.ajax({
    url: './process_id_data',
    type: "POST",
    data: postData
  });
  $requestProcessIDdata.done(function(data) {
    console.log("process chart update");
    console.log(data);
    $(".process_names").html(data[0][data.length - 1].process_name);
    process_cpu_chart.axis(0).updateGrid("x", {
      domain: [new Date() - time.MINUTE * select_time_distance, new Date()],
      interval: _interval,
      format: time_format
    });
    process_cpu_chart.axis(0).update(data[0]);
    process_cpu_chart.render();

    process_memory_chart.axis(0).updateGrid("x", {
      domain: [new Date() - time.MINUTE * select_time_distance, new Date()],
      interval: _interval,
      format: time_format
    });
    process_memory_chart.axis(0).update(data[1]);
    process_memory_chart.render();

    process_thread_chart.axis(0).updateGrid("x", {
      domain: [new Date() - time.MINUTE * select_time_distance, new Date()],
      interval: _interval,
      format: time_format
    });
    process_thread_chart.axis(0).update(data[2]);
    process_thread_chart.render();
  });
  $requestProcessIDdata.fail(function(jqXHR, textStatus) {
    console.log(jqXHR);
    console.log(textStatus);
  });
}

// find user setting alarm info
function load_user_setting_alarm_info() {
  $requestUserSettingInfo = $.ajax({
    url: './get_user_setting_info',
    type:"POST"
  });
  $requestUserSettingInfo.done(function(data) {
    if(params[3] == "setting") {
      $("#cpu_threshold_data").html(data[0].cpu_threshold);
      $("#memory_threshold_data").html(data[0].memory_threshold);
      if(data[0].alarm_interval_time > 0) {
        $("#alarm_interval_time_data").html(data[0].alarm_interval_time + " Minute");
        clearTimeout(alarm_timer);
        setting_interval_time = data[0].alarm_interval_time;
        alarm_loop();
      }
      else {
        $("#alarm_interval_time_data").html("No Alarm!");
        clearTimeout(alarm_timer);
      }
    }
    else {
      if(data[0].alarm_interval_time > 0 && alarm_timer == null) {
        clearTimeout(alarm_timer);
        setting_interval_time = data[0].alarm_interval_time;
        alarm_loop();
      }
      else if(data[0].alarm_interval_time == 0) {
        clearTimeout(alarm_timer);
      }
    }
  });
}
//load alarm table
function load_alarm_table() {
  alarm_table = jui.create("grid.xtable", "#alarm_table", {
    fields: ["datatime", "cpu_usage", "memory_usage", "process_count"],
    colshow: [0, 1, 2, 3],
    sort: [0, 1, 2, 3],
    sortLoading: true,
    sortCache: true,
    resize: true,
    buffer: "scroll",
    bufferCount: 20,
    scrollHeight: 320,
    tpl: {
      row: $("#tpl_row").html(),
      none: $("#tpl_none").html()
    },
    event: {
      select: function(row, e) {
        if(process_table_click_event) {
          $(this.root).find("tbody tr").removeClass("selected");
          $(row.element).addClass("selected");
        }
        window.open("./process_info_popup?datatime=" + row.data.datatime, '_blank', 'width=500, height=870');
      }
    }
  });
  var $requestAlarmTable_data = $.ajax({
    url: './get_alarm_table_data',
    type: "POST"
  });
  $requestAlarmTable_data.done(function(data) {
    alarm_table.update(data);
  });
  $requestAlarmTable_data.fail(function(jqXHR, textStatus) {
    console.log(jqXHR);
    console.log(textStatus);
  });
}
//change user cpu threshold
function change_user_cpu_threshold() {
  var setting_cpu = $("#cpu_threshold").val();
  if(setting_cpu == "") {
    alert("threshold is not exist.");
  }
  else {
    var postData = {
      "cpu_threshold": setting_cpu
    }
    var $requestChangeCPUThreshold = $.ajax({
      url: './change_cpu_threshold',
      type: "POST",
      data: postData
    });
    $requestChangeCPUThreshold.done(function(data) {
      $("#cpu_threshold_data").html(setting_cpu);
      alert(data);
    });
  }
}
//change user memory threshold
function change_user_memory_threshold() {
  var setting_memory = $("#memory_threshold").val();
  if(setting_memory == "") {
    alert("threshold is not exist.");
  }
  else {
    var postData = {
      "memory_threshold": setting_memory
    }
    var $requestChangeMemoryThreshold = $.ajax({
      url: './change_memory_threshold',
      type: "POST",
      data: postData
    });
    $requestChangeMemoryThreshold.done(function(data) {
      $("#memory_threshold_data").html(setting_memory);
      alert(data);
    });
  }
}

//update alarm table
function update_alarm_table() {
  $requestUpdateAlarmTable = $.ajax({
    url: './get_alarm_table_data',
    type: "POST"
  });
  $requestUpdateAlarmTable.done(function(data) {
    alarm_table.update(data);
  });
  $requestUpdateAlarmTable.fail(function(jqXHR, textStatus) {
    console.log(jqXHR);
    console.log(textStatus);
  });
}
//call update process chart
function call_update_process_chart() {
  console.log("call up date process chart function");
  var temp = $("#pid").val();
  if(temp == "") {
    alert("input process id.");
  }
  else {
    var postData = {
      "process_id" : temp
    }
    var $requestFindProcess_id = $.ajax({
      url: './find_process_id',
      type: "POST",
      data: postData
    });
    $requestFindProcess_id.done(function(data) {
      if(data[0].data_length > 0) {
        // alert("find process id" + data)
        console.log("find process id");
        process_id = temp;
        update_process_chart(process_id);
      }
      else if(data[0].data_length == 0) {
        console.log("none data");
        alert("process id is not exist.")
      }
    });
  }
}

function change_user_interval_time() {
  var temp = $("#interval_time").val();
  if(temp == "" || temp == 0) {
    alert("none data");
  }
  else {
    var postData = {
      "setting_interval_time" : temp
    }
    var $requestchange_user_interval_time = $.ajax({
      url: '/change_user_interval_time',
      type: "POST",
      data: postData
    });
    $requestchange_user_interval_time.done(function(data) {
      $("#alarm_interval_time_data").html(temp + " Minute");
      setting_interval_time = data[0].interval_time;
      clearTimeout(alarm_timer);
      alarm_loop();
      alert("change interval alarm time!");
    });
  }
}

function disable_alarm() {
  $requestDisable_alarm = $.ajax({
    url: './disable_alarm',
    type: "POST"
  });
  $requestDisable_alarm.done(function(data) {
    clearTimeout(alarm_timer);
    setting_interval_time = 0;
    $("#alarm_interval_time_data").html("No Alarm.")
    alert(data);
  });
}

// 설정한 알람을 돌리는 timeout 객체 생성
function alarm_loop() {
  if(setting_interval_time != 0) {
    var postData = {
      "interval_time" : setting_interval_time
    }
    var $requestCountAlarmofIntervalTime = $.ajax({
      url : './get_count_of_interval_time',
      type: "POST",
      data: postData
    });
    $requestCountAlarmofIntervalTime.done(function(data) {
      //알람하는 코드 작성
      var count_alarm = data[0].count_alarm;
      console.log("count_alarm data : " + count_alarm);
      if(count_alarm > 0) {
        var icon = "images/alarm_image.JPG";
        var noti_title = "System Monitering Alarm";
        var noti_contents = count_alarm;
        if(!"Notification" in window) {
          alert("This browser does not support desktop notification.");
        }
        else if(Notification.permission == "granted") {
          var notification = new Notification("Wornning Count : " + count_alarm);
        }
        else if(Notification.permission !== "denied") {
          Notification.requestPermission(function (permission) {
            if(!('permission' in Notification)) {
              Notification.permission = permission;
            }
            if(permission == "granted") {
              var notification = new Notification("Wornning Count : " + count_alarm);
            }
          });
        }
      }
      // Timer
      alarm_timer = setTimeout("alarm_loop()", setting_interval_time * 60000);
    });
  }
  else {
    clearTimeout(alarm_timer);
  }
}
