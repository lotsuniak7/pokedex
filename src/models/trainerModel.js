/**
 * @file trainerModel.js
 * @description Modèle de données Mongoose pour la collection des Dresseurs (Trainers).
 * Gère le profil public des utilisateurs et leur progression dans le Pokédex.
 */

const mongoose = require('mongoose');

/**
 * Schéma Mongoose représentant le profil d'un Dresseur Pokémon.
 * * @typedef {Object} Trainer
 * @property {string} username - Le nom d'utilisateur unique lié au compte d'authentification. Requis.
 * @property {string} [imgUrl] - L'URL de l'image de profil/avatar du dresseur (optionnelle).
 * @property {string} trainerName - Le nom public du dresseur affiché sur sa carte (ex: "Sacha"). Requis.
 * @property {Date} creationDate - La date de création du profil (générée automatiquement).
 * @property {number[]} pkmnSeen - Liste des ID nationaux (Number) des Pokémon rencontrés/vus.
 * @property {number[]} pkmnCatch - Liste des ID nationaux (Number) des Pokémon capturés.
 */
const trainerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    imgUrl: { type: String },
    trainerName: { type: String, required: true },
    creationDate: { type: Date, default: Date.now },

    // Note d'architecture : Nous utilisons le type Number (National Dex ID)
    // pour faciliter l'intégration avec le frontend (qui manipule des entiers)
    // plutôt que des ObjectId Mongoose.
    pkmnSeen: [{ type: Number }],
    pkmnCatch: [{ type: Number }]

    // Ancienne implémentation stricte MongoDB (conservée pour historique) :
    // pkmnSeen: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pokemon' }],
    // pkmnCatch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pokemon' }]
});

module.exports = mongoose.model('Trainer', trainerSchema);