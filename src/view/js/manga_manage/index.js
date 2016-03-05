const fs = require('fs');
const crypto = require('crypto');
const Immutable = require('immutable');

const { Manga, MangaEvent }       = require('./manga');
const { Category, CategoryEvent } = require('./category');

const thumbnailTool = require('./thumbnail');

let mangaMap       = Immutable.Map({});
let categoriesList = Immutable.List([]);
let prefenceMap    = Immutable.Map({});

const CONFIG_PATH = process.env.HOME + "/MangaRepo/.manga.json";
const REPO_PATH = process.env.HOME + "/MangaRepo";

const FILE_TYPE = {
    DIR:  "FILE_TYPE_DIR",
    ZIP:  "application/zip",
    PDF:  "application/pdf",
    EPUB: "application/epub+zip",
}

const debounce = (wait, func) => {
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

const fileReader = (path, encode) => new Promise((resolve, reject) => {
    fs.readFile(path, encode, (err, bin) => {
        if (err) {
            reject(err);
            return;
        }
        resolve(bin);
    });
});

const saveConfig = debounce(1000, () => {
    console.log('saved...');
    MangaEvent.saved();
    CategoryEvent.saved();

    // when error
    // MangaEvent.saveFail();
    // CategoryEvent.saveFail();
});

// 获取指定漫画 或 全部漫画
const getManga = hash => {
    if (hash) {
        return mangaMap.get(hash);
    }

    const map = mangaMap.toJS();
    return Object.keys(map).map(hash => map[hash]) || [];
}

// 获取所有分类 或 分类下所有漫画
const getCategory = hash => {
    if (hash) {
        const category = categoriesList.toJS().filter(
            category => category.get('hash') === hash
        );

        return category.length ? category[0].map(hash => getManga(hash)) : [];
    }

    return categoriesList.toJS();
}

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

const initConfigFile = () => {
    const fileExists = new Promise((resolve, reject) => {
        fs.exists(
            REPO_PATH,
            exist => exist
            ? fs.exists(CONFIG_PATH, exist => exist ? resolve() : reject())
            : reject()
        );
    });

    return fileExists.then(
        () => fileReader(CONFIG_PATH, 'utf-8').then(content => {
            try {
                const originData = JSON.parse(content);

                if ('manga' in originData) {
                    Object.keys(originData.manga, hash => {
                        mangaMap.set(hash, new Manga(originData.manga[hash]));
                    });
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
            } catch(e) {
                return Promise.reject(e);
            }
        }),
        () => new Promise((resolve, reject) => {
            fs.mkdir(REPO_PATH, err => {
                if (err) {
                    reject(err);
                    return;
                }

                fs.writeFile(CONFIG_PATH, '{"manga":{},"categories":[],"prefence":{}}', 'utf-8', err => {
                    err ? reject(err) : resolve(true);
                });
            });
        })
    );
}

const importManga = files => {

    let errorSet = new Set();
    let promiseList = [];
    files.forEach(file => {

        let ext, md5;

        switch(file.type) {
            case FILE_TYPE.ZIP:  ext = ".zip";  break;
            case FILE_TYPE.PDF:  ext = ".pdf";  break;
            case FILE_TYPE.EPUB: ext = ".epub"; break;
            default: throw TypeError("File Type Not Support:" + file.type);
        }

        const getMD5 = fileReader(file.path, 'binary').then(
            bin => crypto.createHash('md5').update(bin).digest('hex').slice(0, 8)
        );

        const promise = getMD5.then(md5 => {
            if (getManga(md5))
                return;

            const rs = fs.createReadStream(file.path);
            const ws = fs.createWriteStream(REPO_PATH + '/' + md5 + ext);

            const copyPromise = new Promise(resolve => {
                rs.on('end', () => {
                    resolve(md5);
                });
                rs.on('error', err => {
                    errorSet.add(md5);
                    resolve(md5);
                });
            })

            rs.pipe(ws);

            return copyPromise.then(() => createThumbnail(file.type, md5, errorSet)).then(md5 => {
                if (errorSet.has(md5)) {
                    return;
                } else {

                    const newManga = new Manga({
                        cover: REPO_PATH + '/' + md5 + '.png',
                        hash: md5,
                        title: file.name,
                        fileType: file.type,
                        path: REPO_PATH + '/' + md5 + ext
                    });

                    mangaMap = mangaMap.set(md5, newManga);

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
    saveConfig,
    importManga,
    initConfigFile,
    getManga
}