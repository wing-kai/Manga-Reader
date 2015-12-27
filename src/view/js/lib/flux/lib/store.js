// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

import {invariant, warn} from './invariant';
import * as Util from './util';

class Store {

  constructor(flux, handlers){
    this._flux = flux;
    this._db = {};
    this._handlers = handlers;
    this.source(handlers);

    this.dispatchToken = flux.dispatcher.register(this.dispatcher_callback.bind(this));

    this._destroyed = false;
    this._events = this._events || {};
    this._maxListeners = this._maxListeners || undefined;

    // By default Stores will print a warning if more than 10 listeners are
    // added to it. This is a useful default which helps finding memory leaks.
    this.defaultMaxListeners = 10;
  }
  
  dispatcher_callback(action) {
    var type = action.type;
    var dispatch_handler = this._handlers[type];
    invariant(dispatch_handler, 'action: %s has no register handler in Store', type);

    var handler_return = dispatch_handler.call(this, action.data);
    this._db[type] = handler_return;
    this[type] = this.fetch.bind(this, type); //复写Store中的type方法，使其可以返回从action中接收的新值
    this.emit(type);
  }

  source(hd) {
    Object.keys(hd).forEach( type => {
      warn(this[type], "'%s' has already defined in Store", type);
      //这里定义的type方法，只能用来获取初始值，(一旦接收到action更新，则会重写此函数)
      this[type] = () => {
        var d = hd[type]();
        this._flux.logOut(type, d);
        return d;
      };
    });
  }

  //用来添加一些纯粹的, 非dispatch流程中的, 用来获取常量的方法(这个待定)，
  assign(target) {
    for(var a in target){
      this[a] = function(type, ...rest){
        var res = target[type].apply(this, rest);
        this._flux.logOut(type, res);
        return res;
      }.bind(this, a);
    }
  }

  //clear the Getter
  reset(handler_name) {
    invariant(this[handler_name], "'%s' is not defined in Store", handler_name);
    this[handler_name] = this._handlers[handler_name];
  }

  //Getter of Store
  fetch(handler_name) {
    //clone or not ?
    var d = this._db[handler_name];
    this._flux.logOut(handler_name, d);
    return d;
  }

  listen(listen_map) {
    if(!Util.isObject(listen_map))
      throw TypeError('listen_map should be an object');

    Object.keys(listen_map).forEach( type => {
      var callback = listen_map[type];
      var new_callback;
      if(!Util.isFunction(callback)){
        throw TypeError("you want ot listen: '" + type + "', but it's callback is not a function");
      }
      if(Util.isFunction( this._handlers[type] )){
        new_callback = () => {
          //注意callback已经被React所绑定
          callback( this.fetch(type) );
        };
      }else if(this._handlers[type]){
        throw TypeError('dispatch handler: "' + type + '" should be an function');
      }else{
        throw Error("you want to listen: '" + type + "' , but '" + type + "' is not defined in Store");
      }
      //因为存在多个事件，同一回调的情况，所以__new使用了map
      callback.__new = callback.__new || {};
      //检查是否重复绑定
      for(var n in callback.__new){
        warn(
          n == type,
          'multiple listen: "%s" (maybe you forgot to listenOff the listener when your component did unmount)',
          type
        );
      }
      callback.__new[type] = new_callback;
      this.addListener(type, new_callback);
    });
    return listen_map;
  }
  
  listenOff(listen_map) {
    if(!Util.isObject(listen_map)){
      throw TypeError('you should pass an object to the listenOff function!');
    }
    try{
      for(var type in listen_map){
        var __new = listen_map[type].__new;
        if(__new[type]){
          this.removeListener(type, __new[type]);
          delete __new[type];
        }
      }
    }catch(e){
      console.error('解绑事件：', listen_map, ' 时出错！');
      throw e;
    }
  }

  emit(type) {
    var er, handler, len, args, i, listeners;

    if (!this._events)
      this._events = {};

    // If there is no 'error' event listener then throw.
    if (type === 'error') {
      if (!this._events.error ||
          (Util.isObject(this._events.error) && !this._events.error.length)) {
            er = arguments[1];
            if (er instanceof Error) {
              throw er; // Unhandled 'error' event
            }
            throw TypeError('Uncaught, unspecified "error" event.');
          }
    }

    handler = this._events[type];

    if (Util.isUndefined(handler)){
      console.warn('"' + type + '" has emmitted , but no listeners in Component');
      return false;
    }

    if (Util.isFunction(handler)) {
      switch (arguments.length) {
        // fast cases
    case 1:
        handler.call(this);
        break;
    case 2:
        handler.call(this, arguments[1]);
        break;
    case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
        // slower
    default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
        handler.apply(this, args);
      }
    } else if (Util.isArray(handler)) {
      len = arguments.length;
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

      listeners = handler.slice();
      len = listeners.length;
      for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
    }
    return true;
  }

  addListener(type, listener) {
    var m;
    if (!Util.isFunction(listener))
      throw TypeError('listener must be a function');
    if (!this._events)
      this._events = {};
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (this._events.newListener)
      this.emit('newListener', type, Util.isFunction(listener.listener) ?  listener.listener : listener);

    if (!this._events[type])
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    else if (Util.isArray(this._events[type]))
      // If we've already got an array, just append.
      this._events[type].push(listener);
    else
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];

    // Check for listener leak
    if (Util.isArray(this._events[type]) && !this._events[type].warned) {
      if (!Util.isUndefined(this._maxListeners))
        m = this._maxListeners;
      else
        m = Store.defaultMaxListeners;

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible Store memory ' + 'leak detected. %d listeners added. ' +
            'Use Store.setMaxListeners() to increase limit.', this._events[type].length);
        if (typeof console.trace === 'function') {
          // not supported in IE 10
          console.trace();
        }
      }
    }

    return this;
  };

  // emits a 'removeListener' event iff the listener was removed
  removeListener(type, listener) {
    var list, position, length, i;

    if (!Util.isFunction(listener))
      throw TypeError('listener must be a function');

    if (!this._events || !this._events[type])
      return this;

    list = this._events[type];
    length = list.length;
    position = -1;

    if (list === listener ||
        (Util.isFunction(list.listener) && list.listener === listener)) {
      delete this._events[type];
      if (this._events.removeListener)
        this.emit('removeListener', type, listener);

    } else if (Util.isArray(list)) {
      for (i = length; i-- > 0;) {
        if (list[i] === listener ||
            (list[i].listener && list[i].listener === listener)) {
          position = i;
          break;
        }
      }

      if (position < 0)
        return this;

      if (list.length === 1) {
        list.length = 0;
        delete this._events[type];
      } else {
        list.splice(position, 1);
      }

      if (this._events.removeListener)
        this.emit('removeListener', type, listener);
    }

    return this;
  };

  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.
  setMaxListeners(n) {
    if (!Util.isNumber(n) || n < 0 || isNaN(n))
      throw TypeError('n must be a positive number');
    this._maxListeners = n;
    return this;
  }

}

export default Store;
