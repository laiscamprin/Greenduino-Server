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


    buscarPorId: function(req, res) {
        return res.status(200).json(req.estufa);
    },

    cadastrarEstufa: function(req, res) {

        const id_usuario = req.session.usuario.id;
        const { nome_estufa, id_especie, token_estufa, modo_cultivo, tamanho_vaso, area_m2, vazao_bomba_ml_s } = req.body;

        if (!nome_estufa || !id_especie || !token_estufa) {
            return res.status(400).json({
                erro: 'Nome da estufa, ID da espécie e Token do Arduino são obrigatórios.'
            });
        }


        const modoCultivo = modo_cultivo === 'HORTA' ? 'HORTA' : 'VASO';
        if (modoCultivo === 'HORTA' && !(Number(area_m2) > 0)) {
            return res.status(400).json({
                erro: 'Informe a área da horta em m² (maior que zero).'
            });
        }

        const connection = connectionFactory();

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
                umidade_minima: especie.umidade_solo_minima,
                umidade_ideal: especie.umidade_solo_ideal,
                modo_cultivo: modoCultivo,
                tamanho_vaso: tamanho_vaso,
                area_m2: area_m2,
                vazao_bomba_ml_s: vazao_bomba_ml_s
            });

            const estufa = {
                nome_estufa,
                id_usuario,
                id_especie,
                token_estufa,
                modo_cultivo: modoCultivo,
                tamanho_vaso: tamanho_vaso || 'M',
                area_m2: modoCultivo === 'HORTA' ? area_m2 : null,
                vazao_bomba_ml_s: vazao_bomba_ml_s || null,
                tempo_irrigacao: tempoIrrigacaoMs
            };

            greenduinoBanco.cadastrarEstufa(estufa, connection, function(err, result) {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ erro: 'Esse token já está sendo usado por outra estufa.' });
                    }
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


    atualizarEstufa: function(req, res) {
        const { id_estufa } = req.params;
        const dadosAtualizados = req.body;
        const connection = connectionFactory();


        const idEspecie = dadosAtualizados.id_especie || req.estufa.id_especie;
        const modoCultivo = dadosAtualizados.modo_cultivo === 'HORTA' || (dadosAtualizados.modo_cultivo === undefined && req.estufa.modo_cultivo === 'HORTA')
            ? 'HORTA'
            : 'VASO';
        const tamanhoVaso = dadosAtualizados.tamanho_vaso || req.estufa.tamanho_vaso;
        const areaM2 = dadosAtualizados.area_m2 !== undefined
            ? dadosAtualizados.area_m2
            : req.estufa.area_m2;
        const vazaoBomba = dadosAtualizados.vazao_bomba_ml_s !== undefined
            ? dadosAtualizados.vazao_bomba_ml_s
            : req.estufa.vazao_bomba_ml_s;

        if (modoCultivo === 'HORTA' && !(Number(areaM2) > 0)) {
            return res.status(400).json({
                erro: 'Informe a área da horta em m² (maior que zero).'
            });
        }


        dadosAtualizados.modo_cultivo = modoCultivo;
        dadosAtualizados.area_m2 = modoCultivo === 'HORTA' ? areaM2 : null;

        greenduinoBanco.buscarEspeciePorId(idEspecie, connection, function(errEspecie, especies) {
            if (errEspecie) {
                console.error('Erro ao buscar espécie para recalcular irrigação:', errEspecie);
                return res.status(500).json({ erro: 'Erro interno ao validar espécie.' });
            }

            if (especies.length === 0) {
                return res.status(400).json({ erro: 'Espécie informada não existe.' });
            }

            const especie = especies[0];
            dadosAtualizados.tempo_irrigacao = calcularTempoIrrigacaoMs({
                umidade_minima: especie.umidade_solo_minima,
                umidade_ideal: especie.umidade_solo_ideal,
                modo_cultivo: modoCultivo,
                tamanho_vaso: tamanhoVaso,
                area_m2: areaM2,
                vazao_bomba_ml_s: vazaoBomba
            });

            greenduinoBanco.alterarEstufa(id_estufa, dadosAtualizados, connection, function(err, result) {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ erro: 'Esse token já está sendo usado por outra estufa.' });
                    }
                    console.error('Erro ao atualizar estufa:', err);
                    return res.status(500).json({ erro: 'Erro interno ao atualizar estufa.' });
                }
                return res.status(200).json({ mensagem: 'Estufa atualizada com sucesso!' });
            });
        });
    },


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
