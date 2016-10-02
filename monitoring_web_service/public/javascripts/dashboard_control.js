var realtime_cpu_chart;
var avg_cpu_chart;
var realtime_memory_chart;
var avg_memory_chart;
var core_chart = [];
var process_cpu_chart;
var process_memory_chart;
var process_thread_chart;
var process_info_table;

var realtime_cpu_data;
var avg_cpu_data;
var realtime_memory_data;
var avg_memory_data;
var core_data = [];
var process_cpu_data;
var process_memory_data;
var process_thread_data;

var time = jui.include("util.time");
var _realtime = "minutes"; //리얼타임 변수
var _interval = 1; //인터벌 변수
var time_format = "HH:mm"; //시간 표시 형식 변수

var lastTime;
var realtime_setTimer;
var avg_setTimer;

var process_id = 4;
var selectedProcessRowName;
var process_name = "System";

window.onload = function() {
  load_realtime_cpu_chart();
  load_avg_cpu_chart();
  load_realtime_memory_chart();
  load_avg_memory_chart();
  load_process_chart(process_id);
  load_process_info_table();

  $(".process_names").html("System");

  update_realtime_chart();
  update_avg_chart();
}

function update_realtime_chart() {
  update_realtime_cpu_chart();
  update_realtime_memory_chart();
  update_process_chart(process_id);
  update_process_info_table();
  realtime_setTimer = setTimeout("update_realtime_chart()", 2000);
}

function update_avg_chart() {
  update_avg_cpu_chart();
  update_avg_memory_chart();
  avg_setTimer = setTimeout("update_avg_chart()", 60000);
}

function load_realtime_cpu_chart() {
  realtime_cpu_chart = jui.create("chart.builder", "#realtime_cpu_chart", {
    height: 225,
    axis: {
      x: {
        type: "dateblock",
        domain: [new Date() - time.MINUTE * 5, new Date()],
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
      text: "Realtime CPU Usage"
    }],
    event: {
      mouseover: function(obj, e) {
        console.log(obj);
        console.log("mouseover");
        var data_name = obj.datakey;
        if (obj.brush.index == 1) {
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
        } else if (obj.brush.index == 1) {
          window.open("./process_info_popup?datatime=" + obj.data.datatime, '_blank', 'width=500, height=870');

        } else {

        }
      }
    }
  });
  var postData = {
    "distance": 5,
    "lastTime": new Date()
  }
  prevTime = postData.lastTime;
  var $requestCPUUsage = $.ajax({
    url: './cpu_usage',
    type: "POST",
    data: postData
  });
  $requestCPUUsage.done(function(data) {
    console.log(data);
    realtime_cpu_chart.axis(0).update(data);
    realtime_cpu_chart.render();
  });
}

