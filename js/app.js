const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 20309;

app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const pool = mysql.createPool({
    host: 'localhost',
    port: 20309, // Corrigido para a porta correta do MySQL
    user: 'seu_usuario',
    password: 'sua_senha',
    database: 'registro_atendimentos'
});

// Rota para cadastrar um atendimento
app.post('/api/atendimentos', async (req, res) => {
    try {
        const { cliente, descricao, data } = req.body;

        if (!cliente || !descricao || !data) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
        }

        await pool.query(
            'INSERT INTO atendimentos (cliente, descricao, data) VALUES (?, ?, ?)',
            [cliente, descricao, data]
        );

        res.status(201).json({ message: 'Atendimento cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar atendimento:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Rota para listar os atendimentos
app.get('/api/atendimentos', async (req, res) => {
    try {
        const [atendimentos] = await pool.query('SELECT * FROM atendimentos');
        res.json(atendimentos);
    } catch (error) {
        console.error('Erro ao listar atendimentos:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Rota para listar processos
app.get('/api/processos', async (req, res) => {
    try {
        console.log('🟢 Acessando a rota /api/processos...');

        const [processos] = await pool.query('SELECT id, nome FROM processos');
        console.log('📊 Processos encontrados:', processos);

        res.json(processos);
    } catch (error) {
        console.error('❌ Erro ao buscar processos:', error);
        res.status(500).json({ error: 'Erro ao buscar processos.' });
    }
});

// Verificar rotas registradas
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log('📌 Rota registrada:', middleware.route.path);
    }
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
