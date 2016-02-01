const { clone } = require('./util');
const fs = require('fs');
const Immutable = require('immutable');
const { CONFIG_PATH, REGEXP, VIEW_MODE } = require('../components/common/constants');

let MangaList = Immutable.List([]);

class Manga {

    constructor({
        hash       = "",
        cover      = "",
        path       = "",
        index      = 0,
        title      = "",
        author     = "",
        tags       = [],
        lastReaded = 0,
        viewMode   = VIEW_MODE.SINGLE
    }) {
        this.data = { hash, cover, path, index, title, author, tags, lastReaded, viewMode };
        this.deleted = false;
    }

    get(key) {
        return ('data' in this && key in this.data) ? this.data[key] : null;
    }

    set(values) {
        for( var key in values ) {
            if (key in this.data) {
                this.data[key] = clone(values[key]);
            }
        }
    }

    getOriginData() {

        if (this.deleted || !('data' in this)) {
            return null;
        }

        return clone(this.data);
    }
    
    getPageFile() {
        const thisData = this.data;
        const list = fs.readdirSync(thisData.path).filter(
            fileName => REGEXP.IMAGE_FILE.test(fileName) && fs.statSync(thisData.path + '/' + fileName).isFile()
        ).map(
            fileName => thisData.path + '/' + fileName
        )
        return list;
    }

    remove() {
        this.data = {};
        this.deleted = true;
        MangaList = MangaList.filter(obj => obj.getOriginData() !== null);
        return true;
    }
}

// 初始化配置文件里的数据
const initialData = originData => Immutable.List(originData.map( data => new Manga(data) ));

// 获取配置文件
const readConfigFile = () => {

    // 确认文件存在
    let configFileExists = new Promise((resolve, reject) => {
        fs.exists(CONFIG_PATH, exist => exist ? resolve() : reject());
    });

    return configFileExists.then(
        // 存在
        () => new Promise((resolve, reject) => {
            fs.readFile(CONFIG_PATH, 'utf-8', (err, content) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    const originData = JSON.parse(content).data;
                    MangaList = initialData(originData);
                    resolve(MangaList.toArray());
                } catch(e) {
                    reject(e);
                }
            })
        }),
        // 不存在
        () => new Promise((resolve, reject) => {
            MangaList = Immutable.List([]);
            fs.writeFile(CONFIG_PATH, '{"data":[]}', 'utf-8', err => {
                err ? reject(err) : resolve(MangaList.toArray());
            });
        })
    );
}

// 新增漫画
const addManga = (newMangaList = []) => {

    newMangaList.forEach(data => {
        MangaList = MangaList.push(new Manga(clone(data))); 
    });

    return MangaList.toArray();
}

// 写入配置文件
const saveMangaConfig = () => {

    let configContent = MangaList.toArray().map(
        mangaData => mangaData.getOriginData()
    ).filter(mangaData => mangaData !== null);

    configContent = JSON.stringify({data:configContent});

    return new Promise((resolve, reject) => {
        fs.writeFile(CONFIG_PATH, configContent, 'utf-8', err => {
            err ? reject(err) : resolve(MangaList.toArray())
        });
    })
}

const deleteManga = () => {

}

// 获得对象拷贝
const getMangaListCopy = () => MangaList.toArray();

const getManga = hash => {
    const findResult = MangaList.toArray().filter(mangaData => mangaData.get('hash') === hash);
    return findResult.length ? findResult[0] : false;
}

module.exports = {
    Manga,
    readConfigFile,
    addManga,
    saveMangaConfig,
    getMangaListCopy,
    deleteManga,
    getManga
}