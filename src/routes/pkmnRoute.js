const express = require('express');
const router = express.Router();
const pkmnController = require("../controllers/pkmnController");
const auth = require("../middlewares/authMiddleware");
const adminCheck = require("../middlewares/roleMiddleware");

// Il faut être connecter
router.use(auth);

router.get('/pkmn/search', pkmnController.search);
router.get('/pkmn', pkmnController.getAllPokemons);

// uniquement pour les admins
router.post('/pkmn', adminCheck('ADMIN'), pkmnController.create);
router.put('/pkmn/:id', adminCheck('ADMIN'), pkmnController.update);
router.delete('/pkmn/:id', adminCheck('ADMIN'), pkmnController.delete);

// demarches avec les regions
router.post('/pkmn/region', adminCheck('ADMIN'), pkmnController.addRegion);
router.delete('/pkmn/region', adminCheck('ADMIN'), pkmnController.deleteRegion);

module.exports = router;