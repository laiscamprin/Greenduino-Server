const connectionFactory = require('../config/connectionFactory');
const usuariosBanco = require('../config/usuariosBanco')();

module.exports = {

    cadastrarUsuario: function(req,res, next){

    },

    login: function(req,res,next){

    },

    alterarSenha: function(req,res,next){

    },

    editarPerfil: function(req,res,next){

    },

    logout: function(req,res){
          req.session.destroy(function(err) {
            res.redirect('/login');
        });
    }

};