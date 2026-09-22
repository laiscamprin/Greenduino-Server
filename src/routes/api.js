const express = require('express');
const router = express.Router(); 
const apiArduino = require('../controllers/apiArduino');
const especiesController = require('../controllers/especiesController');
const estufasController = require('../controllers/estufaController');

// Arduino
router.post('/telemetria', apiArduino.recepcaoTelemetria);
router.get('/parametros/:token_estufa', apiArduino.envioParametros);

// Espécies
router.post('/especies', especiesController.cadastrarEspecie);
router.get('/especies', especiesController.listarEspecies);

// Estufas (CRUD completo)
router.post('/estufas', estufasController.cadastrarEstufa);
router.get('/estufas/usuario/:id_usuario', estufasController.listarEstufas);
router.get('/estufas/:id_estufa', estufasController.buscarPorId);
router.put('/estufas/:id_estufa', estufasController.atualizarEstufa);
router.delete('/estufas/:id_estufa', estufasController.excluirEstufa);

// Espécies (CRUD completo)
router.post('/especies', especiesController.cadastrarEspecie);
router.get('/especies', especiesController.listarEspecies);
router.get('/especies/:id_especie', especiesController.buscarPorId);
router.put('/especies/:id_especie', especiesController.atualizarEspecie);
router.delete('/especies/:id_especie', especiesController.excluirEspecie);
module.exports = router;