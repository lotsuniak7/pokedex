const mongoose = require('mongoose');

const pokemonSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: { type: String, required: true },
    types: [{ type: String }],
    description: { type: String },
    imageUrl: { type: String },
    regions: [{
        regionName: { type: String, required: true },
        regionPokedexNumber: { type: Number, required: true }
    }]
});

module.exports = mongoose.model('Pokemon', pokemonSchema);