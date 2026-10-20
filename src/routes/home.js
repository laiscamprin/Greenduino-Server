const express = require('express');
const router = express.Router();
const visitante = require('../middlewares/visitante'); 


router.get('/', visitante, function(req, res) {
    res.render('home/index', { usuario: req.session?.usuario });
});

module.exports = router;