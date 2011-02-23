$chillax.ui = {};

$chillax.ui._projectId = "inbox";
$chillax.ui._projectName = "Inbox";

$chillax.ui._projectList = null;
$chillax.ui._taskList = null;

$chillax.ui._clearprojectList = function() {
  var projectList = $chillax.ui._projectList;
  var child =  null;

  while (projectList.hasChildNodes()) {
    child = projectList.firstChild;
    projectList.removeChild(child);
  }
};

$chillax.ui._cleartaskList = function() {
  var taskList = $chillax.ui._taskList;
  var child =  null;

  while (taskList.hasChildNodes()) {
    child = taskList.firstChild;
    taskList.removeChild(child);
  }
};

$chillax.ui._sortProjects = function() {
  var projectList = $chillax.ui._projectList;
  var items = [];

  while(projectList.hasChildNodes()) {
    var child = projectList.removeChild(projectList.firstChild);
    items.push(child);
  }

  items.sort(function(a,b){ 
    var keyA = a.childNodes[0].innerHTML;
    var keyB = b.childNodes[0].innerHTML;
    //console.log("comparing '"+keyA+"' and '"+keyB+"'");

    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });

  for(i in items) {
    $chillax.ui._projectList.appendChild(items[i]);
  }
};

$chillax.ui.refreshProjects = function() {
  var refresher = function(rows) {
    var projectList = $chillax.ui._projectList;

    // clear project list of projects
    while(projectList.hasChildNodes()) {
      var child = projectList.firstChild;
      projectList.removeChild(child);
    }

    // add projects
    for(i in rows) {
      var li = document.createElement('li');
      var a  = document.createElement('a');
      a.setAttribute('id', rows[i].id);
      a.setAttribute('href', '#');
      a.setAttribute('class', 'projectLink');

      var text = document.createTextNode(rows[i].value);
      a.appendChild(text);
      li.appendChild(a);
      projectList.appendChild(li);
    }

    // set triggers for projects
    $(".projectLink").click(function(e) {
      e.preventDefault();
      $chillax.ui.changeProject($(this).attr('id'), $(this).html());
      return false;
    });

    // sort projects
    $chillax.ui._sortProjects();
  };

  $chillax.store.getProjects(refresher);
};

$chillax.ui._createTasks = function(rows) {
  var taskList = [];

  var deleteText = document.createTextNode('Del');
  var archiveText = document.createTextNode('Arch');
  var deleteButton  = document.createElement('button');
  var archiveButton = document.createElement('button');

  deleteButton.setAttribute('class', 'taskDeleteButton');
  archiveButton.setAttribute('class', 'taskArchiveButton');
  deleteButton.appendChild(deleteText);
  archiveButton.appendChild(archiveText);

  for (i in rows) {
    var payload  = rows[i].value;

    var id       = rows[i].id;

    // TODO: show that a task is overdue by adding a class to its corresponding
    // li element.
    var taskItem = document.createElement('li');
    taskItem.setAttribute('id', id);
    taskItem.setAttribute('class', 'task');

    var nameLabel = document.createElement('input');
    nameLabel.setAttribute('type', 'text');
    nameLabel.setAttribute('class', 'taskNameLabel');
    nameLabel.setAttribute('field', 'name');
    nameLabel.setAttribute('value', payload.name);

    var todayChecker    = document.createElement('input');
    var completeChecker = document.createElement('input');
    var today    = (payload.today)?    payload.today:    'off';
    var complete = (payload.complete)? payload.complete: 'off';

       todayChecker.setAttribute('type', 'checkbox');
    completeChecker.setAttribute('type', 'checkbox');
       todayChecker.setAttribute('class', 'taskTodayChecker');
    completeChecker.setAttribute('class', 'taskCompleteChecker');
    if (today    === 'on')    todayChecker.setAttribute('checked', 'checked');
    if (complete === 'on') completeChecker.setAttribute('checked', 'checked');
       todayChecker.setAttribute('field', 'today');
    completeChecker.setAttribute('field', 'complete');

    taskItem.appendChild(deleteButton.cloneNode(true));
    taskItem.appendChild(archiveButton.cloneNode(true));
    taskItem.appendChild(todayChecker);
    taskItem.appendChild(completeChecker);
    taskItem.appendChild(nameLabel);

    var dueLabel = document.createElement('input');
    dueLabel.setAttribute('type', 'text');
    dueLabel.setAttribute('class', 'taskDueLabel');
    dueLabel.setAttribute('field', 'due');
    dueLabel.setAttribute('value', (payload.due)? payload.due: "");
    taskItem.appendChild(dueLabel);

    if (payload.desc) {
      var desc = document.createTextNode((payload.desc)? payload.desc: "");
      var descLabel = document.createElement('textarea');
      descLabel.setAttribute('class', 'taskDescLabel');
      descLabel.setAttribute('field', 'desc');
      descLabel.appendChild(desc);
      taskItem.appendChild(descLabel);
    }

    if (false && payload.tags) {
      var tags     = document.createTextNode("");
      var tagsLabel = document.createElement('span');
      tagsLabel.setAttribute('class', 'taskTagsLabel');
      tagsLabel.appendChild(tags);
      taskItem.appendChild(tagsLabel);
    }

    taskList.push(taskItem);
  }

  return taskList;
};

