$chillax.store = {};

$chillax.store._db = null;

$chillax.store.createTask = function (task, callback) {
  assert(typeof(callback) === "function", "writeTask, callback");

  console.log("saveDoc");
  console.log(task);

  return $chillax.store._db.saveDoc(task, {
    "success": callback
  });
};

$chillax.store.writeTask = function (task, callback) {
  assert(task._id !== undefined, "writeTask, task");
  assert(typeof(callback) === "function", "writeTask, callback");

  $chillax.store._db.saveDoc(task, {
    "success": callback
  });
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
