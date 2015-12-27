/**
 * This is just a mix of Dispatcher, EventEmmiter , and some optimization
 * for a better encoding and debugg experience;
 */

import Dispatcher from './lib/dispatcher';
import Store from './lib/store';
import * as Util from './lib/util';

class Flux {

  constructor(opts){
    this.dev = opts ? opts.dev : this.isDev();
    this.trace = opts && opts.trace;

    this.dispatcher = new Dispatcher(); 

    this.actions = []; //多action，单store设计
    this.store = null;
  }

  logIn(type, data) {
    //动态监测的好处：可以运行时更新调整配置
    if(this.dev){
      var _log = this.trace ? console.trace : console.log;
      _log.call(console, '%c--->', this.getLogStyle(data), type + ':', data);
    }
  }

  logOut(type, data) {
    if(this.dev){
      var _log = this.trace ? console.trace : console.log;
      _log.call(console, '%c<---', this.getLogStyle(data), type + ':', data);
    }
  }

  resolve(type, data) {
    //var type = arguments.callee.caller.name; 
    this.logIn(type, data);
    this.dispatcher.dispatch({
      type: type,
      data: data
    });
  }

  createAction(initFunc) {
    var Action = {};
    var action_map = initFunc();
    Object.keys(action_map).forEach( ac => {
      Action[ac] = initFunc(this.resolve.bind(this, ac))[ac];
    });
    this.actions.push(Action);
    return Action;
  }

  /**
   * @param: { [[ store1, store2, ...]] , storeHandlers }
   */
  createStore(...args) {
    var arg0 = args[0];
    var storeHandlers = null;
    //继承其他store
    if(Util.isArray(arg0)){
      storeHandlers = args[1]();
      arg0.forEach( s => {
        invariant(s && s.dispatchToken, 'Illegal store!! please check the stores you want to inherit..');
        this.destroyStore(s);
        storeHandlers = Util.assign(s._handlers, storeHandlers);
      });
    }else{
      storeHandlers = arg0();
    }

    //清除上一个Store
    if(this.store){
      this.destroyStore(this.store);
    }

    var store = new Store(this, storeHandlers);
    this.store = store; //存储一下应用，便于查看
    return store;
  }

  destroyStore(store) {
    if(!store._destroyed){
      this.dispatcher.unregister(store && store.dispatchToken);
      store._destroyed = true;
    }
  }

  isDev() {
    return location.hostname == 'localhost' || location.hostname == '127.0.0.1';
  }

  getLogStyle(data) {
    //data 为空时，给出红色提醒
    var green = '#4EE695';
    var red = 'red';
    return 'font-weight: bold;color:' + (data ? green : red);
  }

}

export default Flux;