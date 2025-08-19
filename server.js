// Carregar variáveis de ambiente do .env
require('dotenv').config();

const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();

// Configuração do banco de dados
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '061127',
    database: process.env.DB_DATABASE || 'registro_atendimentos',
    port: process.env.DB_PORT || 20309,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Teste de conexão
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erro ao conectar ao MySQL:', err.message);
        process.exit(1);
    }
    console.log('✅ Conectado ao MySQL.');
    connection.release();
});

// Porta do servidor
const PORT = process.env.PORT || 3307;

// Middleware para JSON
app.use(express.json());

// Servindo arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// Importação das rotas
const agentesRoutes = require('./routes/agentes');
const atendimentosRoutes = require('./routes/atendimentos');
const processosRoutes = require('./routes/processos');
const relatoriosRoutes = require('./routes/relatorios');

app.use('/api/agentes', agentesRoutes);
app.use('/api/atendimentos', atendimentosRoutes);
app.use('/api/processos', processosRoutes);
app.use('/api/relatorios', relatoriosRoutes);

// Rota raiz redireciona para homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'homepage.html'));
});

// Rotas manuais para páginas principais
app.get('/homepage', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'homepage.html'));
});

app.get('/homepage.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'homepage.html'));
});

app.get('/listagem.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'listagem.html'));
});

// Status do servidor
app.get('/api/status', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Listagem de usuários
app.get('/api/usuarios', (req, res) => {
    const sql = 'SELECT id, nome, email, role FROM usuarios';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Erro ao buscar usuários:', err.message);
            return res.status(500).json({ error: 'Erro ao buscar usuários.', details: err.message });
        }
        res.status(200).json(results);
    });
});

// Cadastro de usuários
app.post('/api/usuarios', async (req, res) => {
    const { nome, email, senha, role = 'user' } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, Email e Senha são obrigatórios.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(senha, 10);
        const sql = 'INSERT INTO usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)';
        db.query(sql, [nome, email, hashedPassword, role], (err, result) => {
            if (err) {
                console.error('❌ Erro ao cadastrar usuário:', err.message);
                return res.status(500).json({ error: 'Erro ao cadastrar usuário.', details: err.message });
            }
            res.status(201).json({ message: '✅ Usuário cadastrado com sucesso!', id: result.insertId });
        });
    } catch (error) {
        console.error('❌ Erro ao criptografar a senha:', error.message);
        res.status(500).json({ error: 'Erro ao processar cadastro.' });
    }
});

// Login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e Senha são obrigatórios.' });
    }

    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('❌ Erro ao buscar usuário:', err.message);
            return res.status(500).json({ error: 'Erro interno do servidor.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
        }

        const usuario = results[0];
        bcrypt.compare(senha, usuario.senha, (err, match) => {
            if (err) {
                console.error('❌ Erro ao verificar senha:', err.message);
                return res.status(500).json({ error: 'Erro interno do servidor.' });
            }

            if (!match) {
                return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
            }

            res.status(200).json({
                message: '✅ Login realizado com sucesso!',
                userRole: usuario.role,
                redirect: '/homepage'
            });
        });
    });
});

// Função para listar rotas no console
function listarRotas(app) {
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            console.log('📌 Rota registrada:', middleware.route.methods, middleware.route.path);
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((subMiddleware) => {
                if (subMiddleware.route) {
                    console.log('📌 Rota registrada:', subMiddleware.route.methods, subMiddleware.route.path);
                }
            });
        }
    });
}

listarRotas(app);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor disponível em:`);
    console.log(`🔗 Localhost:   http://localhost:${PORT}`);
    console.log(`🔗 Nome da máquina: http://SUPTOPGER-022:${PORT}`);
});
