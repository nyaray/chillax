function(doc) {
  if(doc.type && doc.type == "task" &&
     doc.due  && doc.due != false)
  {
    emit(doc._id, doc);
  }
}
