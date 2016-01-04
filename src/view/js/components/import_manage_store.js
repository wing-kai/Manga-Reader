import fs from 'fs';

let Store = {}

const getStore = (Flux) => (
    Flux.createStore(
        next => ({
            getMangaInfo(directories) {
                return directories;
            }
        })
    )
)

export default getStore