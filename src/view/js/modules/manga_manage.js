const { clone } = require('./util');
const fs = require('fs');

const CONFIG_PATH = "manga.json";
let MangaList = [];

class Manga {

    constructor({
        hash    = "",
        cover   = "",
        path    = "",
        index   = 0,
        title   = "",
        author  = "",
        tags    = []
    }) {
        this.data = { hash, cover, path, index, title, author, tags };
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

    remove() {
        this.data = {};
        this.deleted = true;
        MangaList = MangaList.filter(obj => obj.getOriginData() !== null);
        return true;
    }
}

// 初始化配置文件里的数据
const initialData = originData => originData.map( data => new Manga(data) );

// 获取漫画
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
                    resolve(getMangaListCopy());
                } catch(e) {
                    reject(e);
                }
            })
        }),
        // 不存在
        () => new Promise((resolve, reject) => {
            MangaList = [];
            fs.writeFile(CONFIG_PATH, '{"data":[]}', 'utf-8', err => {
                err ? reject(err) : resolve(getMangaListCopy())
            });
        })
    );
}

// 新增漫画
const addManga = function(newMangaList = []) {

    newMangaList.forEach(data => {
        MangaList.push(new Manga(clone(data))) 
    });

    return getMangaListCopy()
}

// 写入配置文件
const saveMangaConfig = function() {

    let configContent = MangaList.map(
        mangaData => mangaData.getOriginData()
    ).filter(mangaData => mangaData !== null);

    configContent = JSON.stringify({data:configContent});

    return new Promise((resolve, reject) => {
        fs.writeFile(CONFIG_PATH, configContent, 'utf-8', err => {
            err ? reject(err) : resolve(getMangaListCopy())
        });
    })
}

const deleteManga = function() {

}

// 获得对象拷贝
const getMangaListCopy = function() {
    return MangaList.filter(obj => obj.getOriginData() !== null).slice(0)
}

module.exports = {
    Manga,
    readConfigFile,
    addManga,
    saveMangaConfig,
    getMangaListCopy,
    deleteManga
}