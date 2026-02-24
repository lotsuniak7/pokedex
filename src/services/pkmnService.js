const PkmnType = require("../models/PkmnType");

// la fonction pour recuperer tous les pokemons
const getAllPokemons = async () => {
    return await Pokemon.find();
}

// Créer nouveau pokemon
const createPkmn = async (pkmnData) => {
    return await Pokemon.create(pkmnData);
};

module.exports = {
    getPokemonsTypes: require("../models/PkmnType"),
    getAllPokemons,
    createPkmn
};