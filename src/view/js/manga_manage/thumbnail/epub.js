const fs = require('fs');
const EPub = require("epub");

const { binToImg, thumbnaility } = require('./common');

const REPO_PATH = process.env.HOME + "/MangaRepo";

module.exports = (fileType, hash) => {
    const epub = new EPub(REPO_PATH + '/' + hash + '.epub');
    let ext, imageName, mediaType;

    return (new Promise((resolve, reject) => {
        epub.on('end', () => {
            resolve(epub)
        });
        epub.on('error', reject);
        epub.parse();
    })).then(() => {
        for (var key in epub.manifest) {
            if (/cover/.test(key) && ((epub.manifest[key]['media-type'] || "").toLowerCase().trim().substr(0, 6) === "image/")) {
                mediaType = epub.manifest[key]['media-type'];
                imageName = key;
                break;
            }
        }

        return new Promise((resolve, reject) => {
            epub.getImage(imageName, (err, bin) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(bin);
            });
        });
    }).then(
        bin => binToImg({bin ,hash})
    ).then(
        thumbnaility
    );
};