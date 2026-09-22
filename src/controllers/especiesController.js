const connectionFactory = require('../config/connectionFactory');
const greenduinoBanco = require('../config/greenduinoBanco')();

module.exports = {

    cadastrarEspecie: function(req, res) {
        const { nome_especie, nome_cientifico, temperatura_minima, umidade_minima } = req.body;

        if (!nome_especie || !nome_cientifico) {
            return res.status(400).json({ 
                erro: 'Nome da espécie e nome científico são obrigatórios.' 
            });
        }

        const especie = {
            nome_especie,
            nome_cientifico,
            temperatura_minima: temperatura_minima || null,
            umidade_minima: umidade_minima || null
        };

        const connection = connectionFactory();

        greenduinoBanco.cadastrarEspecie(especie, connection, function(err, result) {
            connection.release();

            if (err) {
                console.error('Erro ao cadastrar espécie:', err);
                return res.status(500).json({ erro: 'Erro interno ao cadastrar espécie.' });
            }

            return res.status(201).json({
                mensagem: 'Espécie cadastrada com sucesso!',
                id_especie: result.insertId
            });
        });
    },

    listarEspecies: function(req, res) {
        const connection = connectionFactory();

        greenduinoBanco.listarEspecies(connection, function(err, results) {
            connection.release();

            if (err) {
                console.error('Erro ao listar espécies:', err);
                return res.status(500).json({ erro: 'Erro interno ao listar espécies.' });
            }

            return res.status(200).json(results);
        });
    },

    buscarPorId: function(req, res) {
        const { id_especie } = req.params;
        const connection = connectionFactory();

        greenduinoBanco.buscarEspeciePorId(id_especie, connection, function(err, results) {
            connection.release();

            if (err) {
                console.error('Erro ao buscar espécie:', err);
                return res.status(500).json({ erro: 'Erro ao buscar detalhes da espécie.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ erro: 'Espécie não encontrada.' });
            }

            return res.status(200).json(results[0]);
        });
    },

    atualizarEspecie: function(req, res) {
        const { id_especie } = req.params;
        const dadosAtualizados = req.body;
        const connection = connectionFactory();

        greenduinoBanco.alterarEspecie(id_especie, dadosAtualizados, connection, function(err, result) {
            connection.release();

            if (err) {
                console.error('Erro ao atualizar espécie:', err);
                return res.status(500).json({ erro: 'Erro interno ao atualizar espécie.' });
            }

            return res.status(200).json({ mensagem: 'Espécie atualizada com sucesso!' });
        });
    },

    excluirEspecie: function(req, res) {
        const { id_especie } = req.params;
        const connection = connectionFactory();

        greenduinoBanco.excluirEspecie(id_especie, connection, function(err, result) {
            connection.release();

            if (err) {
                console.error('Erro ao excluir espécie:', err);
                return res.status(500).json({ 
                    erro: 'Erro ao excluir espécie. Verifique se ela não está associada a nenhuma estufa.' 
                });
            }

            return res.status(200).json({ mensagem: 'Espécie removida com sucesso!' });
        });
    }
};