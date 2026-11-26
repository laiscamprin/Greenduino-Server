module.exports = function(req, res, next) {
    if (!req.session.usuario || !req.session.usuario.admin) {
        return res.status(403).json({ erro: 'Apenas administradores podem fazer isso.' });
    }
    next();
};
