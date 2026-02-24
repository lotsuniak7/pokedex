const express = require('express');
const router = express.Router();
const pkmnController = require("../controllers/pkmnController");
const auth = require("../middlewares/authMiddleware");

router.get('/pkmn/types', pkmnController.getTypes);

module.exports = router;