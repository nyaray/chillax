var $db = $.couch.db("chillax");
var currentProject = "inbox";

function writeTask(task, callback) {
  $db.saveDoc(task, {"success":callback});
}

function updateTask(task, callback) {
  // do smart stuff
  $db.openDoc(task.id, {"success": function(oldTask) {
    var storeTask = {};
    storeTask._id     = oldTask._id;
    storeTask._rev    = oldTask._rev;
    storeTask.type    = "task";
    storeTask.name    = task.name;
    storeTask.project = task.project;

    if (task.due && typeof(task.due) == "string" && task.due != "")
      storeTask.due = task.due;

    if (task.desc && typeof(task.desc) == "string" && task.desc != "")
      storeTask.desc = task.desc;

    if (task.complete && task.complete == true)
      storeTask.complete = task.complete;

    //console.log(storeTask);
    writeTask(storeTask, callback);
  }});
}

function refreshProjectList() {
  var projectListRefresher = function(data) {
    for (i in data.rows) {
      var id   = data.rows[i].id;
      var name = data.rows[i].value;
      var html =
        '<li><a class="projectlink" id="'+id+'" href="#">'+name+'</a></li>';
      $('#projectlist').append(html);
      dbg.prepend("added row for:"+id+", "+name+"<br />");
    }

    $('.projectlink').click(function() {
      var id = $(this).attr('id');
      changeProject(id, $(this).html());

      return false;
    });
  };

  $("#projectlist").empty();
  $db.view('chillax/projects',
    {"success": projectListRefresher});
}

function generateTasklistItems(rows) {
  var tasklistItems = "";

  for (i in rows) {
    var payload  = rows[i].value;

    var id       = rows[i].id;
    var name     = payload.name;
    var due      = (payload.due)? payload.due: "";
    var desc     = (payload.desc)? payload.desc: "";
    var complete = (payload.complete && payload.complete == true)?
      payload.complete: false;
    
    var completeStr = ((complete)? "checked ": "");
    var html =
      '<li class="task" id="'+ id +'">'+
      '  <input class="taskcompleted" type="checkbox" '+
      '    value="complete" '+ completeStr +'/>'+
      '  <span class="taskname">'+ name +'</span>'+
      '  <span class="taskend">'+
        ((due != "")? '<span class="taskdue">'+due+'</span>': "")+
      '    <span class="taskdelete">x</span>'+
      '  </span>'+
        ((desc != "")? '<span class="taskdesc">'+desc+'</span>': "")+
      '</li>'+
      '<li class="taskeditor">'+
      '  <form>'+
      '    <h4>Edit task</h4>'+
      '    <input class="editcomplete" type="checkbox" '+
      '      value="complete" '+ completeStr +'/>'+
      '    <input placeholder="Name" class="editname" '+
      '      value="'+ name +'" type="text" />'+
      '    <input placeholder="Due" class="editdue" '+
      '      value="'+ due +'" type="text" /><br>'+
      '    <textarea placeholder="Description" class="editdesc"'+
      '      name="editdesc" type="text">'+ desc +'</textarea><br> '+
      '    <button type="button" class="editsubmit">Save</button>'+
      '    <button type="button" class="editcancel">Cancel</button>'+
      '  </form>'+
      '</li>';

    tasklistItems += html;
  }

  return tasklistItems;
}

function refreshTaskList() {
  $('#tasklist').empty();

  $db.view('chillax/projecttasks', {
    "key":currentProject,
    "error":function() {
      $("#tasklist").html("<li>An error occurred :(</li>");
    },
    "success":function(data) {
      dbg.prepend("loaded "+data.rows.length+" tasks, viewing project:"+
        currentProject+"<br />");
      var taskContainer = $('#tasklist');

      if(data.rows.length > 0)
      {
        // setup content
        var taskList = generateTasklistItems(data.rows);
        $("#tasklist").html(taskList);
        $(".taskeditor").hide();

        // set actions
        $(".task").dblclick(function() {
          $(this).siblings(".taskeditor").hide();
          $(this).next().show();
          $(this).hide();
        });

        $('.task input[type="checkbox"]').click(function() {
          var editor = $($(this).parents(".task")).next();
          editor.find('input[type="checkbox"]').click();
          editor.find(".editsubmit").click();

          return false;
        });

        $(".taskeditor").dblclick(function() {
          $(this).find(".editcancel").click();
          $(this).siblings(".taskeditor").hide();
          $(this).prev().show();
          $(this).hide();
        });

        $('.taskeditor input, .taskeditor button, .taskeditor textarea')
        .dblclick(function(event) {
          event.preventDefault();
          return false;
        });

        $(".taskdelete").click(function(event) {
          dbg.prepend("delete clicked<br />");
          var target = $(event.target);
          var task   = target.parents(".task");
          var taskID = task.attr('id');
          $db.openDoc(taskID, {"success":function(doc) {
            dbg.prepend("delete document opened, attempting delete<br />");
            $db.removeDoc(doc, {"success":function() {
              dbg.prepend("delete confirmed<br />");
              task.hide();
              task.remove();
            }});
          }});

          return false;
        });

        $(".editsubmit").click(function() {
          var item     = $(this).parents(".taskeditor");
          var id       = item.prev().attr("id");
          var name     = item.find(".editname").val();
          var due      = item.find(".editdue").val();
          var desc     = item.find(".editdesc").val();
          var complete = item.find(".editcomplete").attr("checked");

          var task     = {};
          task.type    = "task";
          task.project = currentProject;
          task.id      = id;
          task.name    = name;

          if (due      != "") task.due        = due;
          if (desc     != "") task.desc       = desc;
          if (complete == true) task.complete = true;

          updateTask(task, function() {
            dbg.prepend("Saved changes<br />");
            refreshTaskList();
          });

          return false;
        });
      }
  }});
}

function changeProject(id, projectName) {
  var taskContainer = $('#tasklist');
  $(taskContainer).empty();

  if(id != null)
  {
    currentProject = id;
    $("#tasksource").html(projectName);
  }

  refreshTaskList();
}

function projectForm(name, due) {
  // generate a form for the given variables and return it
}

function createProject(project, callback) {
  // do stuff to store project in couch
}

$(document).ready(function() {
  dbg = $("#debug");

  // load data from couch
  refreshProjectList();

  // TODO: Check if the hash in the url is set, load the corresponding project
  // instead, if it is.
  // set view to inbox
  changeProject("inbox", "Inbox");

  $("form .cancel").click(function() {
    $(this).parents("form").find("input, textarea").val('');
    return false;
  });

  $('form input[type="text"]').keyup(function(e) {
    e.preventDefault();
  });

  $("form .addsubmit").click(function() {
    var nameInput = $(this).parents("form").find(".addname");
    var resetName = function() { nameInput.val(''); nameInput.focus(); };
    var taskName  = nameInput.val();

    var task      = {};
    task.type     = "task";
    task.project  = currentProject;
    task.name     = taskName;

    dbg.prepend("storing new task, project: "+currentProject+
      ", name: "+task.name+"<br />");

    writeTask(task, function() {
      dbg.prepend("Saved task!<br />");
      resetName();
      refreshTaskList();
    });

    return false;
  });
});
