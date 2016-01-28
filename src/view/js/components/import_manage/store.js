const fs = require('fs');
const crypto = require('crypto');
const Immutable = require('immutable');
const { clone } = require('../../modules/util');
const MangaManage = require('../../modules/manga_manage');

let Store = Immutable.Map({
    newMangaList: []
})

const getStore = Flux => (
    Flux.createStore(
        next => ({
            getMangaInfo(directories) {

                // 遍历选中的漫画目录、是否有重复添加，然后再获取每个漫画目录名称的md5值
                const newMangaInfo = clone(directories).filter(
                    ({ title }) => !Store.get('newMangaList').some(
                        item => item.title === title
                    ) && !MangaManage.getMangaListCopy().some(
                        manga => manga.get("title") === title
                    )
                ).map( item => {
                    item.hash = crypto.createHash('md5').update(item.title).digest('hex').slice(0, 6);
                    return item;
                });

                Store = Store.set('newMangaList', Store.get('newMangaList').concat(newMangaInfo));
                return newMangaInfo;
            },
            
            getNewMangaList: () => Store.get('newMangaList'),
            
            deleteManga(delHash) {
                
                let deletedManga;
                let hasMore;

                let newMangaList = Store.get('newMangaList').filter( mangaInfo => {
                    if (mangaInfo.hash === delHash) {
                        deletedManga = mangaInfo;
                        return false;
                    }
                    
                    return true;
                });
                
                Store = Store.set('newMangaList', newMangaList);
                hasMore = (Store.get('newMangaList').length ? true : false);
                
                return { deletedManga, hasMore };
            },

            clearNewMangaList() {
                Store.set('newMangaList', []);
                return;
            },

            saveNewManga() {
                MangaManage.addManga(Store.get('newMangaList'));
                return MangaManage.saveMangaConfig();
            }
        })
    )
)

module.exports = getStore