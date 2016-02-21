const { EventEmitter } = require('events');
const Immutable = require('immutable');

class MangaEvent extends EventEmitter {
    constructor() {
        super();
    }

    save() {
        return new Promise(function(resolve, reject) {
            this.once('res-saved', resolve);
            this.once('res-save-fail', reject);
            this.emit('req-save');
        }.bind(this));
    }

    saved() {
        this.removeAllListeners('res-save-fail');
        this.emit('res-saved');
    }

    saveFail() {
        this.removeAllListeners('res-saved');
        this.emit('res-saved-fail');
    }

    listenSaveRequest(callBack) {
        this.on('req-save', callBack)
    }
}

const me = new MangaEvent();

class Manga {

    constructor(opt) {
        let defaultOpt = Object.seal({
            hash:       "",        // ID
            path:       "",        // 路径
            fileType:   "",        // 文件类型（zip, epub, pdf）
            title:      "",        // 标题
            author:     "",        // 作者
            category:   new Set(), // 分类
            lastReaded: 0,         // 上次阅读
            viewMode:   "",        // 显示模式
            readMode:   "",        // 阅读模式
            bookMark:   new Set(), // 书签
        });

        this.data = Immutable.Map(Object.assign(defaultOpt, opt));
        Object.seal(this);
    }

    get(key) {
        return this.get(key);
    }

    setTitle(value, sync) {

        sync = typeof sync === "boolean" ? sync : false;

        this.data = this.data.set('title', value);
        
        let newData = this;
        return new Promise(resolve => {
            if (sync) {
                me.save().then(() => { resolve(newData) });
            } else {
                me.save();
                resolve(newData)
            }
        });
    }

    setAuthor(value, sync) {

        sync = typeof sync === "boolean" ? sync : false;

        this.data = this.data.set('author', value);
        
        let newData = this;
        return new Promise(resolve => {
            if (sync) {
                me.save().then(() => { resolve(newData) });
            } else {
                me.save();
                resolve(newData)
            }
        });
    }

    setCategory(value, sync) {

        sync = typeof sync === "boolean" ? sync : false;

        this.data = this.data.update('category',
            value => value.add(value)
        );
        
        let newData = this;
        return new Promise(resolve => {
            if (sync) {
                me.save().then(() => { resolve(newData) });
            } else {
                me.save();
                resolve(newData)
            }
        });
    }

    removeCategory(value, sync) {

        sync = typeof sync === "boolean" ? sync : false;

        this.data = this.data.update('category',
            value => {
                value.delete(value);
                return value;
            }
        );
        
        let newData = this;
        return new Promise(resolve => {
            if (sync) {
                me.save().then(() => { resolve(newData) });
            } else {
                me.save();
                resolve(newData)
            }
        });
    }

    setLastReaded(value, sync) {

        sync = typeof sync === "boolean" ? sync : false;

        this.data = this.data.set('lastReaded', value);
        
        let newData = this;
        return new Promise(resolve => {
            if (sync) {
                me.save().then(() => { resolve(newData) });
            } else {
                me.save();
                resolve(newData)
            }
        });
    }

    setViewMode(value, sync) {

        sync = typeof sync === "boolean" ? sync : false;

        this.data = this.data.set('viewMode', value);
        
        let newData = this;
        return new Promise(resolve => {
            if (sync) {
                me.save().then(() => { resolve(newData) });
            } else {
                me.save();
                resolve(newData)
            }
        });
    }

    setReadMode(value, sync) {

        sync = typeof sync === "boolean" ? sync : false;

        this.data = this.data.set('readMode', value);
        
        let newData = this;
        return new Promise(resolve => {
            if (sync) {
                me.save().then(() => { resolve(newData) });
            } else {
                me.save();
                resolve(newData)
            }
        });
    }

    addBookMark(value, sync) {

        sync = typeof sync === "boolean" ? sync : false;

        this.data = this.data.update('bookMark',
            value => value.add(Number(value))
        );
        
        let newData = this;
        return new Promise(resolve => {
            if (sync) {
                me.save().then(() => { resolve(newData) });
            } else {
                me.save();
                resolve(newData)
            }
        });
    }

    removeBookMark(value, sync) {

        sync = typeof sync === "boolean" ? sync : false;

        this.data = this.data.update('bookMark',
            value => {
                value.delete(Number(value));
                return value;
            }
        );
        
        let newData = this;
        return new Promise(resolve => {
            if (sync) {
                me.save().then(() => { resolve(newData) });
            } else {
                me.save();
                resolve(newData)
            }
        });
    }
}

module.exports = {
    Manga,
    MangaEvent: me
};