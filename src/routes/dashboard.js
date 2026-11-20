const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const autenticacao = require('../middlewares/autenticacao');
const autorizacaoEstufa = require('../middlewares/autorizacaoEstufa');


router.get('/:id_estufa', autenticacao, autorizacaoEstufa, dashboardController.renderDashboard);
router.get('/:id_estufa/dados', autenticacao, autorizacaoEstufa, dashboardController.consultaDados);

module.exports = router;