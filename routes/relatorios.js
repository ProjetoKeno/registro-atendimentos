const express = require('express');
const router = express.Router();
const db = require('../db');

// 📊 Rota para buscar dados de atendimentos agrupados por processo e com filtro de backup cloud
router.get('/', async (req, res) => {
    try {
        const { mes, ano, backup_cloud } = req.query;

        // Validar mês e ano (usar mês/ano atual se não informado)
        const data = new Date();
        const mesAtual = mes || (data.getMonth() + 1);
        const anoAtual = ano || data.getFullYear();

        console.log(`📊 Buscando relatório para: Mês: ${mesAtual}, Ano: ${anoAtual}, Backup Cloud: ${backup_cloud}`);

        // Montar a cláusula WHERE dinamicamente com o filtro de backup cloud
        let whereClause = `WHERE MONTH(a.data_solicitacao) = ? AND YEAR(a.data_solicitacao) = ?`;
        const queryParams = [mesAtual, anoAtual];

        if (backup_cloud === 'Sim' || backup_cloud === 'Não') {
            whereClause += ` AND a.backup_cloud = ?`;
            queryParams.push(backup_cloud);
        }

        const query = `
            SELECT p.nome AS processo, COUNT(a.id) AS total
            FROM atendimentos a
            LEFT JOIN processos p ON a.processo = p.nome
            ${whereClause}
            GROUP BY p.nome
            ORDER BY total DESC;
        `;

        const [result] = await db.query(query, queryParams);

        res.status(200).json(result);
    } catch (error) {
        console.error('❌ Erro ao buscar dados do relatório:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do relatório.' });
    }
});

module.exports = router;
