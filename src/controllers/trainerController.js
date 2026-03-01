/**
 * @file trainerController.js
 * @description Contrôleur gérant le profil public du Dresseur.
 * Permet de créer, lire, modifier et supprimer le profil, ainsi que de
 * marquer des Pokémon comme vus ou capturés dans le Pokédex.
 */

const Trainer = require('../models/trainerModel');
const Pokemon = require('../models/pkmnModel');

/**
 * Crée un nouveau profil de Dresseur lié à l'utilisateur actuellement connecté.
 * @async
 * @function create
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.user - Les données de l'utilisateur extraites du token JWT.
 * @param {string} req.user.username - Le nom d'utilisateur.
 * @param {Object} req.body - Le corps de la requête.
 * @param {string} req.body.trainerName - Le nom public du dresseur.
 * @param {string} [req.body.imgUrl] - L'URL de l'avatar (optionnelle).
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie le profil créé (201) ou une erreur (400, 401, 500).
 */
const create = async (req, res) => {
    try {
        if (!req.user || !req.user.username) {
            return res.status(401).json({ error: "Username manquant dans le token !" });
        }

        const existing = await Trainer.findOne({ username: req.user.username });
        if (existing) {
            return res.status(400).json({ error: "Profil trainer déjà existant" });
        }

        const newTrainer = new Trainer({
            username: req.user.username,
            trainerName: req.body.trainerName,
            imgUrl: req.body.imgUrl || ""
        });

        await newTrainer.save();
        res.status(201).json(newTrainer);
    } catch (error) {
        // Log retiré pour ne pas polluer la console lors des tests
        res.status(500).json({ error: error.message });
    }
};

/**
 * Récupère le profil du Dresseur de l'utilisateur actuellement connecté.
 * @async
 * @function getProfile
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie les données du Dresseur (200) ou une erreur (404, 500).
 */
const getProfile = async (req, res) => {
    try {
        // Utilise .populate pour potentiellement hydrater les données des Pokémon (si configuré)
        const trainer = await Trainer.findOne({ username: req.user.username })
            .populate('pkmnSeen')
            .populate('pkmnCatch');

        if (!trainer) return res.status(404).json({ error: "Trainer non trouvé" });
        res.status(200).json(trainer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Met à jour les informations du profil Dresseur
 * @async
 * @function update
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.body - Les champs à mettre à jour.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie le profil mis à jour (200) ou une erreur (500).
 */
const update = async (req, res) => {
    try {
        const updatedTrainer = await Trainer.findOneAndUpdate(
            { username: req.user.username },
            { $set: req.body },
            { returnDocument: 'after' } // Équivalent à { new: true } pour renvoyer le document modifié
        );
        res.status(200).json(updatedTrainer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Supprime définitivement le profil Dresseur de l'utilisateur actuel.
 * @async
 * @function deleteProfile
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie un statut sans contenu (204) ou une erreur (500).
 */
const deleteProfile = async (req, res) => {
    try {
        await Trainer.findOneAndDelete({ username: req.user.username });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Ajoute un Pokémon à la liste des "Vus" ou "Capturés" du Dresseur.
 * Intègre une logique de compatibilité pour accepter soit un ObjectId (tests Jest),
 * soit un numéro de Pokédex.
 * @async
 * @function markPokemon
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.body - Le corps de la requête.
 * @param {string|number} req.body.pokemonId - L'ID du Pokémon (ObjectId ou Number).
 * @param {boolean} req.body.isCaptured - True si capturé, False si seulement vu.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie le profil mis à jour (200) ou une erreur (404, 500).
 */
const markPokemon = async (req, res) => {
    try {
        const { isCaptured } = req.body;
        let pokemonId = req.body.pokemonId;

        // 🧙‍♂️ ASTUCE D'ARCHITECTURE : Compatibilité Tests vs Frontend
        // Si la requête vient de Jest (ObjectId de 24 caractères), on cherche le vrai numéro (id)
        if (String(pokemonId).length === 24) {
            const pkmn = await Pokemon.findById(pokemonId);
            if (pkmn) pokemonId = pkmn.id;
        } else {
            // Si la requête vient du Frontend, c'est déjà un numéro de Pokédex
            pokemonId = Number(pokemonId);
        }

        const trainer = await Trainer.findOne({ username: req.user.username });
        if (!trainer) return res.status(404).json({ error: "Trainer non trouvé" });

        // S'assurer que les listes sont initialisées
        if (!trainer.pkmnCatch) trainer.pkmnCatch = [];
        if (!trainer.pkmnSeen) trainer.pkmnSeen = [];

        if (isCaptured) {
            // Ajouter dans la liste "Catch" en évitant les doublons
            const alreadyCaught = trainer.pkmnCatch.some(id => id.toString() === pokemonId.toString());
            if (!alreadyCaught) {
                trainer.pkmnCatch.push(pokemonId);
            }
        } else {
            // Ajouter dans la liste des Pokémon "Vus"
            const alreadySeen = trainer.pkmnSeen.some(id => id.toString() === pokemonId.toString());
            if (!alreadySeen) {
                trainer.pkmnSeen.push(pokemonId);
            }
        }

        await trainer.save();
        res.status(200).json(trainer);
    } catch (error) {
        console.error("Erreur markPokemon:", error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    create,
    getProfile,
    update,
    delete: deleteProfile,
    markPokemon
};