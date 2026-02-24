const pkmnService = require('../services/pkmnService');
const Pokemon = require('../models/pkmnModel');

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
        console.log("Erreur:", error.message);
        res.status(400).json({ error: error.message });
    }
};

const search = async (req, res) => {
    try {
        const { page = 1, size = 10, typeOne, typeTwo, partialName } = req.query;
        let query = {};

        // filtre par partie du nom (insensible à la casse)
        if (partialName) query.name = { $regex: partialName, $options: 'i' };

        // filtre par les types
        if (typeOne || typeTwo) {
            query.types = { $in: [typeOne, typeTwo].filter(Boolean) };
        }

        const data = await Pokemon.find(query)
            .limit(size * 1)
            .skip((page - 1) * size);

        const count = await Pokemon.countDocuments(query);
        res.status(200).json({ data, count });
    } catch (error) {
        res.status(500).send();
    }
};

// Cela pour que serveur ne tombe pas
const getOne = async (req, res) => res.status(200).json({ message: "GetOne marche" });
const update = async (req, res) => res.status(200).json({ message: "Update marche" });
const deletePkmn = async (req, res) => res.status(204).send();
const addRegion = async (req, res) => res.status(200).json({ message: "AddRegion marche" });
const deleteRegion = async (req, res) => res.status(204).send();

module.exports = {
    getTypes,
    getAllPokemons,
    create,
    search,
    getOne,
    update,
    delete: deletePkmn,
    addRegion,
    deleteRegion
};