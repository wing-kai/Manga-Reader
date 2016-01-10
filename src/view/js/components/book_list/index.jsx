const React = require('react');
const Link = require('react-router').Link;
const EasyFlux = require('easy-flux');

const MangaManage = require('../../modules/manga_manage');
const MainContext = require('../context').MainContext;

const getAction = require('./action');
const getStore = require('./store');

const Flux = new EasyFlux({ dev: true });
// const Action = getAction(Flux);
// const Store = getStore(Flux);

let BookList = React.createClass({

    contextTypes: Object.assign({}, MainContext),

    render() {
        return (
            <div className="container">
                <div className="book-list">
                    {
                        MangaManage.getMangaListCopy().map(function(manga) {
                            return (
                                <Link to={"/reader/" + manga.get("hash")} className="manga-wrap" key={manga.get("hash")} title={manga.get("title")}>
                                    <img src={manga.get("path") + '/' + manga.get("cover")} alt={manga.get("title")} />
                                </Link>
                            )
                        })
                    }
                    <a className="manga-wrap empty"></a>
                    <a className="manga-wrap empty"></a>
                    <a className="manga-wrap empty"></a>
                    <a className="manga-wrap empty"></a>
                    <a className="manga-wrap empty"></a>
                    <a className="manga-wrap empty"></a>
                    <a className="manga-wrap empty"></a>
                </div>
            </div>
        )
    },

    componentDidMount() {
        this.context.showSideBar();
        // this.storeListeners = Store.listen({
        //     deletedManga: this.handleDeletedManga
        // })
    },

    handleClickDeleteBtn() {
    }
});

module.exports = BookList