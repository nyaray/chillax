function(doc) {
  if(doc.type && doc.type == "task")
  {
    // emit all document that are tasks, this will look funny to the user and
    // should probably be handled here or in the frontend
    project = (doc.project)? doc.project: "";
    name    = (doc.name)? doc.name: "";

    // bare minimum for an emitted task
    task         = {};
    task.type    = doc.type;
    task.project = project;
    task.name    = name;

    // avoid adding properties that we don't use
    if(doc.desc && doc.desc != "") task.desc = doc.desc;
    if(doc.due && doc.due != "") task.due = doc.due;
    if(doc.complete && doc.complete == true) task.complete = doc.complete;

    emit(project, task);
  }
}
