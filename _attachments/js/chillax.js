var $chillax = {
  "version": "0.2",
  "author":  "Emilio Nyaray <emilio@nyaray.com>"
};

var assert = function(bool, message) {
  if(!bool)
  {
    console.log(message+":failure");
    throw "Assert failed, check console!";
  }
};
