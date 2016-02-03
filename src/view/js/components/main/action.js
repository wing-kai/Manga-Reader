const getAction = (Flux) => (
    Flux.createAction( next => ({
        getMangaInfo(selectedDirectories) {
            next(selectedDirectories)
        }
    }))
)

module.exports = getAction;