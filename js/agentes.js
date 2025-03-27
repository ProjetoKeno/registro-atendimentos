const express = require('express');
const router = express.Router();
const db = require('../db'); // Conexão com MySQL

// Criar um agente
router.post('/', async (req, res) => {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ error: 'O campo "nome" é obrigatório' });
    }

    try {
        const [result] = await db.execute('INSERT INTO agentes (nome) VALUES (?)', [nome]);
        res.status(201).json({ id: result.insertId, nome });
    } catch (error) {
        console.error('Erro ao cadastrar agente:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Listar todos os agentes
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM agentes');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao listar agentes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar um agente pelo ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const [rows] = await db.execute('SELECT * FROM agentes WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Agente não encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar agente:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
