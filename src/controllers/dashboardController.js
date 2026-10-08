const connectionFactory = require('../config/connectionFactory');
const { check, validationResult } = require('express-validator');
const dashboardBanco = require('../config/dashboardBanco')();

module.exports ={
    
    renderDashboard: function(req, res, next) {
        if (!req.session.usuario) {
            return res.redirect('/login');
        }
        const connection = connectionFactory();
        const idEstufa = req.session.usuario.id_estufa; // descobrir como achar isso??. por meio de adicionar a estufa na sessão quando cadastra-lá, mas precisa pegar a estufa ao clicar nela?
        // então provavelmente não vai ser assim, mas o get da url, de uma maneira protegida para não acessar outras estufas
        // criptografar o id da estufa???

        //informações assim que abrir a página
        dadosBanco.dadosAtual(idEstufa, connection, function(err, results) {
            connection.end();
            if (err) return next(err);

            res.render('dashboard/index', {
                usuario: req.session.usuario,
                dadosAtuais: results[0] || {}
            });
        });
    },

    consultaDados: function(req, res, next) {
        if (!req.session.usuario) {
             return res.redirect('/login');
        }

        const connection = connectionFactory();
        const idEstufa = req.session.usuario.id_estufa;
        

        const periodo = req.query.periodo || 'hoje';
        const parametro = req.query.parametro || 'todos';

        dadosBanco.dadosGrafico(idEstufa, periodo, connection, function(err, resultados) {
            connection.end();

            if (err) {
                return res.status(500).json({ erro: 'Erro ao consultar os dados no banco: ' + err });
            }

            let filtroParametro = resultados;

            if (filtroParametro !== 'todos') {
                filtroParametro = resultados.map(item => {
                    return {
                        periodo: item.periodo,
                        [parametro]: item[parametro]
                    };
                });
            }
            res.json(filtroParametro);
        });
    }
};

