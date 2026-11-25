const connectionFactory = require('../config/connectionFactory');
const dashboardBanco = require('../config/dashboardBanco')();
const greenduinoBanco = require('../config/greenduinoBanco')();

module.exports = {

    // Sem :id_estufa na URL (ex.: logo após o login) - decide pra onde
    // mandar o usuário: a primeira estufa dele, se tiver; senão, a própria
    // tela do dashboard já sabe mostrar o estado "nenhuma planta ainda"
    // (ver cultivo-vazio em dashboard/index.ejs).
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

    // req.estufa já vem carregado e com o dono conferido pelo middleware
    // autorizacaoEstufa (ver src/routes/dashboard.js), então aqui já
    // podemos confiar no id_estufa.
    renderDashboard: function(req, res, next) {
        const connection = connectionFactory();
        const idEstufa = req.estufa.id_estufa;

        // Informações assim que abrir a página (evita uma chamada extra do
        // front só pra isso - ver window.GREENDUINO.dadosAtuaisIniciais).
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

    // Leitura mais recente de UMA estufa, em JSON. Usado pelo front pra
    // montar o cartão de cada planta (inclusive quando o usuário troca de
    // planta no seletor, sem recarregar a página toda).
    consultaAtual: function(req, res) {
        const connection = connectionFactory();
        const idEstufa = req.estufa.id_estufa;

        dashboardBanco.dadosAtual(idEstufa, connection, function(err, results) {
            if (err) {
                return res.status(500).json({ erro: 'Erro ao consultar leitura atual: ' + err });
            }
            // null quando a estufa ainda não recebeu nenhuma telemetria do
            // Arduino - o front trata isso mostrando "sem leituras ainda".
            res.json(results[0] || null);
        });
    }
};
