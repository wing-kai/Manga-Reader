const fs = require('fs');

const REPO_PATH = process.env.HOME + "/MangaRepo";

const binToImg = args => {
    const { bin, hash } = args;
    return (
        new Promise((resolve, reject) => {
            const imgPath = REPO_PATH + '/' + hash + '.' + 'png';
            fs.writeFile(imgPath, bin, 'binary', err => {
                if (err){
                    reject(err);
                    return;
                }
                resolve(imgPath)
            });
        })
    ).then(
        imgPath => new Promise(function(resolve, reject) {

            const canvas = document.createElement('canvas');
            const image = new Image();

            image.onload = resolve.bind(this, {canvas, image, hash});
            image.onerror = reject;
            image.src = imgPath;
        })
    );
}

const scale = image => {
    return 600 / (image.width > image.height ? image.width : image.height)
}

const thumbnaility = args => {
    const { canvas, image, hash } = args;
    const tempCanvas = document.createElement('canvas');
    const context = tempCanvas.getContext('2d');

    canvas.width = Math.trunc(image.width * scale(image));
    canvas.height = Math.trunc(image.height * scale(image));
    tempCanvas.width = image.width * 0.5;
    tempCanvas.height = image.height * 0.5;

    context.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);
    context.drawImage(tempCanvas, 0, 0, tempCanvas.width * 0.5, tempCanvas.height * 0.5);
    canvas.getContext('2d').drawImage(
        tempCanvas,
        0, 0,
        tempCanvas.width * 0.5,
        tempCanvas.height * 0.5,
        0, 0,
        Math.trunc(image.width * scale(image)),
        Math.trunc(image.height * scale(image))
    );

    return new Promise((resolve, reject) => {
        fs.writeFile(
            REPO_PATH + '/' + hash + '.png',
            canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/,""),
            'base64',
            err => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(hash);
            }
        );
    });
}

module.exports = {
    binToImg,
    thumbnaility
}