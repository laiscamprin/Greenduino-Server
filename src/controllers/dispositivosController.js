const connectionFactory = require('../config/connectionFactory');
const greenduinoBanco = require('../config/greenduinoBanco')();

module.exports = {

    renderDispositivos: async function(req, res, next) {
       var connection = await connectionFactory();
        const id_usuario = req.session.usuario.id;

        greenduinoBanco.listarEstufas(id_usuario, connection, function(err, estufas) {

            if (err) {
                console.error('Erro ao listar estufas no painel:', err);
                return next(err);
            }

         
            res.render('dispositivos/index', {
                usuario: req.session.usuario,
                estufas: estufas
            });
        });
    },

    
    renderCadastro: function(req, res, next) {
        const connection = connectionFactory();

        greenduinoBanco.listarEspecies(connection, function(err, especies) {
            connection.end();

            if (err) {
                return next(err);
            }

            res.render('dispositivo/cadastrarEstufa', {
                usuario: req.session.usuario,
                especies: especies
            });
        });
    },


    renderEdicao: function(req, res, next) {
        const { id_estufa } = req.params;
        const connection = connectionFactory();

        greenduinoBanco.buscarEstufaPorId(id_estufa, connection, function(err, estufaResult) {
            if (err) {
                connection.end();
                return next(err);
            }

            greenduinoBanco.listarEspecies(connection, function(errEsp, especies) {
                connection.end();

                if (errEsp) return next(errEsp);

                res.render('dispositivos/editarEstufa', {
                    usuario: req.session.usuario,
                    estufa: estufaResult[0],
                    especies: especies
                });
            });
        });
    }

};