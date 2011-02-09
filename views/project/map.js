function(doc) {
  if(doc.type && doc.type == "project")
  {
    due  = (doc.due)? doc.due: "";
    emit(doc._id, {"name":doc.name, "due":due});
  }
}
