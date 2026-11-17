const express = require('express');
const router = express.Router();
const dispositivosController = require('../controllers/dispositivosController');
var sessao = require('../middlewares/autenticacao');

router.get('/', sessao, dispositivosController.renderDispositivos);

// Eram POST em '/dispositivos/cadastrarEstufa' e '/dispositivos/editarEstufa'
// (sem :id_estufa), montadas sob o prefixo '/dispositivos' - ou seja,
// viravam '/dispositivos/dispositivos/cadastrarEstufa' na prática, e
// renderEdicao já esperava req.params.id_estufa, que a rota nunca fornecia.
// Essas views ainda são só placeholder ("PÁGINA EM CONSTRUÇÃO"), então
// ajustei para GET + path coerente com o que os controllers esperam; não
// deve quebrar nada que já esteja em uso.
router.get('/cadastrarEstufa', sessao, dispositivosController.renderCadastro);
router.get('/editarEstufa/:id_estufa', sessao, dispositivosController.renderEdicao);

module.exports = router;
