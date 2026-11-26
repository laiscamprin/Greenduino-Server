const connectionFactory = require('../config/connectionFactory');
const greenduinoBanco = require('../config/greenduinoBanco')();

module.exports = function(req, res, next) {
    const { id_estufa } = req.params;
    const connection = connectionFactory();

    greenduinoBanco.buscarEstufaPorId(id_estufa, connection, function(err, results) {
        if (err) {
            console.error('Erro ao verificar dono da estufa:', err);
            return res.status(500).json({ erro: 'Erro interno ao verificar a estufa.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ erro: 'Estufa não encontrada.' });
        }

        const estufa = results[0];

        if (!req.session.usuario || estufa.id_usuario !== req.session.usuario.id) {
            return res.status(403).json({ erro: 'Essa estufa não pertence a este usuário.' });
        }

        req.estufa = estufa;
        next();
    });
};
