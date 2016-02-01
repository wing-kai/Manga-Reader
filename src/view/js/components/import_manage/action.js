const fs = require('fs');

const REGEXP = {
    IMAGE_FILE: /^.+(\.png|\.jpg|\.gif|\.bmp)$/,
    MANGA_TITLE: /^.+\/(.+)$/
}

const getAction = Flux => (
    Flux.createAction( next => ({
        getMangaInfo(directories) {
            let readDirTask = directories.map(dirPath => {
                return new Promise((resolve, reject) => {
                    fs.readdir(dirPath, (err, fileNameArray) => {
                        err ? reject(err) : resolve(fileNameArray)
                    })
                })
            });

            Promise.all(readDirTask).then( contentList => {
                next(
                    contentList.map((dirContent, i) => {
                        let cover;
                        const hasImg = dirContent.some( fileName => {
                            cover = fileName;
                            return REGEXP.IMAGE_FILE.test(fileName) && fs.statSync(directories[i]+ '/' + fileName).isFile()
                        } );

                        return hasImg ? {
                            path: directories[i],
                            cover,
                            title: directories[i].replace(REGEXP.MANGA_TITLE, "$1")
                        } : null;
                    }).filter(item => item !== null)
                )
            });
        },

        deleteManga(hash) {
            next(hash)
        },

        saveNewManga() {
            next()
        }
    }))
)

module.exports = getAction