let Store = {}

const getStore = (Flux) => (
    Flux.createStore((next) => ({
        toggleSidebar: () => 1
    }))
)

export default getStore