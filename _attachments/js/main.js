var $db = $.couch.db("chillax");
var currentProject = "inbox";

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
