/**
 * @file app.js
 * @description Configuration principale de l'application Express.
 * Initialise les middlewares globaux (CORS, JSON), génère la documentation Swagger (OpenAPI),
 * et orchestre le montage de tous les routeurs de l'API.
 * * Note d'architecture : L'application est exportée sans lancer le serveur (app.listen)
 * pour faciliter les tests d'intégration (avec Supertest) et séparer les responsabilités.
 * @module app
 */

const express = require('express');
const cors = require('cors');
const app = express();

// Bibliothèques pour la génération de la documentation interactive
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// ==========================================
// MIDDLEWARES GLOBAUX
// ==========================================

// Autorise les requêtes Cross-Origin (nécessaire pour que le frontend Vue.js puisse communiquer avec cette API)
app.use(cors());

// Middleware natif d'Express pour parser les corps de requêtes entrantes au format JSON (req.body)
app.use(express.json());

// ==========================================
// CONFIGURATION SWAGGER (OPENAPI)
// ==========================================

/**
 * Options de configuration pour Swagger JSDoc.
 * Définit les métadonnées de l'API, les serveurs cibles, et le système d'authentification (JWT).
 * @type {swaggerJsDoc.Options}
 */
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Pokedex API',
            version: '1.0.0',
            description: 'Documentation de l\'API Pokedex',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Serveur de Développement'
            }
        ],
        components: {
            // Configuration de la sécurité globale pour Swagger UI (bouton "Authorize")
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        }
    },
    // Chemin d'accès aux fichiers dans lesquels Swagger recherchera la description des routes
    apis: [
        './src/routes/trainerRoute.js',
        './src/routes/authRoutes.js',
        './src/routes/pkmnRoute.js'
    ],
};

// Compilation des commentaires Swagger en un document JSON compréhensible par Swagger UI
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Montage de l'interface graphique Swagger UI sur la route /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ==========================================
// MONTAGE DES ROUTEURS (ENDPOINTS)
// ==========================================

const pkmnRoutes = require('./routes/pkmnRoute.js');
const authRoutes = require('./routes/authRoutes');
const trainerRoutes = require('./routes/trainerRoute');

// Connexion des routes isolées à l'application principale avec leurs préfixes sémantiques
app.use('/api/auth', authRoutes); // Gère /api/auth/login, /api/auth/register
app.use('/api', pkmnRoutes); // Gère /api/pkmn, /api/pkmn/search, etc.
app.use('/api/trainer', trainerRoutes); // Gère /api/trainer, /api/trainer/mark

module.exports = app;