const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const auth = require('../middlewares/authMiddleware');

// Il faut se connecter
router.use(auth);

router.post('/', trainerController.create);
router.get('/', trainerController.getProfile);
router.put('/', trainerController.update);
router.delete('/', trainerController.delete);

router.post('/mark', trainerController.markPokemon);

module.exports = router;