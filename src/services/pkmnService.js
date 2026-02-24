//const PkmnType = require("../models/PkmnType");
const Pokemon = require('../models/pkmnModel');

// la fonction pour recuperer tous les pokemons
const getAllPokemons = async () => {
    return await Pokemon.find();
}

// Créer nouveau pokemon
const createPkmn = async (pkmnData) => {
    // Verification si ce pokemon n'existe pas
    const existing = await Pokemon.findOne({ name: pkmnData.name });
    if (existing) throw new Error('Pokemon déjà existe');

    // Création
    return await Pokemon.create(pkmnData);
};

const getPokemonsTypes = () => {
    return ["FIRE", "WATER", "GRASS", "FLYING"];
};

module.exports = {
    getAllPokemons,
    createPkmn,
    getPokemonsTypes
};