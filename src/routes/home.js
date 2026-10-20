const express = require('express');
const router = express.Router();
const guest = require('../middlewares/visitante'); 


router.get('/', guest, function(req, res) {
    res.render('home/index', { usuario: req.session.usuario });
});

module.exports = router;