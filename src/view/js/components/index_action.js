const getAction = (Flux) => (
    Flux.createAction((next) => ({
        toggleSidebar() {
            next()
        }
    }))
)

export default getAction