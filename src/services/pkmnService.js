const PkmnType = require("../models/PkmnType");

const getPokemonsTypes = () => {
    return PkmnType;
}

module.exports = {getPokemonsTypes};