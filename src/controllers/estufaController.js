const connectionFactory = require('../config/connectionFactory');
const greenduinoBanco = require('../config/greenduinoBanco')();

module.exports = {

   cadastrarEstufa: function(req, res, next) {
        // Pega o id_usuario direto da sessão por segurança
        const id_usuario = req.session.usuario ? req.session.usuario.id_usuario : req.body.id_usuario;
        const { nome_estufa, id_especie, token_estufa, tempo_irrigacao } = req.body;

        if (!nome_estufa || !id_usuario || !id_especie || !token_estufa) {
            return res.status(400).json({ 
                erro: 'Nome da estufa, ID do usuário, ID da espécie e Token do Arduino são obrigatórios.' 
            });
        }

        const estufa = {
            nome_estufa,
            id_usuario,
            id_especie,
            token_estufa,
            tempo_irrigacao: tempo_irrigacao || 0.00
        };

        const connection = connectionFactory();

        greenduinoBanco.cadastrarEstufa(estufa, connection, function(err, result) {
            connection.end(); // Usando .end() para fechar a conexão corretamente

            if (err) {
                console.error('Erro ao salvar estufa:', err);
                return res.status(500).json({ erro: 'Erro interno ao salvar estufa.' });
            }

            // Se o form mandar via AJAX, retorna JSON. Se for submit normal, redireciona para o painel:
            return res.redirect('/painel');
        });
    },

    atualizarEstufa: function(req, res, next) {
        const { id_estufa } = req.params;
        const dadosAtualizados = req.body;
        const connection = connectionFactory();

        greenduinoBanco.alterarEstufa(id_estufa, dadosAtualizados, connection, function(err, result) {
            connection.end();

            if (err) {
                console.error('Erro ao atualizar estufa:', err);
                return res.status(500).json({ erro: 'Erro interno ao atualizar estufa.' });
            }
            return res.redirect('/painel');
        });
    },

    excluirEstufa: function(req, res, next) {
        const { id_estufa } = req.params;
        const connection = connectionFactory();

        greenduinoBanco.excluirEstufa(id_estufa, connection, function(err, result) {
            connection.end();

            if (err) {
                console.error('Erro ao excluir estufa:', err);
                return res.status(500).json({ erro: 'Erro interno ao excluir estufa.' });
            }
            return res.redirect('/painel');
        });
    }
};