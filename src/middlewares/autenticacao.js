module.exports = function(req, res, next) {
    if (req.session && req.session.usuario) {
        return next();
    }

    // Rotas de /api devem responder com JSON (é consumido por fetch()/pelo
    // Arduino), não redirecionar pra uma página HTML de login.
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ erro: 'É necessário estar logado.' });
    }

    res.redirect('/login');

};
