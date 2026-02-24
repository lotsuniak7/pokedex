const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Recuperer le token
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, 'SECRET_KEY_POKEMON');
        // Transmission des données utilisateur
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Il faut se connecter!" });
    }
};