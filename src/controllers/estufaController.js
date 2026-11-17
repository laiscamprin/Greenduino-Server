const connectionFactory = require('../config/connectionFactory');
const greenduinoBanco = require('../config/greenduinoBanco')();
const { calcularTempoIrrigacaoMs } = require('../services/irrigacaoService');

module.exports = {

    listarEstufas: function(req, res) {
        const { id_usuario } = req.params;

        // Só deixa o usuário listar as próprias estufas.
        if (!req.session.usuario || Number(id_usuario) !== req.session.usuario.id) {
            return res.status(403).json({ erro: 'Você só pode listar suas próprias estufas.' });
        }

        const connection = connectionFactory();

        greenduinoBanco.listarEstufas(id_usuario, connection, function(err, results) {
            if (err) {
                console.error('Erro ao buscar estufas:', err);
                return res.status(500).json({ erro: 'Erro interno ao buscar estufas.' });
            }
            return res.status(200).json(results);
        });
    },

    // A checagem de dono já foi feita pelo middleware autorizacaoEstufa,
    // que deixa a estufa carregada em req.estufa.
    buscarPorId: function(req, res) {
        return res.status(200).json(req.estufa);
    },

    cadastrarEstufa: function(req, res) {
        // Pega o id_usuario direto da sessão por segurança (nunca confia no
        // que vier do corpo da requisição pra isso).
        const id_usuario = req.session.usuario.id;
        const { nome_estufa, id_especie, token_estufa, tamanho_vaso, vazao_bomba_ml_s } = req.body;

        if (!nome_estufa || !id_especie || !token_estufa) {
            return res.status(400).json({
                erro: 'Nome da estufa, ID da espécie e Token do Arduino são obrigatórios.'
            });
        }

        const connection = connectionFactory();

        // Busca a espécie escolhida pra já deixar um tempo_irrigacao de
        // referência salvo (só pra exibição rápida no dashboard/listagem).
        // O valor realmente usado na irrigação é sempre recalculado do zero
        // quando o Arduino busca os parâmetros em
        // GET /api/parametros/:token_estufa - esse aqui nunca fica estagnado.
        greenduinoBanco.buscarEspeciePorId(id_especie, connection, function(errEspecie, especies) {
            if (errEspecie) {
                console.error('Erro ao buscar espécie para calcular irrigação:', errEspecie);
                return res.status(500).json({ erro: 'Erro interno ao validar espécie.' });
            }

            if (especies.length === 0) {
                return res.status(400).json({ erro: 'Espécie informada não existe.' });
            }

            const especie = especies[0];
            const tempoIrrigacaoMs = calcularTempoIrrigacaoMs({
                umidade_minima: especie.umidade_minima,
                umidade_ideal: especie.umidade_ideal,
                tamanho_vaso: tamanho_vaso,
                vazao_bomba_ml_s: vazao_bomba_ml_s
            });

            const estufa = {
                nome_estufa,
                id_usuario,
                id_especie,
                token_estufa,
                tamanho_vaso: tamanho_vaso || 'M',
                vazao_bomba_ml_s: vazao_bomba_ml_s || null,
                tempo_irrigacao: tempoIrrigacaoMs
            };

            greenduinoBanco.cadastrarEstufa(estufa, connection, function(err, result) {
                if (err) {
                    console.error('Erro ao salvar estufa:', err);
                    return res.status(500).json({ erro: 'Erro interno ao salvar estufa.' });
                }

                return res.status(201).json({
                    mensagem: 'Estufa cadastrada com sucesso!',
                    id_estufa: result.insertId
                });
            });
        });
    },

    // Dono já conferido pelo middleware autorizacaoEstufa.
    atualizarEstufa: function(req, res) {
        const { id_estufa } = req.params;
        const dadosAtualizados = req.body;
        const connection = connectionFactory();

        greenduinoBanco.alterarEstufa(id_estufa, dadosAtualizados, connection, function(err, result) {
            if (err) {
                console.error('Erro ao atualizar estufa:', err);
                return res.status(500).json({ erro: 'Erro interno ao atualizar estufa.' });
            }
            return res.status(200).json({ mensagem: 'Estufa atualizada com sucesso!' });
        });
    },

    // Dono já conferido pelo middleware autorizacaoEstufa.
    excluirEstufa: function(req, res) {
        const { id_estufa } = req.params;
        const connection = connectionFactory();

        greenduinoBanco.excluirEstufa(id_estufa, connection, function(err, result) {
            if (err) {
                console.error('Erro ao excluir estufa:', err);
                return res.status(500).json({ erro: 'Erro interno ao excluir estufa.' });
            }
            return res.status(200).json({ mensagem: 'Estufa removida com sucesso!' });
        });
    }
};
