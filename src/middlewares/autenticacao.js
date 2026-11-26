module.exports = function(req, res, next) {
    if (req.session && req.session.usuario) {
        return next();
    }

    if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ erro: 'É necessário estar logado.' });
    }

    res.redirect('/login');

};
