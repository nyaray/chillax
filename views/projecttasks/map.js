function(doc) {
  if(doc.type && doc.type == "task")
  {
    // bare minimum for an emitted task
    project = (doc.project)? doc.project: "";
    name    = (doc.name)? doc.name: "";

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
