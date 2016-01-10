const fs = require('fs');
const { clone } = require('../../modules/util');

const getAction = Flux => (
    Flux.createAction( next => ({
    }))
)

module.exports = getAction