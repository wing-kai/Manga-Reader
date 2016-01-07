import React from 'react'
import EasyFlux from 'easy-flux' 

import Header from '../headers'
import SideBar from '../sidebar'

import { MainContext } from '../context'
import getAction from './action'
import getStore from './store'

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

export default Main