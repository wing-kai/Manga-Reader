import fs from 'fs';
import crypto from 'crypto';
import { clone } from '../modules/util';

let Store = {
    newMangaList: []
}

const getStore = (Flux) => (
    Flux.createStore(
        next => ({
            getMangaInfo(directories) {
                
                // 遍历选中的漫画目录、是否有重复添加，然后再获取每个漫画目录名称的md5值
                const newMangaInfo = clone(directories).filter(
                    ({ title }) => !Store.newMangaList.some(
                        item => item.title === title
                    )
                ).map( item => {
                    item.hash = crypto.createHash('md5').update(item.title).digest('hex').slice(0, 6);
                    return item;
                });

                Store.newMangaList = Store.newMangaList.concat(newMangaInfo);
                return newMangaInfo;
            },
            
            getNewMangaList: () => clone(Store.newMangaList),
            
            deleteManga(delHash) {
                
                let deletedManga;
                let hasMore;

                let newMangaList = Store.newMangaList.filter( mangaInfo => {
                    if (mangaInfo.hash === delHash) {
                        deletedManga = mangaInfo;
                        return false;
                    }
                    
                    return true;
                });
                
                Store.newMangaList = clone(newMangaList);
                hasMore = (Store.newMangaList.length ? true : false);
                
                return { deletedManga, hasMore };
            }
        })
    )
)

export default getStore