var range = function (start, end) {
  var arr = [];
  while(start < end) {
    arr.push(start);
    start++;
  }
  return arr;
};

throttle = function(func, wait) {
  var timeOfLast = 0;
  return function () {
    var now = new Date ();
    var elapsed = now - timeOfLast;
    if (elapsed >= wait) {
      func.apply(this, arguments);
      timeOfLast = now;
    }
  }
};