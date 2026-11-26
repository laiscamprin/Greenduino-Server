const express = require('express');
const router = express.Router();
const dispositivosController = require('../controllers/dispositivosController');
var sessao = require('../middlewares/autenticacao');

router.get('/', sessao, dispositivosController.renderDispositivos);

router.get('/cadastrarEstufa', sessao, dispositivosController.renderCadastro);
router.get('/editarEstufa/:id_estufa', sessao, dispositivosController.renderEdicao);

module.exports = router;
