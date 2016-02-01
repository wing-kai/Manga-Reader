const clone = o => {
    let k, ret = o, b;
    if (o && ((b = (o instanceof Array)) || o instanceof Object)) {
        ret = b ? [] : {};
        for (k in o) {
            if (o.hasOwnProperty(k)) {
                ret[k] = clone(o[k]);
            }
        }
    }
    return ret;
}

const isArray = arg => Object.prototype.toString.call(arg) === '[object Array]';

const isString = args => typeof args === 'string';

module.exports = {
    isArray,
    isString,
    clone
}