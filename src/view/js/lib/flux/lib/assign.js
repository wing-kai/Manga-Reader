
function ToObject(val) {
  if (val == null) {
      throw new TypeError('Object.assign cannot be called with null or undefined');
  }
  return Object(val);
}

var assign = Object.assign || function (target) {
  var pendingException;
  var from;
  var keys;
  var to = ToObject(target);

  for (var s = 1; s < arguments.length; s++) {
      from = arguments[s];
      keys = Object.keys(Object(from));

      for (var i = 0; i < keys.length; i++) {
          try {
              to[keys[i]] = from[keys[i]];
          } catch (err) {
              if (pendingException === undefined) {
                  pendingException = err;
              }
          }
      }
  }

  if (pendingException) {
      throw pendingException;
  }

  return to;
};

export default assign;