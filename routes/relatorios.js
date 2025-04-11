const express = require('express');
const router = express.Router();
const db = require('../db');

// 📊 Rota para buscar dados agrupados por processo com filtros
router.get('/', async (req, res) => {
    try {
        const { mes, ano, backup_cloud, processos } = req.query;

        const dataAtual = new Date();
        const mesFiltro = mes || dataAtual.getMonth() + 1;
        const anoFiltro = ano || dataAtual.getFullYear();

        console.log(`📊 Relatório | Mês: ${mesFiltro}, Ano: ${anoFiltro}, Backup Cloud: ${backup_cloud || 'Todos'}`);

        let whereClause = `WHERE MONTH(a.data_solicitacao) = ? AND YEAR(a.data_solicitacao) = ?`;
        const queryParams = [mesFiltro, anoFiltro];

        if (backup_cloud === 'Sim' || backup_cloud === 'Não') {
            whereClause += ` AND a.backup_cloud = ?`;
            queryParams.push(backup_cloud);
        }

        if (processos) {
            const ids = processos.split(',').map(id => parseInt(id)).filter(Boolean);
            if (ids.length) {
                whereClause += ` AND p.id IN (${ids.map(() => '?').join(',')})`;
                queryParams.push(...ids);
            }
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
        console.error('❌ Erro ao buscar dados do relatório por processo:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do relatório.' });
    }
});

// 📊 Rota para total por agente
router.get('/agentes', async (req, res) => {
    try {
        const { mes, ano, backup_cloud, processos } = req.query;

        if (!mes || !ano) {
            return res.status(400).json({ error: 'Mês e ano são obrigatórios.' });
        }

        let whereClause = `WHERE MONTH(a.data_solicitacao) = ? AND YEAR(a.data_solicitacao) = ?`;
        const queryParams = [mes, ano];

        if (backup_cloud === 'Sim' || backup_cloud === 'Não') {
            whereClause += ` AND a.backup_cloud = ?`;
            queryParams.push(backup_cloud);
        }

        if (processos) {
            const ids = processos.split(',').map(id => parseInt(id)).filter(Boolean);
            if (ids.length) {
                whereClause += ` AND p.id IN (${ids.map(() => '?').join(',')})`;
                queryParams.push(...ids);
            }
        }

        const query = `
            SELECT IFNULL(ag.nome, 'N/A') AS agente, COUNT(a.id) AS total
            FROM atendimentos a
            LEFT JOIN agentes ag ON a.agente_id = ag.id
            LEFT JOIN processos p ON a.processo = p.nome
            ${whereClause}
            GROUP BY agente
            ORDER BY total DESC;
        `;

        const [rows] = await db.query(query, queryParams);
        res.status(200).json(rows);

    } catch (error) {
        console.error('❌ Erro ao buscar total por agente:', error);
        res.status(500).json({ error: 'Erro ao buscar total por agente.' });
    }
});

module.exports = router;
