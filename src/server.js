const app = require('./app');
const mongoose = require('mongoose');

const PORT = 3000;
const MONGO_URI = 'mongodb://localhost:27017/pokedex';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('La connexion a reussie à MongoDB');
        app.listen(PORT, () => {
            console.log(`Le serveur est lancé sur http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('Erreur de connexion à Basse de données:', err));