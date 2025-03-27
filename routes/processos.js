const express = require('express');
const router = express.Router();
const db = require('../db'); // Certifique-se de importar corretamente a conexão com o banco

// 📌 Listar todos os processos
router.get('/', async (req, res) => {
    try {
        console.log('🟢 Acessando a rota /api/processos...');
        const [results] = await db.query('SELECT id, nome FROM processos');

        console.log('📊 Processos encontrados:', results);
        res.status(200).json(results);
    } catch (error) {
        console.error('❌ Erro inesperado na rota /api/processos:', error);
        res.status(500).json({ error: 'Erro ao buscar processos.' });
    }
});

module.exports = router;
