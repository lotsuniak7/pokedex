const express = require('express');
const router = express.Router();
const pkmnController = require("../controllers/pkmnController");
const auth = require("../middlewares/authMiddleware");
const adminCheck = require("../middlewares/roleMiddleware");

// Il faut être connecter
router.use(auth);

router.get('/pkmn/search', pkmnController.search);
// Si la requete avec un id ou name - recherhe un sinon retourner tous
router.get('/pkmn', (req, res, next) => {
    if (req.query.id || req.query.name) {
        return pkmnController.getOne(req, res, next);
    }
    return pkmnController.getAllPokemons(req, res, next);
});

// demarches avec les regions
router.post('/pkmn/region', adminCheck('ADMIN'), pkmnController.addRegion);
router.delete('/pkmn/region', adminCheck('ADMIN'), pkmnController.deleteRegion);

// uniquement pour les admins
router.post('/pkmn', adminCheck('ADMIN'), pkmnController.create);
router.put('/pkmn/:id', adminCheck('ADMIN'), pkmnController.update);
router.delete('/pkmn/:id', adminCheck('ADMIN'), pkmnController.delete);


module.exports = router;