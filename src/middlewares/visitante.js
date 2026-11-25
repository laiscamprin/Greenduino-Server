module.exports = function(req, res, next) {

    if (req.session?.usuario) {
        // '/dispositivos' ainda é só uma página placeholder; '/dashboard'
        // é quem de fato decide pra onde levar o usuário logado (primeira
        // estufa dele, ou a tela de "cadastre sua primeira planta").
        return res.redirect('/dashboard');
    }

    next();
};