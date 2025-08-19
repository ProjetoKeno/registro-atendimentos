const express = require('express');
const router = express.Router();
const db = require('../db');

// 📌 Listar todos os processos
router.get('/', async (req, res) => {
    try {
        console.log('🟢 Acessando a rota /api/processos...');
        const [results] = await db.query('SELECT id, nome FROM processos');
        res.status(200).json(results);
    } catch (error) {
        console.error('❌ Erro ao buscar processos:', error);
        res.status(500).json({ error: 'Erro ao buscar processos.' });
    }
});

// ➕ Inserir novo processo
router.post('/', async (req, res) => {
    const { nome } = req.body;
    try {
        const [result] = await db.query('INSERT INTO processos (nome) VALUES (?)', [nome]);
        res.status(201).json({ id: result.insertId, nome });
    } catch (error) {
        console.error('❌ Erro ao inserir processo:', error);
        res.status(500).json({ error: 'Erro ao inserir processo.' });
    }
});

// ✏️ Editar processo existente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    try {
        await db.query('UPDATE processos SET nome = ? WHERE id = ?', [nome, id]);
        res.sendStatus(200);
    } catch (error) {
        console.error('❌ Erro ao atualizar processo:', error);
        res.status(500).json({ error: 'Erro ao atualizar processo.' });
    }
});

// 🗑️ Excluir processo
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM processos WHERE id = ?', [id]);
        res.sendStatus(200);
    } catch (error) {
        console.error('❌ Erro ao excluir processo:', error);
        res.status(500).json({ error: 'Erro ao excluir processo.' });
    }
});

module.exports = router;
