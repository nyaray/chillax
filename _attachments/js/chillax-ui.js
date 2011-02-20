$chillax.ui = {};

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

  var saveText = document.createTextNode('Save');
  var cancelText = document.createTextNode('Cancel');
  var deleteText = document.createTextNode('De');
  var archiveText = document.createTextNode('Ar');

  var saveButton    = document.createElement('button');
  var cancelButton  = document.createElement('button');
  var deleteButton  = document.createElement('button');
  var archiveButton = document.createElement('button');

  saveButton.setAttribute('class', 'taskSaveButton');
  cancelButton.setAttribute('class', 'taskCancelButton');
  deleteButton.setAttribute('class', 'taskDeleteButton');
  archiveButton.setAttribute('class', 'taskArchiveButton');

  saveButton.appendChild(saveText);
  cancelButton.appendChild(cancelText);
  deleteButton.appendChild(deleteText);
  archiveButton.appendChild(archiveText);

  for (i in rows) {
    var payload  = rows[i].value;

    var id       = rows[i].id;
    var name     = document.createTextNode(payload.name);
    var complete = (payload.complete && payload.complete == true)?
      payload.complete: false;
    var today    = payload.today !== undefined;
    
    // TODO: show that a task is overdue by adding a class to its corresponding
    // li element.
    var taskItem = document.createElement('li');
    var nameLabel = document.createElement('span');

    var todayChecker    = document.createElement('input');
    var completeChecker = document.createElement('input');

    nameLabel.setAttribute('class', 'taskNameLabel');
    todayChecker.setAttribute('type', 'checkbox');
    completeChecker.setAttribute('type', 'checkbox');
    if (complete) completeChecker.setAttribute('checked', 'checked');
    if (today) todayChecker.setAttribute('checked', 'checked');
    todayChecker.setAttribute('class', 'taskTodayChecker');
    completeChecker.setAttribute('class', 'taskCompleteChecker');

    nameLabel.appendChild(name);

    taskItem.setAttribute('id', id);
    taskItem.setAttribute('class', 'task');
    // delete, archive, today, complete, name, due, tags, desc, save, cancel
    taskItem.appendChild(deleteButton.cloneNode(true));
    taskItem.appendChild(archiveButton.cloneNode(true));
    taskItem.appendChild(todayChecker);
    taskItem.appendChild(completeChecker);
    taskItem.appendChild(nameLabel);

    if (payload.due) {
      var due = document.createTextNode((payload.due)? payload.due: "N/A");
      var dueLabel = document.createElement('span');
      dueLabel.setAttribute('class', 'taskDueLabel');
      dueLabel.appendChild(due);
      taskItem.appendChild(dueLabel);
    }

    if (payload.tags) {
      var tags     = document.createTextNode("N/A");
      var tagsLabel = document.createElement('span');
      tagsLabel.setAttribute('class', 'taskTagsLabel');
      tagsLabel.appendChild(tags);
      taskItem.appendChild(tagsLabel);
    }

    if (payload.desc) {
      var desc = document.createTextNode((payload.desc)? payload.desc: "N/A");
      var descLabel = document.createElement('textarea');
      descLabel.setAttribute('class', 'taskDescLabel');
      descLabel.appendChild(desc);
      taskItem.appendChild(descLabel);
    }

    taskItem.appendChild(saveButton.cloneNode(true));
    taskItem.appendChild(cancelButton.cloneNode(true));

    taskList.push(taskItem);
  }

  return taskList;
};

$chillax.ui._setupTasks = function() {
  $(".taskDeleteButton").click(function(event) {
    alert("task deleted");
  });

  $(".taskArchiveButton").click(function(event) {
    alert("task archived");
  });

  $('.taskTodayChecker').click(function() {
    alert("task todayed");
  });

  $('.taskCompleteChecker').click(function() {
    alert("task completed");
  });

  $(".taskSaveButton").click(function() {
    alert("task saved");
  });

  $(".taskCancelButton").click(function() {
    alert("task saving cancelled");
  });
}

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
  $("#tasksource").html(projectName);
  $chillax.ui.refreshTasklist(id);
};

$chillax.ui.init = function() {
  $chillax.ui._projectList = document.getElementById('projectlist');
  $chillax.ui._taskList    = document.getElementById('tasklist');

  $chillax.ui.refreshProjects();
  $chillax.ui.changeProject("inbox", "Inbox");
};

