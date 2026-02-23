const express = require('express');
const router = express.Router();
const pkmnController = require("../controllers/pkmnController");

router.get('/pkmn/types', pkmnController.getTypes);

module.exports = router;