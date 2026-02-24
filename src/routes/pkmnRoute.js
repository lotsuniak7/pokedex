const express = require('express');
const router = express.Router();
const pkmnController = require("../controllers/pkmnController");
const auth = require("../middlewares/authMiddleware");

const adminCheck = require("../middlewares/roleMiddleware");

// Pout tous les utilisateurs
router.get('/pkmn/types', pkmnController.getTypes);
router.get('/pkmn', pkmnController.getAllPokemons);

// Pour les Admins
router.post('/pkmn', auth, adminCheck('ADMIN'), pkmnController.create);

module.exports = router;