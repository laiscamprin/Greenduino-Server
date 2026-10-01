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
    return app;
};