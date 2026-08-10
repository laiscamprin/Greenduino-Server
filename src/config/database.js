const mysql = require('mysql2/promise'); // conexão com a biblioteca do mysql2 - usada no banco de dados aiven
require('dotenv').config(); //biblioteca para conectar com arquivo env - arquivo de segurança 

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false // tratamento de conexão encriptada exigida pela plataforma
    }
});

module.exports = pool; // em vez de utilizar o create connection, o pool gerencia as vias abertas automaticamente, oq dá mais velocidade para envio de dados