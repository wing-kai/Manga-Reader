const getAction = (Flux) => (
    Flux.createAction((next) => ({
        showSideBar() {
            next()
        },
        hideSideBar() {
            next()
        }
    }))
)

export default getAction