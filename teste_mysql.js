const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '061127', // Coloque a senha correta
    database: 'registro_atendimentos',
    port: 20309 // Ajuste se necessário
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
    } else {
        console.log('Conexão bem-sucedida!');
    }
    db.end();
});
