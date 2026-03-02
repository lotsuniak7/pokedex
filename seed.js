/**
 * @file seed.js
 * @description Script utilitaire de peuplement (Seeder).
 * CORRIGÉ : L'admin est maintenant créé AVANT la fermeture du script.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Pokemon = require('./src/models/pkmnModel');
const User = require('./src/models/userModel');

const MONGO_URI = 'mongodb://localhost:27017/pokedex';

const typeTranslations = {
    normal: 'Normal', fire: 'Feu', water: 'Eau', electric: 'Électrik',
    grass: 'Plante', ice: 'Glace', fighting: 'Combat', poison: 'Poison',
    ground: 'Sol', flying: 'Vol', psychic: 'Psy', bug: 'Insecte',
    rock: 'Roche', ghost: 'Spectre', dragon: 'Dragon', dark: 'Ténèbres',
    steel: 'Acier', fairy: 'Fée'
};

async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connexion à MongoDB réussie.');

        console.log('Nettoyage de la base de données...');
        await Pokemon.deleteMany({});
        await User.deleteMany({});

        console.log('Téléchargement des 151 Pokémon...');

        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const data = await response.json();
        const pokemonList = data.results;

        const pokemonsToInsert = [];

        for (let i = 0; i < pokemonList.length; i++) {
            const pkmnUrl = pokemonList[i].url;
            const pkmnRes = await fetch(pkmnUrl);
            const pkmnData = await pkmnRes.json();

            const speciesRes = await fetch(pkmnData.species.url);
            const speciesData = await speciesRes.json();

            const frNameObj = speciesData.names.find(n => n.language.name === 'fr');
            const name = frNameObj ? frNameObj.name : pkmnData.name;

            const frFlavorObj = speciesData.flavor_text_entries.find(f => f.language.name === 'fr');
            const description = frFlavorObj ? frFlavorObj.flavor_text.replace(/[\n\f]/g, ' ') : 'Description inconnue.';

            const types = pkmnData.types.map(t => typeTranslations[t.type.name] || t.type.name);
            const imageUrl = pkmnData.sprites.other['official-artwork'].front_default || pkmnData.sprites.front_default;

            pokemonsToInsert.push({
                id: pkmnData.id,
                name: name,
                types: types,
                description: description,
                imageUrl: imageUrl,
                regions: []
            });

            process.stdout.write(`\rChargement: ${i + 1}/151 (${name})...`);
        }

        console.log('\nInsertion des Pokémon...');
        await Pokemon.insertMany(pokemonsToInsert);
        console.log('Pokémon ajoutés.');

        // ─── CRÉATION DE L'ADMIN (DÉPLACÉ ICI) ───
        console.log('Création du compte Administrateur...');

        const adminUsername = 'root';
        const adminPassword = 'root';
        const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

        await User.create({
            username: adminUsername,
            password: hashedAdminPassword,
            role: 'ADMIN'
        });

        console.log('-----------------------------------------------');
        console.log('SEEDING TERMINÉ AVEC SUCCÈS !');
        console.log(`Login Admin : ${adminUsername}`);
        console.log(`Pass Admin  : ${adminPassword}`);
        console.log('-----------------------------------------------');

        // On ne quitte le processus qu'à la toute fin !
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Erreur lors du seed:', error);
        process.exit(1);
    }
}

seedDatabase();