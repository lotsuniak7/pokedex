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

const addRegion = async (req, res) => {
    try {
        const { regionName, regionPokedexNumber, pkmnID } = req.body;

        const pokemon = await Pokemon.findById(pkmnID);
        if (!pokemon) {
            return res.status(404).json({ error: "Pokemon non trouvé" });
        }

        // Recherche si ce region déjà present
        const regionIndex = pokemon.regions.findIndex(r => r.regionName === regionName);

        if (regionIndex > -1) {
            // Si oui, mise à jour le numéro
            pokemon.regions[regionIndex].regionPokedexNumber = regionPokedexNumber;
        } else {
            // Sinon on ajoute
            pokemon.regions.push({ regionName, regionPokedexNumber });
        }

        await pokemon.save();
        res.status(200).json(pokemon);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'ajout de la region" });
    }
};

const deletePkmn = async (req, res) => {
    try {
        const { id } = req.query;
        const deleted = await Pokemon.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: "Pokemon non trouvé" });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Erreur de suppression" });
    }
};

const getOne = async (req, res) => {
    try {
        const { id, name } = req.query;
        let pokemon;

        if (id) {
            pokemon = await Pokemon.findById(id);
        } else if (name) {
            pokemon = await Pokemon.findOne({ name: name });
        }

        if (!pokemon) return res.status(404).json({ error: "Pokemon non trouvé" });
        res.status(200).json(pokemon);
    } catch (error) {
        res.status(500).json({ error: "Erreur" });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.query; // [cite: 93]
        if (!id) return res.status(400).json({ error: "ID requis" });

        // Mettre à jour que les champs qui ont été envoyés dans le corps de la requête
        const updatedPkmn = await Pokemon.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true } // Renvoie la nouvelle requette
        );

        if (!updatedPkmn) return res.status(404).json({ error: "Pokemon non trouvé" });
        res.status(200).json(updatedPkmn);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la modification" });
    }
};

const deleteRegion = async (req, res) => {
    try {
        const { pkmnID, regionName } = req.query;

        const pokemon = await Pokemon.findById(pkmnID);
        if (!pokemon) return res.status(404).json({ error: "Pokemon non trouvé" });

        // Filtrer array, en laissant tout sauf le region choisie
        pokemon.regions = pokemon.regions.filter(r => r.regionName !== regionName);

        await pokemon.save();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Erreur de suppression de region" });
    }
};

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