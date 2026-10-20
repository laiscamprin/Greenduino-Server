const express = require('express');
const router = express.Router();
const dispositivosController = require('../controllers/dispositivosController');
var sessao = require('../middlewares/autenticacao');


router.get('/dispositivos', sessao, dispositivosController.renderPainel);

router.post('/dispositivos/cadastrarEstufa', sessao, dispositivosController.cadastrarEstufa);
router.post('/dispositivos/editarEstufa', sessao, dispositivosController.editarEstufa);

//router.get('/painel/excluir/:id', sessao, estufasController.excluirEstufa);

module.exports = router;