const pkmnService = require('../services/pkmnService');

const getTypes = (req, res) => {
    const types = pkmnService.getPokemonsTypes();
    res.status(200).json({
        data: types,
        count: types.length
    });
};

const getAllPokemons = async (req, res) => {
    try {
        const pokemons = await pkmnService.getAllPkmn();
        res.status(200).json({ data: pokemons, count: pokemons.length });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la réception des Pokémons" });
    }
};

const create = async (req, res) => {
    try {
        const newPkmn = await pkmnService.createPkmn(req.body);
        res.status(201).json(newPkmn);
    } catch (error) {
        res.status(400).json({ error: "Échec de la création du Pokémon" });
    }
};

module.exports = { getTypes, getAllPokemons, create };