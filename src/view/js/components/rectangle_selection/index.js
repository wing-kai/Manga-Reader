const Immutable = require('immutable');

let Store = Immutable.Map({
    listeningElements: [],
    firstDownPosition: {
        x: 0,
        y: 0
    },
    keyboardPressing: "",
    selectedElements: new Set()
});
let selectedElementsHandler = () => {};
let deselectedAllElementsHandler = () => {};

const selectBoxDOM = document.createElement('div');
selectBoxDOM.className = 'select-box';

const handleMouseDown = event => {
    let downInElements = false;
    const firstDownPosition = {
        x: event.clientX,
        y: event.clientY
    }

    Store = Store.set('firstDownPosition', firstDownPosition);
    if (Store.get('keyboardPressing') === "")
        Store = Store.set('selectedElements', new Set());

    Store.get('listeningElements').toJS().forEach(element => {
        if (
            firstDownPosition.x > element.topLeftX
            && firstDownPosition.x < element.bottomRightX
            && firstDownPosition.y > element.topLeftY
            && firstDownPosition.y < element.bottomRightY
        )
            downInElements = true;
    });

    if (!downInElements) {
        deselectedAllElementsHandler();
        document.body.addEventListener('mousemove', handleMouseMove);
    }
}

const handleMouseMove = event => {

    const firstDownPosition = Store.get('firstDownPosition');
    const keyboardPressing = Store.get('keyboardPressing');

    const selectBoxDOM = document.getElementsByClassName('select-box')[0];
    let selectBox = selectBoxDOM.getBoundingClientRect();
    let newSelectedElements = new Set();
    let deselectedElements = new Set();
    let selectedElements = Store.get('selectedElements');

    selectBoxDOM.style.display = "block";
    selectBoxDOM.style.left = (event.clientX < firstDownPosition.x ? event.clientX : firstDownPosition.x) + 'px';
    selectBoxDOM.style.top = (event.clientY < firstDownPosition.y ? event.clientY : firstDownPosition.y) + 'px';
    selectBoxDOM.style.width = (event.clientX > firstDownPosition.x ? event.clientX - firstDownPosition.x : firstDownPosition.x - event.clientX) + 'px';
    selectBoxDOM.style.height = (event.clientY > firstDownPosition.y ? event.clientY - firstDownPosition.y : firstDownPosition.y - event.clientY) + 'px';

    selectBox = {
        topLeftX: +selectBox.left.toFixed(0),
        topLeftY: +selectBox.top.toFixed(0),
        topRightX: +selectBox.left.toFixed(0) + +selectBox.width.toFixed(0),
        topRightY: +selectBox.top.toFixed(0),
        bottomLeftX: +selectBox.left.toFixed(0),
        bottomLeftY: +selectBox.top.toFixed(0) + (+selectBox.height.toFixed(0)),
        bottomRightX: +selectBox.left.toFixed(0) + (+selectBox.width.toFixed(0)),
        bottomRightY: +selectBox.top.toFixed(0) + (+selectBox.height.toFixed(0))
    }

    Store.get('listeningElements').toJS().forEach(element => {
        if ((
            element.topLeftX > selectBox.topLeftX
            && element.topLeftY > selectBox.topLeftY
            && element.topLeftX < selectBox.bottomRightX
            && element.topLeftY < selectBox.bottomRightY
        ) || (
            element.topRightX > selectBox.bottomLeftX
            && element.topRightY < selectBox.bottomLeftY
            && element.topRightX < selectBox.topRightX
            && element.topRightY > selectBox.topRightY
        ) || (
            element.bottomLeftX > selectBox.topLeftX
            && element.bottomLeftY > selectBox.topLeftY
            && element.bottomLeftX < selectBox.bottomRightX
            && element.bottomLeftY < selectBox.bottomRightY
        ) || (
            element.bottomRightX > selectBox.topLeftX
            && element.bottomRightY > selectBox.topLeftY
            && element.bottomRightX < selectBox.bottomRightX
            && element.bottomRightY < selectBox.bottomRightY
        ) || (
            element.topLeftX < selectBox.topLeftX
            && element.topLeftY > selectBox.topLeftY
            && element.topRightX > selectBox.bottomRightX
            && element.topRightY < selectBox.bottomRightY
        ) || (
            element.topRightX > selectBox.topLeftX
            && element.topRightY < selectBox.topLeftY
            && element.bottomRightX < selectBox.bottomRightX
            && element.bottomRightY > selectBox.bottomRightY
        ) || (
            element.bottomLeftX < selectBox.topLeftX
            && element.bottomLeftY > selectBox.topLeftY
            && element.bottomRightX > selectBox.bottomRightX
            && element.bottomRightY < selectBox.bottomRightY
        ) || (
            element.topLeftX > selectBox.topLeftX
            && element.topLeftY < selectBox.topLeftY
            && element.bottomLeftX < selectBox.bottomRightX
            && element.bottomLeftY > selectBox.bottomRightY
        )) {
            if (keyboardPressing === "Alt") {
                deselectedElements = deselectedElements.add(element.id);
            } else if ( !selectedElements.has(element.id) ) {
                newSelectedElements = newSelectedElements.add(element.id);
            }
        } else if (selectedElements.has(element.id) && keyboardPressing === "") {
            deselectedElements = deselectedElements.add(element.id);
        }
    });

    if (newSelectedElements.size || deselectedElements.size) {
        selectedElements = new Set([...selectedElements, ...newSelectedElements]);
        selectedElements = [...selectedElements].filter(
            element => !deselectedElements.has(element)
        )
        selectedElements = new Set(selectedElements);
        Store = Store.set('selectedElements', selectedElements);
        selectedElementsHandler(Array.from(selectedElements));
    }
}

