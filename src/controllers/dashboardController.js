const connectionFactory = require('../config/connectionFactory');
const dashboardBanco = require('../config/dashboardBanco')();

module.exports = {

    // req.estufa já vem carregado e com o dono conferido pelo middleware
    // autorizacaoEstufa (ver src/routes/dashboard.js), então aqui já
    // podemos confiar no id_estufa.
    renderDashboard: function(req, res, next) {
        const connection = connectionFactory();
        const idEstufa = req.estufa.id_estufa;

        // Informações assim que abrir a página.
        dashboardBanco.dadosAtual(idEstufa, connection, function(err, results) {
            if (err) return next(err);

            res.render('dashboard/index', {
                usuario: req.session.usuario,
                estufa: req.estufa,
                dadosAtuais: results[0] || {}
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
    }
};
