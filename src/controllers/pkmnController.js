const pkmnService = require('../services/pkmnService');

const getTypes = (req, res) => {
    const types = pkmnService.getPokemonsTypes();
    res.status(200).json({
        data: types,
        count: types.length
    });
};

module.exports = { getTypes };