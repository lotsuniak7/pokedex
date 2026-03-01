/**
 * @file roleMiddleware.js
 * @description Middleware de contrôle d'accès basé sur les rôles (RBAC).
 * Permet de restreindre l'accès à certaines routes selon le rôle de l'utilisateur (ex: ADMIN).
 */

/**
 * Usine à middleware (Middleware Factory).
 * Génère un middleware Express dynamiquement configuré pour vérifier un rôle spécifique.
 * Doit impérativement être placé APRÈS le `authMiddleware` dans la définition de la route.
 * * @function roleMiddleware
 * @param {string} requiredRole - Le rôle exigé pour accéder à la ressource (ex: 'ADMIN').
 * @returns {Function} Retourne une fonction middleware Express (req, res, next).
 */
module.exports = (requiredRole) => {

    /**
     * Le middleware généré qui intercepte la requête.
     * @param {Object} req - L'objet de requête Express (doit contenir `req.user`).
     * @param {Object} res - L'objet de réponse Express.
     * @param {Function} next - La fonction pour passer au middleware/contrôleur suivant.
     */
    return (req, res, next) => {
        // req.user est injecté en amont par le authMiddleware
        // On vérifie que l'utilisateur existe ET qu'il possède le rôle strict demandé
        if (req.user && req.user.role === requiredRole) {
            next(); // Autorisation accordée, on continue
        } else {
            // Code 403 (Forbidden) : L'utilisateur est reconnu, mais n'a pas les droits
            res.status(403).json({ error: "Accès interdit, tu dois être Admin" });
        }
    };
};