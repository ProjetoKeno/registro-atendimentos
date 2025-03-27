const express = require('express');
const router = express.Router();
const db = require('../db'); // Certifique-se de que o caminho está correto

// Listar todos os atendimentos
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM atendimentos';
    db.query(sql, (err, rows) => {
        if (err) {
            console.error('❌ Erro ao buscar atendimentos:', err);
            return res.status(500).json({ error: 'Erro ao buscar atendimentos.' });
        }
        res.status(200).json(rows);
    });
});

module.exports = router;