function load_avg_cpu_chart() {
  avg_cpu_chart = jui.create("chart.builder", "#avg_cpu_chart", {
    height: 225,
    axis: {
      x: {
        type: "dateblock",
        domain: [new Date() - time.MINUTE * 30, new Date()],
        realtime: "minutes",
        interval: 5,
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
    widget: [{
      type: 'legend'
    }, {
      type: "title",
      text: "Average CPU Usage"
    }],
    event: {
      mouseover: function(obj, e) {
        console.log(obj);
        console.log("mouseover");
        var data_name = obj.datakey;
        if (obj.brush.index == 2) {
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
        } else if (obj.brush.index == 2) {
          window.open("./process_info_min_max_popup?mindatatime=" + obj.data.min_cpu_time+"&maxdatatime=" + obj.data.max_cpu_time, '_blank', 'width=900, height=830');

        } else {

        }
      }
    }
  });
  var postData = {
    "distance": 30,
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
    avg_cpu_chart.axis(0).update(data);
    avg_cpu_chart.render();
  });
}

function load_realtime_memory_chart() {
  var sample_data = [];
  for(var i = 0; i < 150; i++) {
    sample_data.push({
      "memdata": 0.1,
      "memory_avg": 0.1,
      "datatime": "none data"
    });
  }
  realtime_memory_chart = jui.create("chart.builder", "#realtime_memory_chart", {
    height: 225,
    axis: {
      x: {
        type: "dateblock",
        domain: [new Date() - time.MINUTE * 5, new Date()],
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
      text: "Realtime Memory Usage"
    }],
    event: {
      mouseover: function(obj, e) {
        console.log(obj);
        console.log("mouseover");
        if (obj.brush.index == 1) {
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
        } else if (obj.brush.index == 1) {
          window.open("./process_info_popup?datatime=" + obj.data.datatime, '_blank', 'width=500, height=870');
        } else {
          window.open("./process_info_popup?datatime=" + obj.data.filter_time, '_blank', 'width=500, height=800');
        }
      }
    }
  });
  var postData = {
    "distance": 5,
    "lastTime": new Date()
  }
  prevTime = postData.lastTime;
  var $requestMemoryUsage = $.ajax({
    url: '/memory_chart',
    type: "POST",
    data: postData
  });
  $requestMemoryUsage.done(function(data) {
    realtime_memory_chart.axis(0).update(data);
    realtime_memory_chart.render();
  });
}

function load_avg_memory_chart() {
  var sample_data = [];
  for(var i = 0; i < 30; i++) {
    sample_data.push({
      "memdata": 0.1,
      "memory_avg": 0.1,
      "datatime": "none data"
    });
  }
  avg_memory_chart = jui.create("chart.builder", "#avg_memory_chart", {
    height: 225,
    axis: {
      x: {
        type: "dateblock",
        domain: [new Date() - time.MINUTE * 30, new Date()],
        realtime: "minutes",
        interval: 5,
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
    widget: [{
      type: "legend"
    }, {
      type: "title",
      text: "Average Memory Usage"
    }],
    event: {
      mouseover: function(obj, e) {
        console.log(obj);
        console.log("mouseover");
        if (obj.brush.index == 1) {
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
        } else if (obj.brush.index == 1) {
          window.open("./process_info_min_max_popup?mindatatime=" + obj.data.min_cpu_time+"&maxdatatime=" + obj.data.max_cpu_time, '_blank', 'width=900, height=830');

        } else {

        }
      }
    }
  });
  var postData = {
    "distance": 30,
    "lastTime": new Date()
  }
  prevTime = postData.lastTime;
  var $requestMemoryUsage = $.ajax({
    url: '/memory_chart',
    type: "POST",
    data: postData
  });
  $requestMemoryUsage.done(function(data) {
    avg_memory_chart.axis(0).update(data);
    avg_memory_chart.render();
  });
}

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
    scrollHeight: 811,
    tpl: {
      row: $("#tpl_row").html(),
      none: $("#tpl_none").html(),
      loading: $("#tpl_loading").html()
    },
    event: {
      select: function(row, e) {
        selectedProcessRowName = row.data.process_id;
        process_name = row.data.name;
        $(this.root).find("tbody tr").removeClass("selected");
        $(row.element).addClass("selected");
        $(".process_names").html(row.data.name);

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
        domain: [new Date - time.MINUTE * 5, new Date()],
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
    widget: [{
      type: "legend"
    }, {
      type: "title",
      text: "Process CPU Usage"
    }],
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
        domain: [new Date - time.MINUTE * 5, new Date()],
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
    widget: [{
      type: "legend"
    }, {
      type: "title",
      text: "Process Memory Usage"
    }],
    event: {
      mouseover: function(obj, e) {
        console.log(obj);
        console.log("mouseover");
        console.log(obj.dataKey);
        if (obj.brush.index == 1 ) {
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
        domain: [new Date - time.MINUTE * 5, new Date()],
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
    widget: [{
      type: "legend"
    }, {
      type: "title",
      text: "Process Thread Count"
    }],
    event: {
      mouseover: function(obj, e) {
        console.log(obj);
        console.log("mouseover");
        if (obj.brush.index == 1) {
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

function update_realtime_cpu_chart() {
  var postData = {
    "distance": 5,
    "lastTime": new Date()
  };
  prevTime = postData.lastTime;
  var $requestCPUUsage = $.ajax({
    url: './cpu_usage',
    type: "POST",
    data: postData
  });
  $requestCPUUsage.done(function(data) {
    realtime_cpu_chart.axis(0).updateGrid("x", {
      domain: [new Date() - time.MINUTE * 5, new Date()],
      interval: 1,
      format: time_format
    });
    realtime_cpu_chart.axis(0).update(data);
    realtime_cpu_chart.render();
  });
}

function update_avg_cpu_chart() {
  var postData = {
    "distance": 30,
    "lastTime": new Date()
  };
  prevTime = postData.lastTime;
  var $requestCPUUsage = $.ajax({
    url: './cpu_usage',
    type: "POST",
    data: postData
  });
  $requestCPUUsage.done(function(data) {
    avg_cpu_chart.axis(0).updateGrid("x", {
      domain: [new Date() - time.MINUTE * 30, new Date()],
      interval: 5,
      format: time_format
    });
    avg_cpu_chart.axis(0).update(data);
    avg_cpu_chart.render(true);
  });
}

function update_realtime_memory_chart() {
  var postData = {
    "distance": 5,
    "lastTime": new Date()
  }
  prevTime = postData.lastTime;
  var $requestMemoryUsage = $.ajax({
    url: '/memory_chart',
    type: "POST",
    data: postData
  });
  $requestMemoryUsage.done(function(data) {
      realtime_memory_chart.axis(0).updateGrid("x", {
        domain: [new Date() - time.MINUTE * 5, new Date()],
        interval: 1,
        format: time_format
      });
      realtime_memory_chart.axis(0).update(data);
      realtime_memory_chart.render();
  });
}

function update_avg_memory_chart() {
  var postData = {
    "distance": 30,
    "lastTime": new Date()
  }
  prevTime = postData.lastTime;
  var $requestMemoryUsage = $.ajax({
    url: '/memory_chart',
    type: "POST",
    data: postData
  });
  $requestMemoryUsage.done(function(data) {
      avg_memory_chart.axis(0).updateGrid("x", {
        domain: [new Date() - time.MINUTE * 30, new Date()],
        interval: 5,
        format: time_format
      });
      avg_memory_chart.axis(0).update(data);
      avg_memory_chart.render();
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
      domain: [new Date() - time.MINUTE * 5, new Date()],
      interval: _interval,
      format: time_format
    });
    process_cpu_chart.axis(0).update(data[0]);
    process_cpu_chart.render();

    process_memory_chart.axis(0).updateGrid("x", {
      domain: [new Date() - time.MINUTE * 5, new Date()],
      interval: _interval,
      format: time_format
    });
    process_memory_chart.axis(0).update(data[1]);
    process_memory_chart.render();

    process_thread_chart.axis(0).updateGrid("x", {
      domain: [new Date() - time.MINUTE * 5, new Date()],
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

function update_process_info_table() {
  var $requestProcessInfo = $.ajax({
    url: './processinfo',
    type: "POST"
  });
  $requestProcessInfo.done(function(data) {
    process_info_table.update(data);
  });
}
