/**
 * @file pkmnService.js
 * @description Couche de service pour la gestion des Pokémon.
 * Encapsule la logique métier et les interactions directes avec la base de données (Mongoose).
 */

const Pokemon = require('../models/pkmnModel');

/**
 * Récupère l'intégralité des Pokémon stockés dans la base de données.
 * @async
 * @function getAllPokemons
 * @returns {Promise<Object[]>} Renvoie une promesse résolue avec un tableau de documents Pokémon.
 */
const getAllPokemons = async () => {
    // Utilisation de la méthode find() de Mongoose sans filtre pour tout récupérer
    return await Pokemon.find();
};

/**
 * Crée un nouveau Pokémon après avoir vérifié qu'il n'existe pas déjà.
 * Applique la règle métier : deux Pokémon ne peuvent pas avoir le même nom.
 * @async
 * @function createPkmn
 * @param {Object} pkmnData - Les données brutes du Pokémon à créer.
 * @param {string} pkmnData.name - Le nom du Pokémon (servira pour la vérification d'unicité).
 * @returns {Promise<Object>} Renvoie le document Mongoose du Pokémon nouvellement créé.
 * @throws {Error} Propage une erreur explicite si un Pokémon avec ce nom exact existe déjà.
 */
const createPkmn = async (pkmnData) => {
    // Vérification de la règle d'unicité
    const existing = await Pokemon.findOne({ name: pkmnData.name });
    // Si on le trouve, on lève une erreur (qui sera attrapée par le bloc catch du contrôleur)
    if (existing) throw new Error('Pokemon déjà existe');

    // Création et sauvegarde dans la base
    return await Pokemon.create(pkmnData);
};

/**
 * Fournit une liste statique des types de Pokémon de base.
 * @function getPokemonsTypes
 * @returns {string[]} Renvoie un tableau contenant une sélection de types élémentaires en majuscules.
 */
const getPokemonsTypes = () => {
    // Retourne un tableau en dur (fallback suite à la suppression de l'Enum statique)
    return ["FIRE", "WATER", "GRASS", "FLYING"];
};

module.exports = {
    getAllPokemons,
    createPkmn,
    getPokemonsTypes
};