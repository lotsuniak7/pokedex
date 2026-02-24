const express = require('express');
const app = express();

// les bibliotheques pour la documentation
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// c'est middleware, le serveur comprends json
app.use(express.json());

// Configuration SWAGGER (OpenAPI)
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
    apis: ['./src/routes/trainerRoute.js', './src/routes/authRoutes.js', './src/routes/pkmnRoute.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Le chemin d'accès au « menu » de votre API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const pkmnRoutes = require('./routes/pkmnRoute.js');
const authRoutes = require('./routes/authRoutes');
const trainerRoutes = require('./routes/trainerRoute');

// Connectez nos routes avec le préfixe commun /api
app.use('/api/auth', authRoutes);
app.use('/api', pkmnRoutes);
app.use('/api/trainer', trainerRoutes);

module.exports = app;