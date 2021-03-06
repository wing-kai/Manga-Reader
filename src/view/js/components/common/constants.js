const VIEW_MODE = {
    SINGLE: "VIEW_MODE_SINGLE",
    DOUBLE: "VIEW_MODE_DOUBLE",
    WATERFALL: "VIEW_MODE_WATERFALL"
}

const READ_MODE = {
    TRADITION: "READ_MODE_TRADITION",
    MORDEN: "READ_MODE_MORDEN"
}

const CONFIG_PATH = process.env.dev === 'true' ? "manga.json" : process.env.HOME + "/.manga.json";

const REGEXP = {
    IMAGE_FILE: /^.+(\.png|\.jpg|\.bmp)$/,
    MANGA_TITLE: /^.+\/(.+)$/
}

module.exports = {
    VIEW_MODE,
    READ_MODE,
    CONFIG_PATH,
    REGEXP
}