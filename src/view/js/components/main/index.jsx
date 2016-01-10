const React = require('react');
const EasyFlux = require('easy-flux' );

const Header = require('../headers');
const SideBar = require('../sidebar');

const { MainContext } = require('../context');
const getAction = require('./action');
const getStore = require('./store');

const Flux = new EasyFlux({ dev: true })
const Action = getAction(Flux)
const Store = getStore(Flux)

let Main = React.createClass({
    
    childContextTypes: MainContext,

    getChildContext() {
        return {
            showSideBar: Action.showSideBar,
            hideSideBar: Action.hideSideBar
        }
    },
    
    getInitialState() {

        this.storeListeners = Store.listen({
            showSideBar: this.handleToggleSideBar,
            hideSideBar: this.handleToggleSideBar,
        });

        return {
            sideBarVisible: true
        }
    },

    render() {
        const thisState = this.state;

        return (
            <div className="home">
                <Header />
                <div className="main-content">
                    <SideBar visible={thisState.sideBarVisible} />
                    {this.props.children}
                </div>
            </div>            
        )
    },
    
    componentWillUnmount() {
        Store.listenOff(this.storeListeners);
    },
    
    handleToggleSideBar(sideBarVisible) {
        this.setState({ sideBarVisible })
    }
});

module.exports = Main