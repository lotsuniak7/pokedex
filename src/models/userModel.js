/**
 * @file userModel.js
 * @description Modèle de données Mongoose pour la collection des Utilisateurs (Users).
 * Gère les comptes de connexion, la sécurité (mots de passe) et les permissions (rôles).
 */

const mongoose = require('mongoose');

/**
 * Schéma Mongoose représentant un compte Utilisateur.
 * @typedef {Object} User
 * @property {string} username - Le nom d'utilisateur unique utilisé pour la connexion. Requis.
 * @property {string} password - Le mot de passe de l'utilisateur (doit être haché/crypté en base). Requis.
 * @property {'ADMIN' | 'TRAINER'} role - Le niveau d'accès de l'utilisateur. Restreint à deux valeurs. Par défaut : 'TRAINER'.
 * @property {number[]} pokemonSeen - Liste des identifiants (ID nationaux) des Pokémon rencontrés.
 * @property {number[]} pokemonCaught - Liste des identifiants (ID nationaux) des Pokémon capturés.
 */
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Utilisation d'un "enum" pour sécuriser les rôles possibles dans la base
    role: { type: String, enum: ['ADMIN', 'TRAINER'], default: 'TRAINER' },

    // Les listes pour le suivi du Pokédex (stockage des ID sous forme de nombres)
    pokemonSeen: [{ type: Number }],
    pokemonCaught: [{ type: Number }],
});

module.exports = mongoose.model('User', userSchema);