const express = require('express');
const router = express.Router(); 
const usuariosController = require('../controllers/usuariosController');
var sessao = require('../middlewares/autenticacao');


router.get('/cadastro', usuariosController.renderCadastro);
router.post('/cadastro', usuariosController.cadastrarUsuario);

router.get('/login', usuariosController.renderLogin);
router.post('/login', usuariosController.login);

router.get('/alterarSenha', sessao, usuariosController.renderSenha);
router.post('/alterarSenha',sessao, usuariosController.alterarSenha);

router.get('/perfil', sessao, usuariosController.renderPerfil);
router.get('/editarPerfil',sessao, usuariosController.renderPerfil);
router.post('/editarPerfil',sessao, usuariosController.editarPerfil);

router.get('/logout', usuariosController.logout);

module.exports = router;