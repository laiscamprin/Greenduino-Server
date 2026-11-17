const express = require('express');
const router = express.Router();
const apiArduino = require('../controllers/apiArduino');
const especiesController = require('../controllers/especiesController');
const estufasController = require('../controllers/estufaController');
const autenticacao = require('../middlewares/autenticacao');
const autorizacaoEstufa = require('../middlewares/autorizacaoEstufa');
const exigirAdmin = require('../middlewares/exigirAdmin');

// Arduino - autenticado pelo token_estufa (o dispositivo não tem sessão/login).
// NUNCA colocar middleware de sessão aqui.
router.post('/telemetria', apiArduino.recepcaoTelemetria);
router.get('/parametros/:token_estufa', apiArduino.envioParametros);

// Estufas (CRUD completo) - precisa estar logado; só pode mexer na própria estufa.
router.post('/estufas', autenticacao, estufasController.cadastrarEstufa);
router.get('/estufas/usuario/:id_usuario', autenticacao, estufasController.listarEstufas);
router.get('/estufas/:id_estufa', autenticacao, autorizacaoEstufa, estufasController.buscarPorId);
router.put('/estufas/:id_estufa', autenticacao, autorizacaoEstufa, estufasController.atualizarEstufa);
router.delete('/estufas/:id_estufa', autenticacao, autorizacaoEstufa, estufasController.excluirEstufa);

// Espécies (CRUD completo) - leitura para qualquer usuário logado;
// escrita (criar/editar/excluir) só para administradores, já que uma
// espécie é um dado compartilhado entre todos os usuários.
router.post('/especies', autenticacao, exigirAdmin, especiesController.cadastrarEspecie);
router.get('/especies', autenticacao, especiesController.listarEspecies);
router.get('/especies/:id_especie', autenticacao, especiesController.buscarPorId);
router.put('/especies/:id_especie', autenticacao, exigirAdmin, especiesController.atualizarEspecie);
router.delete('/especies/:id_especie', autenticacao, exigirAdmin, especiesController.excluirEspecie);

module.exports = router;
