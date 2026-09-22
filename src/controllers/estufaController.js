const connectionFactory = require('../config/connectionFactory');
const greenduinoBanco = require('../config/greenduinoBanco')();

module.exports = {

    cadastrarEstufa: function(req, res) {
        const { nome_estufa, id_usuario, id_especie, token_estufa, tempo_irrigacao } = req.body;

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
            connection.release();

            if (err) {
                console.error('Erro ao salvar estufa:', err);
                return res.status(500).json({ erro: 'Erro interno ao salvar estufa.' });
            }

            return res.status(201).json({
                mensagem: 'Estufa cadastrada com sucesso!',
                id_estufa: result.insertId
            });
        });
    },

    listarEstufas: function(req, res) {
        const { id_usuario } = req.params;
        const connection = connectionFactory();

        greenduinoBanco.listarEstufas(id_usuario, connection, function(err, results) {
            connection.release();

            if (err) {
                console.error('Erro ao buscar estufas:', err);
                return res.status(500).json({ erro: 'Erro interno ao buscar estufas.' });
            }
            return res.status(200).json(results);
        });
    },

    buscarPorId: function(req, res) {
        const { id_estufa } = req.params;
        const connection = connectionFactory();

        greenduinoBanco.buscarEstufaPorId(id_estufa, connection, function(err, results) {
            connection.release();

            if (err) {
                console.error('Erro ao buscar detalhe da estufa:', err);
                return res.status(500).json({ erro: 'Erro ao buscar detalhes da estufa.' });
            }
            if (results.length === 0) {
                return res.status(404).json({ erro: 'Estufa não encontrada.' });
            }
            return res.status(200).json(results[0]);
        });
    },

    atualizarEstufa: function(req, res) {
        const { id_estufa } = req.params;
        const dadosAtualizados = req.body;
        const connection = connectionFactory();

        greenduinoBanco.alterarEstufa(id_estufa, dadosAtualizados, connection, function(err, result) {
            connection.release();

            if (err) {
                console.error('Erro ao atualizar estufa:', err);
                return res.status(500).json({ erro: 'Erro interno ao atualizar estufa.' });
            }
            return res.status(200).json({ mensagem: 'Estufa atualizada com sucesso!' });
        });
    },

    excluirEstufa: function(req, res) {
        const { id_estufa } = req.params;
        const connection = connectionFactory();

        greenduinoBanco.excluirEstufa(id_estufa, connection, function(err, result) {
            connection.release();

            if (err) {
                console.error('Erro ao excluir estufa:', err);
                return res.status(500).json({ erro: 'Erro interno ao excluir estufa. Verifique se existem logs associados.' });
            }
            return res.status(200).json({ mensagem: 'Estufa removida com sucesso!' });
        });
    }
};