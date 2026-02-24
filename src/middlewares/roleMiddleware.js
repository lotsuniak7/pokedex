module.exports = (requiredRole) => {
    return (req, res, next) => {
        // req.user est ajouté avant avec middleware auth
        if (req.user && req.user.role === requiredRole) {
            next();
        } else {
            res.status(403).json({ error: "Acces interdit, tu dois être Admin" });
        }
    };
};