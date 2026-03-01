/**
 * @file pkmnController.js
 * @description Contrôleur principal pour la gestion des Pokémon.
 * Gère les opérations CRUD
 * ainsi que la recherche avancée et la gestion des régions.
 */

const pkmnService = require('../services/pkmnService');
const Pokemon = require('../models/pkmnModel');

/**
 * Récupère la liste de tous les types de Pokémon disponibles.
 * @function getTypes
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {void} Renvoie un JSON contenant le tableau des types et le nombre total (200).
 */
const getTypes = (req, res) => {
    const types = pkmnService.getPokemonsTypes();
    res.status(200).json({
        data: types,
        count: types.length
    });
};

/**
 * Récupère l'intégralité des Pokémon présents dans la base de données.
 * @async
 * @function getAllPokemons
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie un JSON avec les données et le compteur (200), ou une erreur (500).
 */
const getAllPokemons = async (req, res) => {
    try {
        const pokemons = await pkmnService.getAllPokemons();
        res.status(200).json({ data: pokemons, count: pokemons.length });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la réception des Pokémons" });
    }
};

/**
 * Crée un nouveau Pokémon dans la base de données.
 * @async
 * @function create
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.body - Les données du Pokémon à créer.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie le Pokémon créé (201) ou une erreur de validation (400).
 */
const create = async (req, res) => {
    try {
        const newPkmn = await pkmnService.createPkmn(req.body);
        res.status(201).json(newPkmn);
    } catch (error) {
        // Le console.log a été retiré pour garder les logs de tests propres
        res.status(400).json({ error: error.message });
    }
};

/**
 * Recherche des Pokémon avec des filtres et gère la pagination.
 * @async
 * @function search
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.query - Les paramètres de la chaîne de requête (Query String).
 * @param {number} [req.query.page=1] - Le numéro de la page pour la pagination.
 * @param {number} [req.query.size=10] - Le nombre de résultats par page.
 * @param {string} [req.query.typeOne] - Premier filtre de type (ex: "FIRE").
 * @param {string} [req.query.typeTwo] - Deuxième filtre de type (ex: "FLYING").
 * @param {string} [req.query.partialName] - Recherche partielle par nom (insensible à la casse).
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie les Pokémon filtrés et le nombre total correspondant (200).
 */
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

/**
 * Ajoute une nouvelle région ou met à jour le numéro d'une région existante pour un Pokémon.
 * @async
 * @function addRegion
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.body - Les données de la région.
 * @param {string} req.body.regionName - Le nom de la région (ex: "Kanto").
 * @param {number} req.body.regionPokedexNumber - Le numéro dans le Pokédex de cette région.
 * @param {string} req.body.pkmnID - L'ID MongoDB du Pokémon cible.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie le Pokémon mis à jour (200) ou une erreur (404, 500).
 */
const addRegion = async (req, res) => {
    try {
        const { regionName, regionPokedexNumber, pkmnID } = req.body;

        const pokemon = await Pokemon.findById(pkmnID);
        if (!pokemon) {
            return res.status(404).json({ error: "Pokemon non trouvé" });
        }

        // Recherche si cette région est déjà présente
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

/**
 * Supprime définitivement un Pokémon de la base de données.
 * @async
 * @function deletePkmn
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.params - Les paramètres dynamiques de l'URL.
 * @param {string} req.params.id - L'ID MongoDB du Pokémon à supprimer.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie un statut de succès sans contenu (204) ou une erreur (404, 500).
 */
const deletePkmn = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Pokemon.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: "Pokemon non trouvé" });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Erreur de suppression" });
    }
};

/**
 * Récupère un Pokémon spécifique en cherchant par son ID MongoDB ou son nom.
 * @async
 * @function getOne
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.query - Les paramètres de la requête.
 * @param {string} [req.query.id] - L'ID MongoDB du Pokémon.
 * @param {string} [req.query.name] - Le nom exact du Pokémon.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie le Pokémon trouvé (200) ou une erreur (404, 500).
 */
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

/**
 * Met à jour les informations d'un Pokémon existant.
 * @async
 * @function update
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.params - Les paramètres de l'URL.
 * @param {string} req.params.id - L'ID MongoDB du Pokémon à modifier.
 * @param {Object} req.body - Les champs à mettre à jour.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie le Pokémon mis à jour (200) ou une erreur (400, 404, 500).
 */
const update = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) return res.status(400).json({ error: "ID requis" });

        // Mettre à jour que les champs qui ont été envoyés dans le corps de la requête
        const updatedPkmn = await Pokemon.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true } // Renvoie la nouvelle requête
        );

        if (!updatedPkmn) return res.status(404).json({ error: "Pokemon non trouvé" });
        res.status(200).json(updatedPkmn);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la modification" });
    }
};

/**
 * Supprime une région spécifique du tableau des régions d'un Pokémon.
 * @async
 * @function deleteRegion
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.query - Les paramètres de la requête.
 * @param {string} req.query.pkmnID - L'ID MongoDB du Pokémon.
 * @param {string} req.query.regionName - Le nom de la région à retirer.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie un statut sans contenu (204) ou une erreur (404, 500).
 */
const deleteRegion = async (req, res) => {
    try {
        const { pkmnID, regionName } = req.query;

        const pokemon = await Pokemon.findById(pkmnID);
        if (!pokemon) return res.status(404).json({ error: "Pokemon non trouvé" });

        // Filtrer array, en laissant tout sauf la region choisie
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