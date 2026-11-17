// Só deixa passar se o usuário logado tiver a flag admin (coluna "admin" da
// tabela usuarios). Usar depois de autenticacao.js na cadeia de middlewares.
module.exports = function(req, res, next) {
    if (!req.session.usuario || !req.session.usuario.admin) {
        return res.status(403).json({ erro: 'Apenas administradores podem fazer isso.' });
    }
    next();
};
