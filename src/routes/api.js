const express = require('express');
const router = express.Router();
const apiArduino = require('../controllers/apiArduino');
const especiesController = require('../controllers/especiesController');
const estufasController = require('../controllers/estufaController');
const autenticacao = require('../middlewares/autenticacao');
const autorizacaoEstufa = require('../middlewares/autorizacaoEstufa');
const exigirAdmin = require('../middlewares/exigirAdmin');

router.post('/telemetria', apiArduino.recepcaoTelemetria);
router.get('/parametros/:token_estufa', apiArduino.envioParametros);

router.post('/estufas', autenticacao, estufasController.cadastrarEstufa);
router.get('/estufas/usuario/:id_usuario', autenticacao, estufasController.listarEstufas);
router.get('/estufas/:id_estufa', autenticacao, autorizacaoEstufa, estufasController.buscarPorId);
router.put('/estufas/:id_estufa', autenticacao, autorizacaoEstufa, estufasController.atualizarEstufa);
router.delete('/estufas/:id_estufa', autenticacao, autorizacaoEstufa, estufasController.excluirEstufa);

router.post('/especies', autenticacao, exigirAdmin, especiesController.cadastrarEspecie);
router.get('/especies', autenticacao, especiesController.listarEspecies);
router.get('/especies/:id_especie', autenticacao, especiesController.buscarPorId);
router.put('/especies/:id_especie', autenticacao, exigirAdmin, especiesController.atualizarEspecie);
router.delete('/especies/:id_especie', autenticacao, exigirAdmin, especiesController.excluirEspecie);

module.exports = router;
