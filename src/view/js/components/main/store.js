const fs = require('fs');
const crypto = require('crypto');
const { REGEXP } = require('../common/constants');
const MangaManage = require('../../modules/manga_manage');

const getStore = Flux => (
    Flux.createStore( next => ({
        getMangaInfo(directories) {
            const readDirTask = directories.map(dirPath => {
                return new Promise((resolve, reject) => {
                    fs.readdir(dirPath, (err, fileNameArray) => {
                        err ? reject(err) : resolve(fileNameArray)
                    })
                })
            });

            const MangaListTitle = MangaManage.getMangaListCopy().map(manga => manga.get('title'))

            return Promise.all(readDirTask).then(
                contentList => contentList.map(
                    (dirContent, i) => {

                        let cover;

                        const path = directories[i];
                        const title = path.replace(REGEXP.MANGA_TITLE, "$1");

                        const hasImg = dirContent.some( fileName => {
                            cover = fileName;
                            return REGEXP.IMAGE_FILE.test(fileName) && fs.statSync(path+ '/' + fileName).isFile()
                        });

                        const alreadyExport = MangaListTitle.some(t => t === title);

                        if (!hasImg || alreadyExport)
                            return null;

                        return {
                            hash: crypto.createHash('md5').update(title).digest('hex').slice(0, 8),
                            title,
                            cover,
                            path
                        }
                    }
                ).filter(
                    item => item !== null
                )
            ).then(
                newManga => MangaManage.addManga(newManga)
            );
        }
    }))
)

module.exports = getStore;