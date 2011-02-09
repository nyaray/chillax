function(doc) {
  if(doc.type && doc.type == "project")
    emit(doc._id, doc.name);
}
