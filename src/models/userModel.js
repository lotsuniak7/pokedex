const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'TRAINER'], default: 'ADMIN' },
    // Les listes pour les pokemones
    pokemonSeen: [{type: Number}],
    pokemonCaught: [{type: Number}],
});

module.exports = mongoose.model('User', userSchema);