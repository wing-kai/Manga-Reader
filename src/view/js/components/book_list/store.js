const fs = require('fs');
const crypto = require('crypto');
const { clone } = require('../../modules/util');
const MangaManage = require('../../modules/manga_manage');

let Store = {
    newMangaList: []
}

const getStore = Flux => (
    Flux.createStore(
        next => ({
            
        })
    )
)

module.exports = getStore