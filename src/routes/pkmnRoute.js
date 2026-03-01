/**
 * @file pkmnRoute.js
 * @description Déclaration des routes pour la ressource Pokémon.
 * Fait le lien entre les URL de l'API, les middlewares de sécurité et les contrôleurs.
 */

const express = require('express');
const router = express.Router();
const pkmnController = require("../controllers/pkmnController");
const auth = require("../middlewares/authMiddleware");
const adminCheck = require("../middlewares/roleMiddleware");

// ==========================================
// PROTECTION GLOBALE DU ROUTEUR
// ==========================================
// Applique le middleware d'authentification à toutes les routes définies en dessous.
// Il faut obligatoirement fournir un token JWT valide pour passer cette ligne.
router.use(auth);

/**
 * @route GET /pkmn/search
 * @description Recherche avancée de Pokémon (pagination, filtres par type, nom partiel).
 * @access Private (Nécessite d'être connecté)
 */
router.get('/pkmn/search', pkmnController.search);

/**
 * @route GET /pkmn
 * @description Route "Dispatcher" intelligente.
 * Si un 'id' ou 'name' est fourni dans l'URL (?id=... ou ?name=...), elle cherche un Pokémon précis.
 * Sinon, elle renvoie la liste complète de tous les Pokémon.
 * @access Private (Nécessite d'être connecté)
 */
router.get('/pkmn', (req, res, next) => {
    // Analyse des paramètres de requête (Query Strings)
    if (req.query.id || req.query.name) {
        return pkmnController.getOne(req, res, next);
    }
    return pkmnController.getAllPokemons(req, res, next);
});

// ==========================================
// GESTION DES RÉGIONS (ADMIN UNIQUEMENT)
// ==========================================

/**
 * @route POST /pkmn/region
 * @description Ajoute une nouvelle région à un Pokémon ou met à jour son numéro de Pokédex régional.
 * @access Private (Admin uniquement) - Protégé par le roleMiddleware
 */
router.post('/pkmn/region', adminCheck('ADMIN'), pkmnController.addRegion);

/**
 * @route DELETE /pkmn/region
 * @description Supprime une région spécifique du profil d'un Pokémon.
 * @access Private (Admin uniquement)
 */
router.delete('/pkmn/region', adminCheck('ADMIN'), pkmnController.deleteRegion);

// ==========================================
// CRUD POKÉMON (ADMIN UNIQUEMENT)
// ==========================================

/**
 * @route POST /pkmn
 * @description Crée un tout nouveau Pokémon dans la base de données.
 * @access Private (Admin uniquement)
 */
router.post('/pkmn', adminCheck('ADMIN'), pkmnController.create);

/**
 * @route PUT /pkmn/:id
 * @description Met à jour les informations d'un Pokémon existant via son ID dynamique dans l'URL.
 * @access Private (Admin uniquement)
 */
router.put('/pkmn/:id', adminCheck('ADMIN'), pkmnController.update);

/**
 * @route DELETE /pkmn/:id
 * @description Supprime définitivement un Pokémon de la base de données.
 * @access Private (Admin uniquement)
 */
router.delete('/pkmn/:id', adminCheck('ADMIN'), pkmnController.delete);

module.exports = router;