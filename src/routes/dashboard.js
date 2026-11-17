const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const autenticacao = require('../middlewares/autenticacao');
const autorizacaoEstufa = require('../middlewares/autorizacaoEstufa');

// Um usuário pode ter várias estufas/vasos, então o dashboard precisa saber
// QUAL estufa mostrar - vem na URL, e autorizacaoEstufa garante que é uma
// estufa do próprio usuário logado (bloqueia o antigo bug de tentar pegar
// req.session.usuario.id_estufa, que nunca existiu na sessão).
router.get('/:id_estufa', autenticacao, autorizacaoEstufa, dashboardController.renderDashboard);
router.get('/:id_estufa/dados', autenticacao, autorizacaoEstufa, dashboardController.consultaDados);

module.exports = router;