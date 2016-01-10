const getAction = (Flux) => (
    Flux.createAction( next => ({
        showSideBar() {
            next()
        },
        hideSideBar() {
            next()
        }
    }))
)

module.exports = getAction