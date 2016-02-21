const fs = require('fs');
const JSZip = require('JSZip');

const { binToImg, thumbnaility } = require('./common');

const REPO_PATH = process.env.HOME + "/MangaRepo";

module.exports = (fileType, hash) => (new Promise((resolve, reject) => {
    fs.readFile(REPO_PATH + '/' + hash + '.zip', (err, data) => {
        if (err) {
            reject(err);
            return;
        }
        resolve(data);
    });
})).then(data => {
    const zip = new JSZip();
    return zip.load(data);
}).then(zipContent => {
    const zipContentFiles = zipContent.files;
    let bin;

    if ('cover' in zipContentFiles) {
        bin = zipContentFiles.cover.asBinary();
    } else {
        for (let name in zipContentFiles) {
            if (/(\.png)|(\.jpg)|(\.jpeg)|(\.bmp)/.test(name)) {
                bin = zipContentFiles[name].asBinary();
                break;
            }
        }
    }

    return bin;
}).then(
    bin => binToImg({bin ,hash})
).then(
    thumbnaility
);