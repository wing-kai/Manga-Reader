let Store = {}

const getStore = Flux => (
    Flux.createStore( next => ({
        showSideBar: () => true,
        hideSideBar: () => false
    }))
)

export default getStore