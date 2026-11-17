const mysql = require('mysql2'); 
require('dotenv').config(); 

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false 
    },
    waitForConnections: true, 
    connectionLimit: 10,    
    queueLimit: 0,
    enableKeepAlive: true,        
    keepAliveInitialDelay: 10000,
    connectTimeout: 10000 
});

// IMPORTANTE: esta função é SÍNCRONA de propósito. Ela devolve o pool de
// conexões (não uma conexão individual tirada dele). O pool gerencia sozinho
// a abertura/fechamento de conexões a cada chamada de connection.query(...),
// então NUNCA se deve chamar connection.release() ou connection.end() sobre
// o valor retornado aqui:
//   - connection.release() não existe no Pool (só existe numa PoolConnection
//     tirada via pool.getConnection()), então chamar isso lança uma exceção
//     dentro do callback da query e derruba o processo Node inteiro.
//   - connection.end() fecha o pool INTEIRO (todas as conexões, para sempre,
//     não só a do request atual) — a próxima query de qualquer rota falha
//     até reiniciar o servidor.
// Antes era declarada "async function" sem necessidade: algumas chamadas
// faziam "await connectionFactory()" e outras não, então metade dos
// controllers recebia uma Promise em vez do pool e connection.query(...)
// quebrava. Sendo síncrona, "connectionFactory()" e "await connectionFactory()"
// retornam a mesma coisa, então nenhum dos dois jeitos de chamar quebra.
module.exports = function() {
  return pool;
};