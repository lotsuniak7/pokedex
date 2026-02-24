const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const register = async (userData) => {
    // On créer une copie pour ne pas changers les données
    let data = { ...userData };

    // Hachage du mot de passe
    const hash = await bcrypt.hash(data.password, 10);
    data.password = hash;

    // Sauvegarde dans BD
    return await User.create(data);
};

module.exports = { register };