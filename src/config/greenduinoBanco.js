module.exports = function() {

    // CRUD API Arduino
    this.idEstufa = function(tokenEstufa, connection, callback) {
        connection.query('SELECT id_estufa FROM estufas WHERE token_estufa = ?', tokenEstufa, callback);
    };

    this.insertTelemetria = function(dados, connection, callback) {
        connection.query('INSERT INTO dados SET ?', dados, callback);
    };

    this.envioParametros = function(tokenEstufa, connection, callback) {
        const sql = 'SELECT ep.umidade_minima, e.tempo_irrigacao FROM estufas e INNER JOIN especies ep ON e.id_especie = ep.id_especie WHERE e.token_estufa = ?';
        connection.query(sql, tokenEstufa, callback);
    };

    // CRUD Gerenciamento de Estufas e Espécies
    this.cadastrarEstufa = function(estufa, connection, callback) {
        connection.query('INSERT INTO estufas SET ?', estufa, callback);
    };

    this.listarEstufas = function(id_usuario, connection, callback) {
        const sql = 'SELECT e.*, ep.nome_especie, ep.nome_cientifico FROM estufas e LEFT JOIN especies ep ON e.id_especie = ep.id_especie WHERE e.id_usuario = ?';
        connection.query(sql, id_usuario, callback);
    };

    this.buscarEstufaPorId = function(id_estufa, connection, callback) {
        const sql = 'SELECT e.*, ep.nome_especie FROM estufas e LEFT JOIN especies ep ON e.id_especie = ep.id_especie WHERE e.id_estufa = ?';
        connection.query(sql, id_estufa, callback);
    };

    this.alterarEstufa = function(id_estufa, dados, connection, callback) {
        connection.query('UPDATE estufas SET ? WHERE id_estufa = ?', [dados, id_estufa], callback);
    };

    this.excluirEstufa = function(id_estufa, connection, callback) {
        connection.query('DELETE FROM estufas WHERE id_estufa = ?', id_estufa, callback);
    };

    this.consultarTelemetria = function(id_estufa, valor, connection, callback) {
        const sql = 'SELECT temperatura_ar, umidade_ar, umidade_solo, bomba_acionada, data_hora FROM dados WHERE id_estufa = ? ORDER BY data_hora DESC LIMIT ?';
        connection.query(sql, [id_estufa, parseInt(valor)], callback);
    };

    return this;
};