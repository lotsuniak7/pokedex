/**
 * @file authRoutes.js
 * @description Déclaration des routes (endpoints) pour l'authentification.
 * Fait le lien entre les requêtes HTTP (URL) et la logique du contrôleur.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route POST /register
 * @description Point d'entrée pour créer un nouveau compte utilisateur (Dresseur).
 * Transmet les données d'inscription au contrôleur approprié.
 * @access Public (Aucun token JWT n'est requis)
 */
router.post('/register', authController.register);

/**
 * @route POST /login
 * @description Point d'entrée pour s'authentifier et récupérer un token de session.
 * Vérifie les identifiants via le contrôleur et retourne le JWT.
 * @access Public (Aucun token JWT n'est requis)
 */
router.post('/login', authController.login);

module.exports = router;