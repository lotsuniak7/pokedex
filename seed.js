const mongoose = require('mongoose');
const Pokemon = require('./src/models/pkmnModel');

// Connexion à la base de données
const MONGO_URI = 'mongodb://localhost:27017/pokedex';

// Vocabulaire des types pour traduire
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
        console.log('Connexion à MongoDB réussie. Nettoyage de la base...');

        // Vider les données aniennes
        await Pokemon.deleteMany({});

        console.log('Téléchargement des 151 premiers Pokémon depuis PokeAPI... (Cela peut prendre une minute)');

        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const data = await response.json();
        const pokemonList = data.results;

        const pokemonsToInsert = [];

        // Nous passons en revue chaque Pokémon et recueillons des données détaillées
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

            const types = pkmnData.types.map(t => {
                const engType = t.type.name;
                return typeTranslations[engType] || engType;
            });

            // Nous prenons l'image dans la meilleure qualité
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

        console.log('\nInsertion dans la base de données locale...');

        // Nous enregistrons en masse les 151 Pokémon dans MongoDB.
        await Pokemon.insertMany(pokemonsToInsert);

        console.log('Succès ! 151 Pokémon ont été ajoutés à ton Pokédex.');
        process.exit(0); // Завершаем скрипт
    } catch (error) {
        console.error('\nErreur lors du seed:', error);
        process.exit(1);
    }
}

seedDatabase();