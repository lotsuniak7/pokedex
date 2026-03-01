/**
 * @file pkmnModel.js
 * @description Modèle de données Mongoose pour la collection des Pokémon.
 * Définit la structure exacte d'un Pokémon dans la base de données MongoDB.
 */

const mongoose = require('mongoose');

/**
 * Schéma Mongoose représentant un Pokémon.
 * * @typedef {Object} Pokemon
 * @property {number} id - L'identifiant national du Pokémon (National Pokédex ID). Doit être unique.
 * @property {string} name - Le nom du Pokémon (ex: "Bulbasaur"). Requis.
 * @property {string[]} types - Les types élémentaires du Pokémon (ex: ["GRASS", "POISON"]).
 * @property {string} [description] - Une brève description du Pokémon pour le Pokédex (optionnelle).
 * @property {string} [imageUrl] - L'URL pointant vers l'image ou le sprite du Pokémon (optionnelle).
 * @property {Object[]} regions - Liste des régions où ce Pokémon est présent.
 * @property {string} regions.regionName - Le nom de la région (ex: "Kanto", "Johto"). Requis.
 * @property {number} regions.regionPokedexNumber - Le numéro du Pokémon dans le Pokédex spécifique à cette région. Requis.
 */
const pokemonSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: { type: String, required: true },
    types: [{ type: String }],
    description: { type: String },
    imageUrl: { type: String },
    regions: [{
        regionName: { type: String, required: true },
        regionPokedexNumber: { type: Number, required: true }
    }]
});

module.exports = mongoose.model('Pokemon', pokemonSchema);