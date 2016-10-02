/*
*   프론트 페이지에 속한 버튼 함수들
*/

function move_signup() {
  console.log("move_signup clicked");
  location.href = "./signup";
}

function login() {
  console.log('login function');
  var id = $('#input_id').val();
  var pw = $('#input_pw').val();
  if(id == '' || pw == '') {
    alert('ID와 Password를 정확히 입력해 주세요.');
    return;
  }
  var postData = {
    "id": id,
    "pw": pw
  }
  $.ajax({
    url: "./login",
    type: "POST",
    data: postData,
    success: function(data) {
      if(data == 0) {
        alert('비밀번호가 틀렸습니다.');
        location.href = "./login";
        return;
      }
      else if(data == 1) {
        alert('없는 아이디 입니다.');
        location.href ="./login";
        return;
      }
      else if(data == 2 || data == 3) {
        if(data == 2) {
          location.href = "./download";
          return;
        }
        else if(data == 3){
          location.href = "./chart";
          return;
        }
      }
    }
  });
}

// SignUp page 아이디 중복 체크
function chk_db() {
  var id_data = $('#input_id').val();
  var postData = {
    "input_id": id_data
  };
  console.log(id_data);
  $.ajax({
    url: "./users/sample",
    type: "POST",
    data: postData,
    success: function(data) {
      console.log("response data : " + data);
      if (data == 1) {
        alert("중복");
      } else {
        alert('사용 가능');
      }
    }
  });
}

function go_signup() {
  console.log("go signup function");
  var id_data = $('#input_id').val();
  var pw_data = $('#input_pw').val();
  var pwc_data = $('#input_pwc').val();
  var email_data = $('#input_email').val();

  if(pw_data != pwc_data) {
    alert('비밀번호 불일치');
  }
  else {
    var postData = {"user_id" : id_data, "user_pw" : pw_data, "email" : email_data};
    var $requestSignUp = $.ajax({
      url: "./users/signup",
      type: "POST",
      data: postData
    });
    $requestSignUp.done(function(data) {
      if(data == 'err') {
        alert('오류가 발생했습니다. 다시 시도해 주세요.');
      }
      else if(data == 'same') {
        alert('아이디 중복입니다.');
      }
      else if(data == 'success') {
        alert(postData.user_id + '님, 환영합니다.');
        location.href = "./login";
      }
    });
    //오류 발생 시
    $requestSignUp.fail(function(jqXHR, textStatus) {
      console.log(jqXHR);
      console.log(textStatus);
    });
  }
}

// 팝업 창 process table 만들기
function load_process_info_popup(datatime, popup_type) {
  console.log("load process info popup function");
  var id_type;
  if(popup_type == "min") id_type = "_min";
  else if(popup_type == "max") id_type = "_max";
  else id_type = "";
  var process_info_popup_table = jui.create("grid.xtable", "#process_info_popup_table" + id_type, {
    fields: ["name", "process_id", "process_cpu", "process_memory", "process_thread"],
    colshow: [0, 1, 2, 3, 4],
    sort: [0, 1, 2, 3, 4],
    sortLoading: true,
    resize: true,
    buffer: "scroll",
    bufferCount: 50,
    sortCache: true,
    scrollHeight: 650,
    tpl: {
      row: $("#tpl_row").html(),
      none: $("#tpl_none").html(),
      loading: $("#tpl_loading").html()
    }
  });
  var postData = {
    "datatime": datatime
  }
  var $requestProcess_popup = $.ajax({
    url: './process_popup_data',
    type: "POST",
    data: postData
  });
  $requestProcess_popup.done(function(data){
    process_info_popup_table.update(data);
  });
}

//팝업 창 os 정보 만들기
function load_user_os_popup(datatime, popup_type) {
  var postData = {
    "datatime": datatime
  }
  var $requestUserOS_popup = $.ajax({
    url: './user_os_popup_data',
    type: "POST",
    data: postData
  });
  var id_type;
  if(popup_type == "min") id_type = "_min";
  else if(popup_type == "max") id_type = "_max";
  else id_type = "";
  $requestUserOS_popup.done(function(data) {
    $("#time_info" + id_type).html(
      "<p>CPU Total : "+data[0].os_cpu_total+" %, CPU Kernel : "+data[0].os_kernel+" %, CPU User : "+data[0].os_user+"</p>" +
      "<p>Memory : "+data[0].os_memory+"</p>" +
      "<p>DataTime : "+data[0].datatime+"</p>"
      );
  });
}

function load_user_core_popup(datatime, popup_type) {
  var postData = {
    "datatime": datatime
  }
  var $requestUserCore_popup = $.ajax({
    url: './user_core_popup_data',
    type: "POST",
    data: postData
  });
  var id_type;
  if(popup_type == "min") id_type = "_min";
  else if(popup_type == "max") id_type = "_max";
  else id_type = "";
  $requestUserCore_popup.done(function(data) {
    for(var i = 0; i < data.length; i++) {
      alert(i);
      $("#core_info" + id_type).append(
        "<small>Core " + i + " Total : " + data[i].core_total+" %, Kernel : " + data[i].core_kernel + " %, User : " + data[i].core_user+" %</small></br>"
      );
    }
  });
}

//다운로드 버튼
function download() {
  window.open('/download_program');
  location.href = './login';
}

function call_download() {
  location.href = './download';
}
