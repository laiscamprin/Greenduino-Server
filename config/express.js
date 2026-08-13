const express = require('express');
const cors = require('cors');

module.exports = function() {

    const app = express();

    app.use(cors());
    app.use(express.json());

    const rotasArduino = require('../src/routes/api');
    app.use('/api', rotasArduino);
    return app;
};