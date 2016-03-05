const Immutable        = require('immutable');
const crypto           = require('crypto');
const { EventEmitter } = require('events');

class CategoryEvent extends EventEmitter {
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

const ce = new CategoryEvent();

class Category {

    constructor(opt) {
        let defaultOpt = Object.seal({
            hash: "",
            name: "",
            manga: new Set()
        });

        const args = Object.assign({}, opt);

        if (!('hash' in args))
            args.hash = crypto.createHash('md5').update(opt.name).digest('hex').slice(0, 8);

        this.data = Object.assign(defaultOpt, args);
        Object.seal(this);
    }

    get(key) {
        return this.data[key]
    }

    getOriginData() {
        const originData = Object.assign({}, this.data);
        return {
            hash: originData.hash,
            name: originData.name,
            manga: Array.from(originData.manga)
        }
    }

    rename(newName, sync) {
        
        sync = typeof sync === "boolean" ? sync : false;

        this.data = this.data.set('name', newName);

        let newData = this;
        return new Promise(resolve => {
            if (sync) {
                ce.save().then(() => { resolve(newData) });
            } else {
                ce.save();
                resolve(newData)
            }
        });
    }

    addManga(hashArray, sync) {
        
        sync = typeof sync === "boolean" ? sync : false;

        this.data = this.data.update('manga',
            hashSet => new Set([...hashArray, ...Array.from(hashSet)])
        );

        let newData = this;
        return new Promise(resolve => {
            if (sync) {
                ce.save().then(() => { resolve(newData) });
            } else {
                ce.save();
                resolve(newData)
            }
        });
    }

    removeManga(hashArray, sync) {
        
        sync = typeof sync === "boolean" ? sync : false;

        this.data = this.data.update('manga',
            hashSet => {
                hashArray.forEach(hash => { hashSet.delete(hash) });
                return hashSet;
            }
        );

        let newData = this;
        return new Promise(resolve => {
            if (sync) {
                ce.save().then(() => { resolve(newData) });
            } else {
                ce.save();
                resolve(newData)
            }
        });
    }
}

module.exports = {
    Category,
    CategoryEvent: ce
};