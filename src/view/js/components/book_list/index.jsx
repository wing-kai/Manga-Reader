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

        const that = this;

        let bookList = MangaManage.getMangaListCopy().map(function(manga) {
            return (
                <div className="manga-wrap" key={manga.get("hash")} title={manga.get("title")}>
                    <Link to={"/reader/" + manga.get("hash")}>
                        <img src={manga.get("path") + '/' + manga.get("cover")} alt={manga.get("title")} />
                    </Link>
                    <button className="hover-delete" title='删除漫画' onClick={that.handleClickRemoveBtn.bind(that, manga)} />
                </div>
            )
        });

        return (
            <div className="container">
                <div className="book-list">
                    {
                        bookList.length ? [
                            bookList,
                            <a className="manga-wrap empty" />,
                            <a className="manga-wrap empty" />,
                            <a className="manga-wrap empty" />,
                            <a className="manga-wrap empty" />,
                            <a className="manga-wrap empty" />,
                            <a className="manga-wrap empty" />,
                            <a className="manga-wrap empty" />
                        ] : (
                            <Link className="empty-tips" to="/import">
                                你的书架上还没有任何漫画噢
                                <p />
                                点此添加漫画
                            </Link>
                        )
                    }
                </div>
            </div>
        )
    },

    componentDidMount() {
        this.context.showSideBar();
    },

    handleClickRemoveBtn(mangaObj) {
        const that = this;
        event.stopPropagation();
        mangaObj.remove();
        MangaManage.saveMangaConfig().then(() => {
            that.forceUpdate();
        });
    },

    handleDeletedManga() {

    }
});

module.exports = BookList