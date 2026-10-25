const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

const autenticacao = (req, res, next) => {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }
    next();
};

router.get('/', (req, res) => {
    res.render('dashboard/index');
});
router.get('/api/dashboard/dados', autenticacao, dashboardController.consultaDados);

module.exports = router;
