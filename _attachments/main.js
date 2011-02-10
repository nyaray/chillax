var $db = $.couch.db("chillax");
var currentProject = "inbox";

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

function refreshTaskList() {
  $('#tasklist').empty();

  $db.view('chillax/projecttasks', {
    "key":currentProject,
    "success":function(data) {
      var taskContainer = $('#tasklist');
      dbg.prepend("loaded "+data.rows.length+" tasks, viewing project:"+
        currentProject+"<br />");

      if(data.rows.length > 0)
      {
        var rows = data.rows;
        for (i in rows) {
          var payload  = rows[i].value;

          var id   = rows[i].id;
          var name = payload.name;
          var due  = (payload.due)?
            '<span class="taskdue">'+ payload.due +'</span>': "";
          var desc = (payload.desc)?
            '<div class="taskdesc">'+ payload.desc +'</div>': "";

          var html =
            '<li class="task" id="'+ id +'">'+
            '  <span class="taskname">'+ name +'</span>'+
            '  <span class="taskend">'+
                due+
            '    <span class="taskdelete">x</span>'+
            '  </span>'+
              desc+
            '</li>'+
            '<li class="taskeditor">'+
            '  <form>'+
            '    <legend>Edit task</legend>'+
            '    <input placeholder="Name" class="editname" name="editname"'+
            '      value="'+ name +'" type="text">'+
            '    <input placeholder="Due" class="editdue" name="editdue"'+
            '      value="'+ due +'" type="text"><br>'+
            '    <textarea placeholder="Description" class="editdesc"'+
            '      name="editdesc" type="text">'+ desc +'</textarea><br> '+
            '    <button type="button" class="editsubmit">Save</button>'+
            '    <button type="button" class="editcancel">Cancel</button>'+
            '  </form>'+
            '</li>';
          $(taskContainer).append(html);
        }

        $(".taskeditor").animate({"height":"toggle"}, {"duration":0});

        $(".task").dblclick(function() {
          $(this).next().slideDown("fast");
          $(this).slideUp("fast");
        });

        $(".taskeditor").dblclick(function() {
          $(this).prev().slideDown("fast");
          $(this).slideUp("fast");
        });

        $(".taskdelete").click(function(event) {
          dbg.prepend("delete clicked<br />");
          var target = $(event.target);
          var task   = target.parents(".task");
          var taskID = task.attr('id');
          $db.openDoc(taskID, {"success":function(doc) {
            dbg.prepend("delete document opened<br />");
            var ret = $db.removeDoc(doc, {"success":function() {
              dbg.prepend("delete confirmed<br />");
              task.remove();
            }});
            dbg.prepend("ret:"+ret+"<br />");
          }});

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

function writeTask(task, callback) {
  // do stuff to store task in couch
  $db.saveDoc(task, {"success":callback});
}

$(document).ready(function() {
  dbg = $("#debug");

  // load data from couch
  refreshProjectList();
  changeProject("inbox", "Inbox");

  $("form .cancel").click(function() {
    $(this).parents("form").find("input, textarea").val('');
    return false;
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
