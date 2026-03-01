/**
 * @file authMiddleware.js
 * @description Middleware d'authentification pour protéger les routes privées de l'API.
 * Vérifie la présence et la validité d'un token JWT dans les en-têtes (headers) HTTP.
 */

const jwt = require('jsonwebtoken');

/**
 * Intercepte la requête HTTP pour valider l'identité de l'utilisateur.
 * Extrait le token de l'en-tête "Authorization" (format: "Bearer <token>").
 * Si le token est valide, les données décodées sont injectées dans `req.user`.
 * * @function authMiddleware
 * @param {Object} req - L'objet de requête Express.
 * @param {Object} req.headers - Les en-têtes HTTP de la requête.
 * @param {string} [req.headers.authorization] - L'en-tête contenant le token JWT.
 * @param {Object} res - L'objet de réponse Express.
 * @param {Function} next - La fonction de rappel (callback) pour passer au middleware ou contrôleur suivant.
 * @returns {void} N'a pas de valeur de retour. Appelle `next()` si succès, sinon renvoie une erreur 401.
 */
module.exports = (req, res, next) => {
    try {
        // Récupérer le token
        const token = req.headers.authorization.split(' ')[1];
        // Vérifier et décoder le token avec la clé secrète de l'application
        const decoded = jwt.verify(token, 'SECRET_KEY_POKEMON');

        // Transmission des données utilisateur
        // Cela permet aux contrôleurs suivants d'utiliser req.user
        req.user = decoded;
        next();
    } catch (error) {
        // Si le token est absent, expiré ou falsifié, on bloque l'accès
        res.status(401).json({ error: "Il faut se connecter!" });
    }
};