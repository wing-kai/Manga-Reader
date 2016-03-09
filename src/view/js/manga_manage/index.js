const fs        = require('fs');
const crypto    = require('crypto');
const Immutable = require('immutable');

const { Manga, MangaEvent }       = require('./manga');
const { Category, CategoryEvent } = require('./category');

const thumbnailTool = require('./thumbnail');

let mangaMap       = Immutable.Map({});
let categoriesList = Immutable.List([]);
let prefenceMap    = Immutable.Map({});
let authorMap      = Immutable.Map({});

const CONFIG_PATH = process.env.HOME + "/MangaRepo/.manga.json";
const REPO_PATH   = process.env.HOME + "/MangaRepo";

const FILE_TYPE = {
    DIR:  "FILE_TYPE_DIR",
    ZIP:  "application/zip",
    PDF:  "application/pdf",
    EPUB: "application/epub+zip",
}

// 函数节流
const throttle = (wait, func) => {
    let a = true;
    let b = false;
    let timeoutId;

    return immediate => {
        if (a || immediate) {
            timeoutId && clearTimeout(timeoutId);
            func();
            a = false;
            timeoutId = setTimeout(() => {
                b && func();
                timeoutId = undefined;
                a = true;
                b = false;
            }, wait);
        } else {
            b = true;
        }
    }
}

// promise封装的文件读取方法
const fileReader = (path, encode) => new Promise((resolve, reject) => {
    fs.readFile(path, encode, (err, bin) => {
        if (err) {
            reject(err);
            return;
        }
        resolve(bin);
    });
});

// 保存配置
const saveConfig = throttle(1000, () => {

    const allManga = mangaMap.toObject();
    for (let key in allManga)
        allManga[key] = allManga[key].getOriginData();

    const configContent = JSON.stringify({
        manga: allManga,
        categories: categoriesList.toArray().map(category => category.getOriginData()),
        prefence: prefenceMap.toObject()
    });

    fs.writeFile(CONFIG_PATH, configContent, 'utf-8', err => {
        if (err) {
            MangaEvent.saveFail();
            CategoryEvent.saveFail();
        } else {
            console.log('saved...');
            MangaEvent.saved();
            CategoryEvent.saved();
        }
    });
});

// 获取指定漫画 或 全部漫画
const getManga = hash => {
    if (hash) {
        return mangaMap.get(hash);
    }

    return mangaMap.toList().toJS() || [];
}

// 获取所有分类 或 分类下所有漫画
const getCategory = hash => {
    if (hash) {
        let mangaList;
        const foundCategory = categoriesList.toJS().some(category => {
            mangaList = category.get('manga');
            return category.get('hash') === hash;
        });

        return foundCategory ? Array.from(mangaList).map(hash => getManga(hash)) : [];
    }

    return categoriesList.toJS();
}

const addCategory = name => {
    categoriesList = categoriesList.push(new Category({ name }));
    saveConfig();
    return categoriesList;
}

const getAuthor = name => (
    name && (name in authorMap.toObject())
    ? authorMap.get(name).map(hash => getManga(hash))
    : Object.keys(authorMap.toObject())
);

const setAuthor = (author, hash) => {
    author = author === '' ? '未知作者' : author;
    if (author in authorMap.toObject()) {
        return authorMap.update(author, list => {
            list.push(hash);
            return list
        });
    } else {
        return authorMap.set(author, [hash]);
    }
}

// 创建缩略图
const createThumbnail = (fileType, hash, errorSet) => {
    if (fileType === FILE_TYPE.PDF) {
        return thumbnailTool.pdf(fileType, hash).catch(err => {
            console.error(err);
            return errorSet.add(hash);
        });
    } else if (fileType === FILE_TYPE.EPUB) {
        return thumbnailTool.epub(fileType, hash).catch(err => {
            console.error(err);
            return errorSet.add(hash);
        });
    } else if (fileType === FILE_TYPE.ZIP) {
        return thumbnailTool.zip(fileType, hash).catch(err => {
            console.error(err);
            return errorSet.add(hash);
        });
    } else {
        throw TypeError("File Type Not Support:" + fileType);
    }
}

// 读取配置文件
const initConfigFile = () => {
    const repoExists = new Promise((resolve, reject) => {
        fs.exists(
            REPO_PATH,
            exist => exist
            ? fs.exists(CONFIG_PATH, exist => exist ? resolve() : reject())
            : reject()
        );
    });

    return repoExists.catch(
        err => new Promise((resolve, reject) => {
            fs.mkdir(REPO_PATH, err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve()
            });
        })
    ).then(
        () => fileReader(CONFIG_PATH, 'utf-8')
    ).then(content => {
        const originData = JSON.parse(content);

        if ('manga' in originData) {
            for (let hash in originData.manga) {
                authorMap = setAuthor(originData.manga[hash].author, hash);
                mangaMap  = mangaMap.set(hash, new Manga(originData.manga[hash]));
            }
        }
        if ('categories' in originData) {
            originData.categories.forEach(data => {
                categoriesList = categoriesList.push(new Category(data))
            });
        }
        if ('prefence' in originData) {
            prefenceMap = Immutable.Map(originData.prefence);
        }

        return Promise.resolve(true);
    }).catch(
        err => new Promise((resolve, reject) => {
            fs.writeFile(CONFIG_PATH, '{"manga":{},"categories":[],"prefence":{}}', 'utf-8', err => {
                err ? reject(err) : resolve(true);
            })
        })
    )
}

// 导入漫画
const importManga = files => {

    let errorSet = new Set();
    let promiseList = [];
    files.forEach(file => {

        let ext, hash;

        switch(file.type) {
            case FILE_TYPE.ZIP:  ext = ".zip";  break;
            case FILE_TYPE.PDF:  ext = ".pdf";  break;
            case FILE_TYPE.EPUB: ext = ".epub"; break;
            default: throw TypeError("File Type Not Support:" + file.type);
        }

        const getMD5Hash = fileReader(file.path, 'binary').then(
            bin => crypto.createHash('md5').update(bin).digest('hex').slice(0, 8)
        );

        const promise = getMD5Hash.then(hash => {
            if (getManga(hash))
                return;

            const rs = fs.createReadStream(file.path);
            const ws = fs.createWriteStream(REPO_PATH + '/' + hash + ext);

            const copyPromise = new Promise(resolve => {
                rs.on('end', () => {
                    resolve(hash);
                });
                rs.on('error', err => {
                    errorSet.add(hash);
                    resolve(hash);
                });
            })

            rs.pipe(ws);

            return copyPromise.then(() => createThumbnail(file.type, hash, errorSet)).then(hash => {
                if (errorSet.has(hash)) {
                    return;
                } else {

                    const newManga = new Manga({
                        cover: REPO_PATH + '/' + hash + '.png',
                        hash: hash,
                        title: file.name.replace(/^(.+)\..+$/, "$1"),
                        fileType: file.type,
                        path: REPO_PATH + '/' + hash + ext
                    });

                    authorMap = setAuthor('', hash);
                    mangaMap  = mangaMap.set(hash, newManga);

                    return newManga;
                }
            });
        });

        promiseList.push(promise);
    });

    return Promise.all(promiseList).then(newMangaList => {
        saveConfig();
        return newMangaList;
    });
}

MangaEvent.listenSaveRequest(saveConfig);
CategoryEvent.listenSaveRequest(saveConfig);

module.exports = {
    initConfigFile,
    importManga,
    saveConfig,

    getManga,
    getCategory,
    getAuthor,

    addCategory
}