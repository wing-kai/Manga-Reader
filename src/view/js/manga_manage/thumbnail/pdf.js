const fs = require('fs');
const PDFJS = require('pdfjs-dist');

const { binToImg, thumbnaility } = require('./common');

const REPO_PATH = process.env.HOME + "/MangaRepo";

module.exports = (fileType, hash) => (new Promise((resolve, reject) => {
    fs.readFile(REPO_PATH + '/' + hash + '.pdf', (err, data) => {
        if (err) {
            reject(err);
            return;
        }

        resolve(new Uint8Array(data));
    });
})).then(
    data => PDFJS.getDocument(data)
).then(
    pdfDocument => pdfDocument.getPage(1)
).then(page => {

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const viewport = page.getViewport(1);

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    return Promise.resolve(page.render({
        canvasContext: context,
        viewport: viewport
    })).then(
        () => canvas
    );

}).then(
    canvas => new Promise(function(resolve, reject) {
        const image = new Image();
        document.body.appendChild(canvas);
        image.onload = resolve.bind(this, {canvas, image, hash});
        image.onerror = reject;
        image.src = canvas.toDataURL("image/png");
    })
).then(thumbnaility);