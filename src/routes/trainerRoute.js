/**
 * @file trainerRoute.js
 * @description Déclaration des routes pour la gestion des profils de Dresseurs.
 * Inclut la documentation Swagger pour la génération automatique de l'interface d'API.
 */

const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const auth = require('../middlewares/authMiddleware');

// ==========================================
// DOCUMENTATION SWAGGER (OPENAPI)
// ==========================================

/**
 * @swagger
 * tags:
 *   name: Trainer
 *   description: Gestion des dresseurs de Pokémon
 */

/**
 * @swagger
 * /api/trainer:
 *   get:
 *     summary: Récupère le profil du dresseur
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 *   post:
 *     summary: Crée un profil dresseur
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trainerName:
 *                 type: string
 *               imgUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Créé
 */

/**
 * @swagger
 * /api/trainer/mark:
 *   post:
 *     summary: Ajouter un Pokémon
 *     tags: [Trainer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pokemonId:
 *                 type: string
 *               isCaptured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Pokémon marqué
 */

// ==========================================
// ROUTES ET MIDDLEWARES (AVEC JSDOC)
// ==========================================

/**
 * Application globale du middleware d'authentification.
 * Toutes les routes définies ci-dessous exigent un token JWT valide.
 */
router.use(auth);

/**
 * @route POST /api/trainer
 * @description Crée un profil Dresseur pour l'utilisateur connecté.
 * @access Private (Nécessite d'être connecté)
 */
router.post('/', trainerController.create);

/**
 * @route GET /api/trainer
 * @description Récupère les informations du profil Dresseur actuel.
 * @access Private
 */
router.get('/', trainerController.getProfile);

/**
 * @route PUT /api/trainer
 * @description Met à jour les informations du profil Dresseur (nom, image).
 * @access Private
 */
router.put('/', trainerController.update);

/**
 * @route DELETE /api/trainer
 * @description Supprime le profil Dresseur de l'utilisateur.
 * @access Private
 */
router.delete('/', trainerController.delete);

/**
 * @route POST /api/trainer/mark
 * @description Marque un Pokémon comme "vu" ou "capturé" dans le Pokédex du dresseur.
 * @access Private
 */
router.post('/mark', trainerController.markPokemon);

module.exports = router;