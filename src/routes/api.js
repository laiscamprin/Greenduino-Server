const express = require('express');
const router = express.Router(); 
const apiArduino = require('../controllers/apiArduino');

router.post('/telemetria', apiArduino.recepcaoTelemetria);

router.get('/parametros', apiArduino.envioParametros);

module.exports = router;