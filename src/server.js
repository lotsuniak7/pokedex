/**
 * @file server.js
 * @description Point d'entrée principal de l'API Pokédex.
 * Gère la connexion à la base de données MongoDB et le lancement du serveur HTTP Express.
 */

const app = require('./app');
const mongoose = require('mongoose');

// ==========================================
// CONFIGURATION DE L'ENVIRONNEMENT
// ==========================================

/**
 * Le port sur lequel le serveur écoutera les requêtes entrantes.
 * En production, on utiliserait process.env.PORT.
 * @constant {number}
 */
const PORT = 3000;

/**
 * L'URI de connexion à la base de données MongoDB locale.
 * @constant {string}
 */
const MONGO_URI = 'mongodb://localhost:27017/pokedex';

// ==========================================
// DÉMARRAGE DE L'APPLICATION
// ==========================================

/**
 * Établit la connexion à la base de données MongoDB via Mongoose.
 * Ce n'est QUE si la connexion réussit que l'on démarre le serveur Express.
 * Cela évite d'avoir un serveur qui tourne dans le vide sans base de données.
 */
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connexion réussie à MongoDB');

        // Lancement du serveur
        app.listen(PORT, () => {
            console.log(`🚀 Le serveur est lancé sur http://localhost:${PORT}`);
            console.log(`📚 Documentation Swagger disponible sur : http://localhost:${PORT}/api-docs`);
        });
    })
    .catch(err => {
        console.error('❌ Erreur critique de connexion à la base de données:', err.message);
    });