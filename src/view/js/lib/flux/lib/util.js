export function isFunction(arg) {
  return typeof arg === 'function';
}

export function isNumber(arg) {
  return typeof arg === 'number';
}

export function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

export function isArray(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
}

export function isUndefined(arg) {
  return arg === void 0;
}

export function isNull(arg){
  return typeof arg === 'object' && arg == null;
}

export function clone(target){
  if(target && typeof target === 'object'){
    var newObj = target instanceof Array ? [] : {};
    for(var key in target){
      var val = target[key];
      newObj[key] = arguments.callee(val);
    }
    return newObj;
  }else{
    return target;
  }
}
