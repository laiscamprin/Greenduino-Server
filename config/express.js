const express = require('express');
const cors = require('cors');

module.exports = function() {

    const app = express();

    app.use(cors());
    app.use(express.json());

    const rotasArduino = require('../src/routes/api');
    app.use('/api', rotasArduino);

    const rotasUsuario = require('../src/routes/usuario');
    app.use('/usuario', rotasUsuario);

    const rotasDashboard = require('../src/routes/dashboard');
    app.use('/dashboard', rotasDashboard);

    const rotasPainel = require('../src/routes/painel');
    app.use('/painel', rotasPainel);
    return app;

};