const express = require('express');
const router = express.Router();
const dispositivosController = require('../controllers/dispositivosController');
var sessao = require('../middlewares/autenticacao');


router.get('/', sessao, dispositivosController.renderDispositivos);

router.post('/dispositivos/cadastrarEstufa', sessao, dispositivosController.renderCadastro);
router.post('/dispositivos/editarEstufa', sessao, dispositivosController.renderEdicao);

//router.get('/painel/excluir/:id', sessao, estufasController.excluirEstufa);

module.exports = router;