const handleMouseUp = event => {

    document.body.removeEventListener('mousemove', handleMouseMove);
    if (Store.get('selectedElements').size === 0)
        deselectedAllElementsHandler();

    Store = Store.set('firstDownPosition', {
        x: 0,
        y: 0
    });

    selectBoxDOM.removeAttribute('style');
}

const setSelectbleElements = (elements, flag) => {
    Store = Store.set('listeningElements', Immutable.List(
        elements.map(element => {
            const eBCR = element.getBoundingClientRect()
            return {
                id: element.dataset[flag],
                topLeftX: +eBCR.left.toFixed(0),
                topLeftY: +eBCR.top.toFixed(0),
                topRightX: +eBCR.left.toFixed(0) + +eBCR.width.toFixed(0),
                topRightY: +eBCR.top.toFixed(0),
                bottomLeftX: +eBCR.left.toFixed(0),
                bottomLeftY: +eBCR.top.toFixed(0) + +eBCR.height.toFixed(0),
                bottomRightX: +eBCR.left.toFixed(0) + +eBCR.width.toFixed(0),
                bottomRightY: +eBCR.top.toFixed(0) + +eBCR.height.toFixed(0)
            }
        })
    ));
}

const handleKeyDown = event => {
    Store = Store.set('keyboardPressing', event.keyIdentifier);
}

const handleKeyUp = event => {
    Store = Store.set('keyboardPressing', "");
}

const startListen = () => {

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    document.body.appendChild(selectBoxDOM);
    document.body.addEventListener('mousedown', handleMouseDown);
    document.body.addEventListener('mouseup', handleMouseUp);
}

const endListen = () => {

    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);

    document.body.removeEventListener('mousedown', handleMouseDown);
    document.body.removeEventListener('mouseup', handleMouseUp);
    if (document.getElementsByClassName('select-box')[0])
        document.body.removeChild(selectBoxDOM);

    selectedElementsHandler = () => {};
    deselectedAllElementsHandler = () => {};
}

module.exports = {
    setSelectbleElements,
    startListen,
    endListen,
    setSelectedElementsHandler: func => {
        selectedElementsHandler = func;
    },
    setDeselecteAllElementsHandler: func => {
        deselectedAllElementsHandler = func
    }
}