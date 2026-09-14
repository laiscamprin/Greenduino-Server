module.exports = function() {

    this.idEstufa = function(tokenEstufa, connection, callback) {
        connection.query('SELECT id_estufa FROM Estufa WHERE token_estufa = ?', tokenEstufa, callback);
    };

    this.insertTelemetria = function(dados, connection, callback) {
        connection.query('INSERT INTO Dados SET ?', dados, callback);
    };


    this.envioParametros = function(tokenEstufa, connection, callback) {
        connection.query(
        'SELECT ep.umidade_minima, e.tempo_irrigacao FROM Estufa e, `Espécie` ep WHERE e.id_especie = ep.id_especie AND e.token_estufa = ?',
        tokenEstufa, callback);
    };
    return this;
};