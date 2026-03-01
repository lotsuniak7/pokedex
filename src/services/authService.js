/**
 * @file authService.js
 * @description Couche de service pour l'authentification.
 * Contient la logique métier pure (hachage, manipulation de données)
 * isolée de la logique HTTP (requêtes/réponses).
 */

const User = require('../models/userModel');
const bcrypt = require('bcrypt');

/**
 * Traite les données d'inscription, sécurise le mot de passe et crée l'utilisateur.
 * Utilise le principe d'immutabilité pour ne pas altérer l'objet d'origine.
 * @async
 * @function register
 * @param {Object} userData - Les données brutes de l'utilisateur provenant du contrôleur.
 * @param {string} userData.username - Le nom d'utilisateur.
 * @param {string} userData.password - Le mot de passe en clair à sécuriser.
 * @returns {Promise<Object>} Renvoie le document Mongoose de l'utilisateur nouvellement créé.
 * @throws {Error} Propage une erreur si le hachage échoue ou si le `username` existe déjà (violation de contrainte d'unicité MongoDB).
 */
const register = async (userData) => {
    // On crée une copie (shallow copy) pour ne pas changer les données d'origine (immutabilité)
    let data = { ...userData };

    // Hachage du mot de passe avec un "salt" de 10 tours (standard de sécurité)
    const hash = await bcrypt.hash(data.password, 10);
    data.password = hash;

    // Sauvegarde et création dans la base de données
    return await User.create(data);
};

module.exports = { register };