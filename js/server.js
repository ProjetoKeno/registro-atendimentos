const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mysql = require('mysql');

dotenv.config();

const app = express();
const port = process.env.PORT || 20309;

// Configuração do MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Conectar ao banco de dados
db.connect(err => {
    if (err) {
        console.error('Erro de conexão com o banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados');
});

// Middleware para analisar o corpo da requisição
app.use(bodyParser.json());

// Rota de Cadastro de Atendimento
app.post('/api/atendimentos', (req, res) => {
    const { cliente, descricao, data, responsavel, status } = req.body;
    const query = 'INSERT INTO atendimentos (cliente, descricao, data, responsavel, status) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [cliente, descricao, data, responsavel, status], (err, result) => {
        if (err) {
            console.error('Erro ao inserir atendimento:', err);
            return res.status(500).json({ message: 'Erro ao cadastrar atendimento' });
        }
        res.status(200).json({ message: 'Atendimento cadastrado com sucesso!', id: result.insertId });
    });
});

// Rota para listar atendimentos
app.get('/api/atendimentos', (req, res) => {
    db.query('SELECT * FROM atendimentos', (err, result) => {
        if (err) {
            console.error('Erro ao listar atendimentos:', err);
            return res.status(500).json({ message: 'Erro ao listar atendimentos' });
        }
        res.status(200).json(result);
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
