function(doc) {
  if(doc.type && doc.type == "task")
  {
    // bare minimum for an emitted task
    name = (doc.name)? doc.name: "";
    task = {"name":name};

    // avoid adding properties that we don't use
    if(doc.desc && doc.desc != "") task.desc = doc.desc;
    if(doc.due && doc.due != "") task.due = doc.due;

    project = (doc.project)? doc.project: "";
    emit(project, task);
  }
}
