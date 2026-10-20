module.exports = function(req, res, next) {

    if (req.session && req.session.usuario) {
        return res.redirect('/painel');
    }

    next();
};