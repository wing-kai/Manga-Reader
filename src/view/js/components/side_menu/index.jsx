const React = require('react');
const { remote } = require('electron');
const { Menu, MenuItem } = remote;

module.exports = React.createClass({

    getDefaultProps: () => ({
        list: [],
        active: 0,
        // handleAddList: name => (),
        handleAddList: false
        // handleEditList: (id, name) => (),
        // handleDeleteList: id => ()
    }),

    getInitialState: () => ({
        edit: false,
        add: false
    }),

    render() {

        const that = this;
        const thisState = this.state;
        const thisProps = this.props;

        return (
            <ul>
                <li className={thisProps.active === 0 ? "active" : ""} onClick={this.handleClickList.bind(that, 0)}>全部</li>
                {
                    thisProps.list.map(
                        li => (
                            <li
                                key={li.id}
                                className={thisProps.active === li.id ? "active" : ""}
                                onClick={this.handleClickList.bind(that, li.id)}
                                onDoubleClick={this.handleDoubleClickList.bind(that, li.id)}
                                onContextMenu={this.handleContextMenu.bind(that, li.id)}
                            >
                                {
                                    thisState.edit && (thisState.edit === li.id)
                                    ? (
                                        <input
                                            id='edit-list-input'
                                            type="text"
                                            autoFocus={true}
                                            onBlur={this.handleBlurEditInput}
                                            maxLength="8"
                                            defaultValue={li.name}
                                        />
                                    ) : li.name
                                }
                            </li>
                        )
                    )
                }
                {
                    thisProps.handleAddList && (thisState.add ? (
                        <li class="add-list">
                            <input
                                id='new-list-input'
                                type="text"
                                autoFocus={true}
                                onBlur={this.handleBlurAddInput}
                                onKeyPress={this.handleAddInputKeyPress}
                                maxLength="8"
                            />
                        </li>
                    ) : (
                        <li className="add-list" onClick={this.handleClickAddListBtn}>
                            <span className="icon ico-plus" />
                            新建
                        </li>
                    ))
                }
            </ul>
        )
    },

    handleClickList(id) {
        this.props.handleClickList(id);
    },

    handleContextMenu(id) {
        const menu = new Menu();
        const that = this;

        menu.append(new MenuItem({
            label: '编辑',
            click() { that.handleDoubleClickList(id) }
        }));
        menu.append(new MenuItem({
            label: '删除',
            click() { that.props.handleDeleteList(id) }
        }));

        menu.popup(remote.getCurrentWindow());
    },

    handleDoubleClickList(id) {
        this.setState({
            edit: id
        });
    },

    handleBlurEditInput() {
        const newName = document.getElementById("edit-list-input").value.trim();
        newName !== '' && this.props.handleEditList(this.state.edit, newName)
        this.setState({
            edit: false
        });
    },

    handleClickAddListBtn() {
        this.setState({
            add: true
        });
    },

    handleBlurAddInput() {
        const newList = document.getElementById('new-list-input').value.trim();
        newList !== '' && this.props.handleAddList(newList)
        this.setState({
            add: false
        });
    },

    handleAddInputKeyPress(event) {
        event.key === "Enter" && this.handleBlurAddInput();
    }
});