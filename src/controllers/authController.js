const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            password: hashedPassword
        });

        res.status(201).json({ message: "Trainer est créer!", userId: newUser._id });
    } catch (error) {
        res.status(400).json({ error: "Erreur lors de l'inscription" });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // Rechercher l'utilisateur dans BD
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: "Utilisateur n'est pas trouvé" });

        // Verifications
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Mot de passe est incorecte" });

        // Création du token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            'SECRET_KEY_POKEMON',
            { expiresIn: '24h' }
        );

        res.status(200).json({ token, message: "Vous étes connecté" });
    } catch (error) {
        res.status(500).json({ error: "Erreur du serveur" });
    }
};

exports.catchPokemon = async (req, res) => {
    try {
        const userId = req.user.id; // Берем ID из токена (Middleware)
        const { pokemonId } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { pokemonCaught: pokemonId } }, // $addToSet добавляет только если такого ID еще нет
            { new: true }
        );

        res.status(200).json({ message: "Покемон пойман!", caught: user.pokemonCaught });
    } catch (error) {
        res.status(500).json({ error: "Ошибка при поимке" });
    }
};