$chillax.ui._setupTasks = (function() {
  var deleteCallback = function() {
    if(confirm("Do you really want to delete this task?")) {
      var taskId = $(this).parent().attr('id');
      var callback = function() {
        console.log("Deleted task with id "+taskId);
        $("#tasklist li#"+taskId).remove();
      };

      $chillax.store.deleteTask(taskId, callback);
    }
  };

  var archiveCallback = function() {
      alert("Archiving task with id "+$(this).parent().attr('id'));
  };

  var changeSuccess = function() {
    console.log('Saved changes');
    // stuff to do on success
  };

  var changeCallback = function(event){
      var target = $(this);
      var taskId = target.parent().attr('id');
      var field  = target.attr('field');
      var value  = target.attr('value');
      console.log("updating:"+taskId+"#"+field+"#"+value);
      $chillax.store.updateTaskField(taskId,
                                     field,
                                     value,
                                     changeSuccess);
  };

  var newDescBlur = function() {
    if ($(this).val() === "") {
      $(this).remove();
    }
  };

  var doubleclickCallback = function() {
    var textareas = $(this).parent().find("textarea");
    var textarea  = (textareas.length == 1)? textareas[0]: null;
    if (textarea !== null) {
      $(textarea).focus();
    }
    else {
      textarea = document.createElement('textarea');
      textarea.setAttribute('class', 'taskDescLabel');
      textarea.setAttribute('field', 'desc');

      $(textarea).change(changeCallback);
      $(textarea).blur(newDescBlur);

      $(this).append(textarea);
    }
  };

  return function() {
    $("#tasklist li .taskDeleteButton").click(deleteCallback);
    $("#tasklist li .taskArchiveButton").click(archiveCallback);
    $("#tasklist li input, "+
      "#tasklist li textarea, "+
      "#tasklist li .taskTodayChecker, "+
      "#tasklist li .taskCompleteChecker").change(changeCallback);
    $("#tasklist li").dblclick(doubleclickCallback);
  }
}());

$chillax.ui.refreshTasklist = function(project) {
  $chillax.store.getProjectTasks(project, function(rows) {
    $chillax.ui._cleartaskList();

    var tasks = $chillax.ui._createTasks(rows);
    for (i in tasks) {
      $chillax.ui._taskList.appendChild(tasks[i]);
    }

    $chillax.ui._setupTasks();
  });
};

$chillax.ui.changeProject = function(id, projectName) {
  $chillax.ui._projectId = id;
  $chillax.ui._projectName = projectName;
  $chillax.ui.refreshTasklist(id);
  $("#tasksource").html(projectName);
};

$chillax.ui.init = function() {
  $chillax.ui._projectList = document.getElementById('projectlist');
  $chillax.ui._taskList    = document.getElementById('tasklist');

  $(".projectlink").click(function() {
    var id = $(this).attr('id');
    var name = $(this).html();
    $chillax.ui.changeProject(id, name);
  });

  $chillax.ui.refreshProjects();
  $chillax.ui.changeProject("inbox", "Inbox");

  $('.createname').keypress(function(event){
    if (event.which === 13) {
      console.log($(this));
      $(this).parent().find('.createbutton').click();
    }
  });

  $('#createproject').click(function() {
    var name = $(this).parent().find('#createprojectname');
    var nameStr = name.val();
    if (nameStr === "")
    {
      // do stuff appropriate for when no name is given

      return;
    }

    var project = {
      "type":"project",
      "name":nameStr
    };

    $chillax.store.writeProject(project, function(){
      console.log("Created project");
      $chillax.ui.refreshProjects();
    });
  });

  $('#createtask').click(function() {
    var name = $(this).parent().find('#createtaskname');
    var nameStr = name.val();
    if (nameStr === "")
    {
      // do stuff appropriate for when no name is given

      return;
    }

    var task = {
      "type":"task",
      "project":$chillax.ui._projectId,
      "name":nameStr
    };

    name.val('');
    $chillax.store.writeTask(task, function(){
      console.log("Created task");
      $chillax.ui.refreshTasklist($chillax.ui._projectId);
    });
  });
};

