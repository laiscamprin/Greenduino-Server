const connectionFactory = require('../config/connectionFactory');
const dashboardBanco = require('../config/dashboardBanco')();
const greenduinoBanco = require('../config/greenduinoBanco')();

module.exports = {

    renderInicial: function(req, res, next) {
        const connection = connectionFactory();
        const id_usuario = req.session.usuario.id;

        greenduinoBanco.listarEstufas(id_usuario, connection, function(err, estufas) {
            if (err) return next(err);

            if (estufas.length > 0) {
                return res.redirect('/dashboard/' + estufas[0].id_estufa);
            }

            res.render('dashboard/index', {
                usuario: req.session.usuario,
                estufa: null,
                dadosAtuais: null
            });
        });
    },

    renderDashboard: function(req, res, next) {
        const connection = connectionFactory();
        const idEstufa = req.estufa.id_estufa;

        dashboardBanco.dadosAtual(idEstufa, connection, function(err, results) {
            if (err) return next(err);

            res.render('dashboard/index', {
                usuario: req.session.usuario,
                estufa: req.estufa,
                dadosAtuais: results[0] || null
            });
        });
    },

    consultaDados: function(req, res, next) {
        const connection = connectionFactory();
        const idEstufa = req.estufa.id_estufa;

        const periodo = req.query.periodo || 'hoje';
        const parametro = req.query.parametro || 'todos';

        dashboardBanco.dadosGrafico(idEstufa, periodo, connection, function(err, resultados) {
            if (err) {
                return res.status(500).json({ erro: 'Erro ao consultar os dados no banco: ' + err });
            }

            let filtroParametro = resultados;

            if (parametro !== 'todos') {
                filtroParametro = resultados.map(item => {
                    return {
                        periodo: item.periodo,
                        [parametro]: item[parametro]
                    };
                });
            }
            res.json(filtroParametro);
        });
    },


    consultaAtual: function(req, res) {
        const connection = connectionFactory();
        const idEstufa = req.estufa.id_estufa;

        dashboardBanco.dadosAtual(idEstufa, connection, function(err, results) {
            if (err) {
                return res.status(500).json({ erro: 'Erro ao consultar leitura atual: ' + err });
            }
  
            res.json(results[0] || null);
        });
    }
};
