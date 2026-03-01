/**
 * @file authController.js
 * @description Contrôleur gérant l'authentification (inscription, connexion)
 * et les actions spécifiques à l'utilisateur comme la capture de Pokémon.
 */

const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Inscrit un nouvel utilisateur (Dresseur) dans la base de données.
 * Hache le mot de passe avant la sauvegarde pour des raisons de sécurité.
 * * @async
 * @function register
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.body - Le corps de la requête.
 * @param {string} req.body.username - Le nom d'utilisateur choisi.
 * @param {string} req.body.password - Le mot de passe en clair.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie un JSON avec un message de succès (201) ou une erreur (400).
 */
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            password: hashedPassword
        });

        res.status(201).json({ message: "Trainer est créé!", userId: newUser._id });
    } catch (error) {
        res.status(400).json({ error: "Erreur lors de l'inscription" });
    }
};

/**
 * Authentifie un utilisateur, vérifie son mot de passe et génère un token JWT.
 * * @async
 * @function login
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.body - Le corps de la requête.
 * @param {string} req.body.username - Le nom d'utilisateur.
 * @param {string} req.body.password - Le mot de passe.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie le token JWT (200) ou un message d'erreur (401, 404, 500).
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Rechercher l'utilisateur dans BD
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: "Utilisateur n'est pas trouvé" });

        // Verifications
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Mot de passe est incorrect" });

        // Création du token
        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                role: user.role
            },
            'SECRET_KEY_POKEMON',
            { expiresIn: '24h' }
        );

        res.status(200).json({ token, message: "Vous êtes connecté" });
    } catch (error) {
        res.status(500).json({ error: "Erreur du serveur" });
    }
};

/**
 * Ajoute l'identifiant d'un Pokémon à la liste des captures de l'utilisateur.
 * Utilise l'opérateur $addToSet de MongoDB pour éviter les doublons.
 * * @async
 * @function catchPokemon
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.user - Les données de l'utilisateur décodées depuis le token JWT.
 * @param {string} req.user.userId - L'ID MongoDB de l'utilisateur effectuant la requête.
 * @param {Object} req.body - Le corps de la requête.
 * @param {number} req.body.pokemonId - L'ID national du Pokémon capturé.
 * @param {Object} res - L'objet de réponse Express.
 * @returns {Promise<void>} Renvoie la liste mise à jour des captures (200) ou une erreur (500).
 */
exports.catchPokemon = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { pokemonId } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { pokemonCaught: pokemonId } },
            { new: true }
        );

        res.status(200).json({ message: "Pokemon attrapé", caught: user.pokemonCaught });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la capture du pokemon" });
    }
};