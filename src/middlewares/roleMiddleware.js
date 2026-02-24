module.exports = (requiredRole) => {
    return (req, res, next) => {
        // req.user est ajouté avant avec middleware auth
        if (req.user && req.user.role === requiredRole) {
            next();
        } else {
            res.status(403).json({ error: "Доступ запрещен: требуются права администратора" });
        }
    };
};