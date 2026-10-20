const express = require('express');
const cors = require('cors');
const path = require('path');

module.exports = function() {

    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.static('./public'));
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../src/views'));

    const rotasArduino = require('../src/routes/api');
    app.use('/api', rotasArduino);

    const rotasUsuario = require('../src/routes/usuario');
    app.use('/usuario', rotasUsuario);

    const rotasDashboard = require('../src/routes/dashboard');
    app.use('/dashboard', rotasDashboard);

    const rotasDispositivos = require('../src/routes/dispositivos');
    app.use('/dispositivos', rotasDispositivos);

    const rotasHome = require('../src/routes/home');
    app.use('/', rotasHome);

    return app;

};