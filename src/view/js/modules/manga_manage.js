const { clone } = require('./util');
const fs = require('fs');
const Immutable = require('immutable');
const { CONFIG_PATH, REGEXP, VIEW_MODE } = require('../components/common/constants');

let MangaList = Immutable.List([]);
let Categories = Immutable.List([]);

class Manga {

    constructor({
        hash       = "",
        cover      = "",
        path       = "",
        index      = 0,
        title      = "",
        author     = "",
        category   = [],
        lastReaded = 0,
        viewMode   = VIEW_MODE.SINGLE
    }) {
        this.data = { hash, cover, path, index, title, author, category, lastReaded, viewMode };
        this.deleted = false;
    }

    get(key) {
        return ('data' in this && key in this.data) ? clone(this.data[key]) : null;
    }

    set(values) {
        for( var key in values ) {
            if (key in this.data) {
                this.data[key] = clone(values[key]);
            }
        }
        return this;
    }

    setCategory(name) {
        if (!this.category.some(category => category === name)) {
            this.category.push(name);
        }

        return this;
    }

    removeFromCategory(name) {
        this.category.filter = this.category.filter(category => category !== name);
        return this;
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
                    const originData = JSON.parse(content);
                    MangaList  = Immutable.List('manga' in originData ? originData.manga.map( data => new Manga(data) ) : []);
                    Categories = Immutable.List('categories' in originData ? originData.categories : []);
                    resolve(true);
                } catch(e) {
                    reject(e);
                }
            })
        }),
        // 不存在
        () => new Promise((resolve, reject) => {
            MangaList = Immutable.List([]);
            fs.writeFile(CONFIG_PATH, '{"manga":[],"categories":[]}', 'utf-8', err => {
                err ? reject(err) : resolve(true);
            });
        })
    );
}

// 新增漫画
const addManga = (newMangaList = []) => {

    newMangaList.forEach(data => {
        MangaList = MangaList.push(new Manga(clone(data))); 
    });

    return MangaList.toJS();
}

// 写入配置文件
const saveConfig = () => {

    const configContent = JSON.stringify({
        manga: MangaList.map( mangaData => mangaData.getOriginData() ).filter( mangaData => mangaData !== null ).toJS(),
        categories: Categories.toJS()
    });

    return new Promise((resolve, reject) => {
        fs.writeFile(CONFIG_PATH, configContent, 'utf-8', err => {
            err ? reject(err) : resolve(MangaList.toJS())
        });
    })
}

const deleteManga = () => {

}

const addCategory = name => {
    Categories = Categories.push(name);
    return Categories.toJS();
}

// 获取全部分类 或 某个分类旗下所有漫画
const getCategory = (name = false) => {
    if (name) {
        return MangaList.toJS().filter(
            mangaData => mangaData.get('category').some(
                category => category === name
            )
        );
    }
    return Categories.toJS();
}

const deleteCategory = name => {
    const categoryFilter = category => category !== name;
    Categories = Categories.filter(categoryFilter);
    MangaList = MangaList.filter(
        mangaData => mangaData.set({
            category: mangaData.get('category').filter(categoryFilter)
        })
    )
    return Categories.toJS();
}

// 获得对象拷贝
const getMangaListCopy = () => MangaList.toJS();

const getManga = hash => {
    const findResult = MangaList.toJS().filter(mangaData => mangaData.get('hash') === hash);
    return findResult.length ? findResult[0] : false;
}

module.exports = {
    Manga,
    readConfigFile,
    addManga,
    saveConfig,
    getMangaListCopy,
    deleteManga,
    getManga,
    addCategory,
    getCategory,
    deleteCategory
}