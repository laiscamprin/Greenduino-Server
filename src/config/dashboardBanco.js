module.exports = function() {

    // Card de valor atual da planta
    this.dadosAtual = function(idEstufa, connection, callback) {
        connection.query(`
            SELECT 
                id_log,
                id_estufa,
                temperatura_ar,
                umidade_ar,
                umidade_solo,
                bomba_acionada,
                DATE_FORMAT(data_hora, '%d/%m/%Y %H:%i:%s') AS ultima_atualizacao
            FROM dados
            WHERE id_estufa = ?
            ORDER BY data_hora DESC
            LIMIT 1
        `, [idEstufa], callback);
    };

    this.dadosGrafico = function(idEstufa, periodo, connection, callback) {
    switch (periodo) {
        case 'hoje':
            connection.query(`
                SELECT 
                    DATE_FORMAT(data_hora, '%H:%i') AS periodo,
                    temperatura_ar,
                    umidade_ar,
                    umidade_solo
                FROM dados
                WHERE id_estufa = ? AND data_hora >= CURDATE()
                ORDER BY data_hora ASC
            `, [idEstufa], callback);
            break;

        case 'semana':
            connection.query(`
                SELECT 
                    DATE_FORMAT(data_hora, '%d/%m %H:00') AS periodo,
                    ROUND(AVG(temperatura_ar), 2) AS temperatura_ar,
                    ROUND(AVG(umidade_ar), 2) AS umidade_ar,
                    ROUND(AVG(umidade_solo), 2) AS umidade_solo
                FROM dados
                WHERE id_estufa = ? AND data_hora >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE_FORMAT(data_hora, '%Y-%m-%d %H:00'), DATE_FORMAT(data_hora, '%d/%m %H:00')
                ORDER BY MIN(data_hora) ASC
            `, [idEstufa], callback);
            break;

        case 'mes':
            connection.query(`
                SELECT 
                    DATE_FORMAT(data_hora, '%d/%m') AS periodo,
                    ROUND(AVG(temperatura_ar), 2) AS temperatura_ar,
                    ROUND(AVG(umidade_ar), 2) AS umidade_ar,
                    ROUND(AVG(umidade_solo), 2) AS umidade_solo
                FROM dados
                WHERE id_estufa = ? AND data_hora >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
                GROUP BY DATE_FORMAT(data_hora, '%Y-%m-%d'), DATE_FORMAT(data_hora, '%d/%m')
                ORDER BY MIN(data_hora) ASC
            `, [idEstufa], callback);
            break;

        default: // tudo
            connection.query(`
                SELECT 
                    DATE_FORMAT(data_hora, '%d/%m/%Y') AS periodo,
                    ROUND(AVG(temperatura_ar), 2) AS temperatura_ar,
                    ROUND(AVG(umidade_ar), 2) AS umidade_ar,
                    ROUND(AVG(umidade_solo), 2) AS umidade_solo
                FROM dados
                WHERE id_estufa = ?
                GROUP BY DATE_FORMAT(data_hora, '%Y-%m-%d'), DATE_FORMAT(data_hora, '%d/%m/%Y')
                ORDER BY MIN(data_hora) ASC
            `, [idEstufa], callback);
            break;
    }
    };

    this.dadosPersonalizados = function(idEstufa, dataInicio, dataFim, connection, callback) {
        connection.query(`
            SELECT 
                DATE_FORMAT(data_hora, '%d/%m/%Y %H:%i') AS periodo,
                temperatura_ar,
                umidade_ar,
                umidade_solo
            FROM dados
            WHERE id_estufa = ? AND data_hora BETWEEN ? AND ?
            ORDER BY data_hora ASC
        `, [idEstufa, dataInicio, dataFim], callback);
    };

    return this;
}

// adicionar no banco de dados: CREATE INDEX idx_estufa_datahora ON dados(id_estufa, data_hora);