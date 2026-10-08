var bcrypt = require('bcryptjs');

module.exports = function() {

     this.buscaPorEmail = function(email, connection, callback) {
        connection.query('SELECT * FROM usuarios WHERE email = ?', [email], callback);
    };

    this.verificarSenha = function(id, connection, callback) {
        connection.query('SELECT senha FROM usuarios WHERE id = ?', [id], callback);
    };

    this.salva = function(usuario, connection, callback) {
        var salt = bcrypt.genSaltSync(10);
        usuario.senha = bcrypt.hashSync(usuario.senha, salt);
    
        connection.query('INSERT INTO usuarios SET ?', usuario, callback);
    };

    this.alterarSenha = function(dados, connection, callback){
        var salt = bcrypt.genSaltSync(10);
        dados.senhaNova = bcrypt.hashSync(dados.senhaNova, salt);
        connection.query('UPDATE usuarios SET senha = ? WHERE id = ?', [dados.senhaNova, dados.id], callback )
    };

    this.alterarNome = function(usuario, connection, callback){
        connection.query('UPDATE usuarios SET nome = ? WHERE id = ?', [usuario.nome, usuario.id], callback )
    };

    
    return this;
};