const express = require('express');
const app = express();
const pkmnRoutes = require('./routes/pkmnRoute.js');

app.use(express.json());

// Connectez nos routes avec le préfixe commun /api
app.use('/api', pkmnRoutes);

module.exports = app;