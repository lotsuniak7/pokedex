const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const auth = require('../middlewares/authMiddleware');

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

router.use(auth); // Toutes les routes demandent d'être authentifié [cite: 20]

router.post('/', trainerController.create);
router.get('/', trainerController.getProfile);
router.put('/', trainerController.update);
router.delete('/', trainerController.delete);
router.post('/mark', trainerController.markPokemon); // Route /trainer/mark [cite: 30]

module.exports = router;