const connectionFactory = require('../config/connectionFactory');
const greenduinoBanco = require('../config/greenduinoBanco')();

module.exports = {

    recepcaoTelemetria: function(request, response) {
        const { token_estufa, temperatura_ar, umidade_ar, umidade_solo, bomba_acionada } = request.body;

        if (!token_estufa || temperatura_ar === undefined || umidade_ar === undefined || umidade_solo === undefined) {
            return response.status(400).json({ erro: 'Dados incompletos. Verifique o token_estufa e os sensores.' });
        }

        const connection = connectionFactory();


        greenduinoBanco.idEstufa(token_estufa, connection, function(err, results) {
            if (err) {
                connection.end();
                return response.status(500).json({ erro: 'Erro ao validar token da estufa.' });
            }

            if (results.length === 0) {
                connection.end();
                return response.status(404).json({ erro: 'Estufa não encontrada com o token informado.' });
            }

            const valorId = results[0].id_estufa;

            const dadosInsert = {
                id_estufa: valorId,
                temperatura_ar: temperatura_ar,
                umidade_ar: umidade_ar,
                umidade_solo: umidade_solo,
                bomba_acionada: bomba_acionada || 0,
                data_hora: new Date()
            };

            greenduinoBanco.insertTelemetria(dadosInsert, connection, function(err) {
                connection.end();

                if (err) {
                    console.log('Erro ao salvar no banco:', err);
                    return response.status(500).json({ erro:'Erro ao salvar dados de telemetria.' });
                }

                return response.status(201).json({  resultado:'Telemetria gravada'});
            });
        });
    },

    envioParametros: function(request, response) {
        const { token_estufa } = request.params;

        if (!token_estufa) {
            return response.status(400).json({ erro: 'O token da estufa é obrigatório.' });
        }

        const connection = connectionFactory();

        greenduinoBanco.envioParametros(token_estufa, connection, function(err, results) {
            connection.end();

            if (err) {
                console.log('Erro ao buscar configurações:', err);
                return response.status(500).json({ erro: 'Erro interno do servidor.' });
            }

            if (results.length === 0) {
                return response.status(404).json({ erro: 'Estufa não encontrada ou sem espécie.' });
            }

            return response.status(200).json(results[0]);
        });
    }
};