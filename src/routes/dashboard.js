const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

const autenticacao = (req, res, next) => {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }
    next();
};

router.get('/dashboard', autenticacao, dashboardController.renderDashboard);
router.get('/api/dashboard/dados', autenticacao, dashboardController.consultaDados);

module.exports = router;