const mysql = require('mysql2/promise');

// Criação do pool de conexões
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '061127',
    database: process.env.DB_DATABASE || 'registro_atendimentos',
    port: process.env.DB_PORT || 20309,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '-03:00' // 🔥 Ajuste para Horário de Brasília (UTC-3)
});

db.getConnection()
    .then(() => console.log('✅ Conectado ao MySQL com fuso horário BRT (UTC-3).'))
    .catch((err) => {
        console.error('❌ Erro ao conectar ao MySQL:', err.message);
        process.exit(1);
    });

module.exports = db;
