const mongoose = require('mongoose');

const pokemonSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    types: [{ type: String }],
    description: { type: String },
    imageUrl: { type: String }
});

module.exports = mongoose.model('Pokemon', pokemonSchema);