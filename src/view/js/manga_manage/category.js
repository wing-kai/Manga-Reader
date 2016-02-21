const Immutable = require('immutable');
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

        this.data = Object.assign(defaultOpt, opt);
        Object.seal(this);
    }

    get(key) {
        return this.data[key]
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