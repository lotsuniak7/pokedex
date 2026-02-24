const express = require('express');
const app = express();

// c'est middleware, le serveur comprends json
app.use(express.json());

const pkmnRoutes = require('./routes/pkmnRoute.js');
const authRoutes = require('./routes/authRoutes');

// Connectez nos routes avec le préfixe commun /api
app.use('/api/auth', authRoutes);
app.use('/api', pkmnRoutes);

module.exports = app;