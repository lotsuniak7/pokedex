/**
 * @file seed.js
 * @description Script utilitaire de peuplement (Seeder) de la base de données.
 * 1. Initialise les 151 Pokémon via PokéAPI.
 * 2. Crée un compte Administrateur par défaut pour les tests.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Pokemon = require('./src/models/pkmnModel');
const User = require('./src/models/userModel');

/**
 * @constant {string} MONGO_URI - L'URI de connexion à la base de données locale.
 */
const MONGO_URI = 'mongodb://localhost:27017/pokedex';

/**
 * Dictionnaire de traduction des types de Pokémon de l'anglais vers le français.
 * @constant {Object.<string, string>}
 */
const typeTranslations = {
    normal: 'Normal', fire: 'Feu', water: 'Eau', electric: 'Électrik',
    grass: 'Plante', ice: 'Glace', fighting: 'Combat', poison: 'Poison',
    ground: 'Sol', flying: 'Vol', psychic: 'Psy', bug: 'Insecte',
    rock: 'Roche', ghost: 'Spectre', dragon: 'Dragon', dark: 'Ténèbres',
    steel: 'Acier', fairy: 'Fée'
};

/**
 * Fonction principale asynchrone orchestrant le processus d'ETL (Extract, Transform, Load).
 * 1. Connexion à MongoDB et purge des anciennes données.
 * 2. Extraction (Fetch) des données brutes depuis PokéAPI.
 * 3. Transformation (Traduction en français, extraction des images haute qualité).
 * 4. Chargement (InsertMany) dans la base locale.
 * * @async
 * @function seedDatabase
 * @returns {Promise<void>} Quitte le processus (process.exit) à la fin de l'exécution.
 */
async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connexion à MongoDB réussie. Nettoyage de la base...');

        // Vider les anciennes données pour éviter les doublons (Drop)
        console.log('🧹 Nettoyage de la base de données...');
        await Pokemon.deleteMany({});
        await User.deleteMany({}); // On vide aussi les utilisateurs pour repartir à zéro

        console.log('Téléchargement des 151 premiers Pokémon depuis PokeAPI... (Cela peut prendre une minute)');

        // Appel initial pour obtenir la liste et les URL des 151 premiers Pokémon
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const data = await response.json();
        const pokemonList = data.results;

        const pokemonsToInsert = [];

        // Boucle séquentielle (plutôt que Promise.all) pour éviter de surcharger (Rate Limit) l'API publique
        for (let i = 0; i < pokemonList.length; i++) {
            const pkmnUrl = pokemonList[i].url;

            // Récupération des statistiques, types et sprites
            const pkmnRes = await fetch(pkmnUrl);
            const pkmnData = await pkmnRes.json();

            // Récupération des données d'espèce (pour les noms et descriptions localisés)
            const speciesRes = await fetch(pkmnData.species.url);
            const speciesData = await speciesRes.json();

            // Recherche du nom officiel en français
            const frNameObj = speciesData.names.find(n => n.language.name === 'fr');
            const name = frNameObj ? frNameObj.name : pkmnData.name;

            // Recherche de la description (Flavor Text) en français et nettoyage des retours à la ligne
            const frFlavorObj = speciesData.flavor_text_entries.find(f => f.language.name === 'fr');
            const description = frFlavorObj ? frFlavorObj.flavor_text.replace(/[\n\f]/g, ' ') : 'Description inconnue.';

            // Traduction des types via le dictionnaire
            const types = pkmnData.types.map(t => {
                const engType = t.type.name;
                return typeTranslations[engType] || engType;
            });

            // Récupération de l'image en haute qualité (Official Artwork) avec fallback sur le sprite classique
            const imageUrl = pkmnData.sprites.other['official-artwork'].front_default || pkmnData.sprites.front_default;

            // Préparation de l'objet au format attendu par notre modèle Mongoose
            pokemonsToInsert.push({
                id: pkmnData.id, // L'ID officiel du Pokédex
                name: name,
                types: types,
                description: description,
                imageUrl: imageUrl,
                regions: []
            });

            // Affichage d'une barre de progression dynamique dans le terminal
            process.stdout.write(`\r🔄 Chargement: ${i + 1}/151 (${name})...`);
        }

        console.log('\nInsertion dans la base de données locale...');

        // Insertion en masse (Bulk Insert) pour optimiser les performances de MongoDB
        await Pokemon.insertMany(pokemonsToInsert);

        console.log('Succès ! 151 Pokémon ont été ajoutés à ton Pokédex.');
        process.exit(0);

        console.log('Création du compte Administrateur par défaut...');

        const adminPassword = 'admin'; // Mot de passe simple pour le correcteur
        const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

        await User.create({
            username: 'admin',
            password: hashedAdminPassword,
            role: 'ADMIN' // On lui donne directement le rôle admin
        });

        console.log('-----------------------------------------------');
        console.log('SEEDING TERMINÉ AVEC SUCCÈS !');
        console.log(`Login Admin : admin`);
        console.log(`Pass Admin  : admin`);
        console.log('-----------------------------------------------');
    } catch (error) {
        console.error('\nErreur lors du seed:', error);
        process.exit(1);
    }
}

seedDatabase();