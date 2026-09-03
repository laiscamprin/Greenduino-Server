module.exports = function() {
    return {
        insertTelemetria: function(dadosInsert, conexao, callback) {
            const sql = 'INSERT INTO sensor_logs SET ?';
            conexao.query(sql, dadosInsert, callback);
        },

        // Método invocado pela rota GET
        envioParametros: function(conexao, callback) {
            // Como temos tabelas relacionais, usamos INNER JOIN para buscar os parâmetros
            // da planta vinculada à estufa. Por enquanto, usamos LIMIT 1 para testes básicos.
            // Futuramente, adicionaremos a cláusula WHERE para filtrar pelo código exato do ESP32.
            const sql = `
                SELECT 
                    ep.umidade_minima, 
                    ep.tempo_irrigacao_ms 
                FROM especies_plantas ep
                INNER JOIN estufas e ON e.especie_id = ep.id
                LIMIT 1
            `;
            conexao.query(sql, callback);
        }
    };
};