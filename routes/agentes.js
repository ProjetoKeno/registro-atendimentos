const express = require('express');
const router = express.Router();
const db = require('../db'); // ✅ Agora importa corretamente o banco

// Criar um agente
router.post('/', async (req, res) => {
    try {
        const { nome, email } = req.body;

        if (!nome || !email) {
            return res.status(400).json({ error: 'Os campos "nome" e "email" são obrigatórios' });
        }

        const sql = 'INSERT INTO agentes (nome, email) VALUES (?, ?)';
        const [result] = await db.query(sql, [nome, email]);

        res.status(201).json({ id: result.insertId, nome, email });
    } catch (err) {
        console.error('❌ Erro ao cadastrar agente:', err.message);
        res.status(500).json({ error: 'Erro ao cadastrar agente.', details: err.message });
    }
});

// Listar todos os agentes
router.get('/', async (req, res) => {
    try {
        const sql = 'SELECT id, nome, email, DATE_FORMAT(data_cadastro, "%Y-%m-%d") AS data_cadastro FROM agentes';
        const [results] = await db.query(sql);

        if (!Array.isArray(results)) {
            console.error('❌ Erro: resultado da query não é um array.');
            return res.status(500).json({ error: 'Erro interno no formato dos dados.' });
        }

        res.status(200).json(results);
    } catch (err) {
        console.error('❌ Erro ao buscar agentes:', err.message);
        res.status(500).json({ error: 'Erro ao buscar agentes.', details: err.message });
    }
});

// Buscar um agente pelo ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = 'SELECT id, nome, email, DATE_FORMAT(data_cadastro, "%Y-%m-%d") AS data_cadastro FROM agentes WHERE id = ?';
        const [results] = await db.query(sql, [id]);

        if (!results.length) {
            return res.status(404).json({ error: 'Agente não encontrado' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error('❌ Erro ao buscar agente:', err.message);
        res.status(500).json({ error: 'Erro ao buscar agente.', details: err.message });
    }
});

module.exports = router;
