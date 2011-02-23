$chillax.store = {};

$chillax.store._db = null;

$chillax.store._writeDoc = function(doc, callback) {
  assert(typeof(callback) === "function", "writeProject, callback");

  return $chillax.store._db.saveDoc(doc, {
    "success": callback
  });
};

$chillax.store.writeProject = function (project, callback) {
  assert(project.type && project.type === "project", "writeProject");
  // TODO:
  // assert that checks if rev is present and demands that _id also exists
  $chillax.store._writeDoc(project, callback);
};

$chillax.store.writeTask = function (task, callback) {
  assert(task.type && task.type === "task", "writeTask");
  $chillax.store._writeDoc(task, callback);
};

$chillax.store.updateTask = (function () {
  var taskUpdater = function (oldTask, task, callback) {
    // assertions
    assert(oldTask._id !== undefined && oldTask.type !== undefined,
      "taskUpdater, oldTask");
    assert(task._id !== undefined && task.type !== undefined,
      "taskUpdater, task");
    assert(typeof(callback) !== "function", "taskUpdater, callback");

    var storeTask = {};
    storeTask._id = oldTask._id;
    storeTask._rev = oldTask._rev;
    storeTask.type = "task";
    storeTask.name = task.name;
    storeTask.project = task.project;

    if (task.due && typeof(task.due) === "string" && task.due !== "") {
      storeTask.due = task.due;
    }

    if (task.desc && typeof(task.desc) === "string" && task.desc !== "") {
      storeTask.desc = task.desc;
    }

    if (task.complete && task.complete !== false) {
      storeTask.complete = task.complete;
    }

    //console.log(storeTask);
    $chillax.store.writeTask(storeTask, callback);
  };

  return function (task, callback) {
    assert(task.id !== undefined, "updateTask, task");
    assert(typeof(callback) === "function");

    $chillax.store._db.openDoc(task.id, {
      "success": function (oldTask) {
        taskUpdater(oldTask, task, callback);
      }
    });
  };
}());

$chillax.store.updateTaskField = (function() {
  var taskUpdater = function(oldTask, field, value, callback) {
    // assertions
    assert(oldTask._id !== undefined && oldTask.type !== undefined &&
      oldTask.type === "task", "taskUpdater, oldTask");

    oldTask[field] = value;
    $chillax.store.writeTask(oldTask, callback);
  };

  return function(taskId, field, value, callback) {
    $chillax.store._db.openDoc(taskId, {
      "success": function(oldTask) {
        taskUpdater(oldTask, field, value, callback);
      }
    });
  };
}());

// takes a callback that in turn takes the array of rows in the view, i.e. the
// projects
$chillax.store.getProjects = (function () {
  var caller = function (data, callback) {
    callback(data.rows);
  };

  return function (callback) {
    assert(typeof(callback) === "function", "getProjects, callback");
    $chillax.store._db.view('chillax/projects', {
      "success": function (data) {
        caller(data, callback);
      },
      "error": function(){
        alert("Fatal error: Could not retrieve projects");
      }
    });
  };
}());

// TODO: Write this in a sexier way...
$chillax.store.deleteTask = function (taskId, callback) {
  $chillax.store._db.openDoc(taskId, {
    "success": function (doc) {
      $chillax.store._db.removeDoc(doc, {
        "success": callback
      });
    }
  });
};

$chillax.store.getProjectTasks = (function () {
  var caller = function (data, callback) {
    callback(data.rows);
  };

  return function (project, callback) {
    $chillax.store._db.view('chillax/projecttasks', {
      "key": project,
      "success": function (data) {
        caller(data, callback);
      }
    });
  };
}());

$chillax.store.init = function() {
  $chillax.store._db = $.couch.db("chillax");
};
