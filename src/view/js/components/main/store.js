const getStore = Flux => (
    Flux.createStore( next => ({
        showSideBar: () => true,
        hideSideBar: () => false
    }))
)

module.exports = getStore