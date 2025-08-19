const express = require('express');
const router = express.Router();
const db = require('../db');

// 📊 Relatório por processo
router.get('/', async (req, res) => {
  try {
    const { mes, ano, backup_cloud, processos } = req.query;
    const dataAtual = new Date();
    const mesFiltro = parseInt(mes) || dataAtual.getMonth() + 1;
    const anoFiltro = parseInt(ano) || dataAtual.getFullYear();

    let whereClause = `WHERE MONTH(a.data_solicitacao) = ? AND YEAR(a.data_solicitacao) = ?`;
    const queryParams = [mesFiltro, anoFiltro];

    if (backup_cloud === 'Sim' || backup_cloud === 'Não') {
      whereClause += ` AND a.backup_cloud = ? AND LOWER(a.sistema) LIKE '%tg%' AND a.processo = 'Instalação de Sistema'`;
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
    console.error('❌ Erro no relatório por processo:', error);
    res.status(500).json({ error: 'Erro ao buscar relatório por processo.' });
  }
});

// 📊 Totais por agente
router.get('/agentes', async (req, res) => {
  try {
    const { mes, ano, backup_cloud, processos } = req.query;
    if (!mes || !ano) return res.status(400).json({ error: 'Mês e ano são obrigatórios.' });

    let whereClause = `WHERE MONTH(a.data_solicitacao) = ? AND YEAR(a.data_solicitacao) = ?`;
    const queryParams = [mes, ano];

    if (backup_cloud === 'Sim' || backup_cloud === 'Não') {
      whereClause += ` AND a.backup_cloud = ? AND LOWER(a.sistema) LIKE '%tg%' AND a.processo = 'Instalação de Sistema'`;
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
    console.error('❌ Erro no total por agente:', error);
    res.status(500).json({ error: 'Erro ao buscar total por agente.' });
  }
});

// 📊 Resumo de backups (para cards)
router.get('/backups', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    if (!mes || !ano) return res.status(400).json({ error: 'Mês e ano são obrigatórios.' });

    const query = `
      SELECT 
        SUM(CASE WHEN a.processo = 'Instalação de Sistema' AND a.backup_cloud = 'Sim' AND LOWER(a.sistema) LIKE '%tg%' THEN 1 ELSE 0 END) AS instalacoes,
        SUM(CASE WHEN a.processo = 'Reinstalação Servidor' AND a.backup_cloud = 'Sim' AND LOWER(a.sistema) LIKE '%tg%' THEN 1 ELSE 0 END) AS reinstalacoes
      FROM atendimentos a
      WHERE MONTH(a.data_solicitacao) = ? AND YEAR(a.data_solicitacao) = ?;
    `;

    const [result] = await db.query(query, [mes, ano]);
    res.status(200).json(result[0]);
  } catch (error) {
    console.error('❌ Erro no resumo de backups:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo de backups.' });
  }
});

// 📊 Instalações e reinstalações por sistema
router.get('/sistemas', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    if (!mes || !ano) return res.status(400).json({ error: 'Mês e ano são obrigatórios.' });

    const query = `
      SELECT 
        CASE
          WHEN LOWER(a.sistema) LIKE '%tg%' THEN 'TG'
          WHEN LOWER(a.sistema) LIKE '%mobne%' THEN 'Mobne'
          WHEN LOWER(a.sistema) LIKE '%mercos%' THEN 'Mercos'
          ELSE 'Outros'
        END AS sistema,
        SUM(CASE WHEN a.processo = 'Instalação de Sistema' THEN 1 ELSE 0 END) AS instalacoes,
        SUM(CASE WHEN a.processo = 'Reinstalação Servidor' THEN 1 ELSE 0 END) AS reinstalacoes
      FROM atendimentos a
      WHERE MONTH(a.data_solicitacao) = ? AND YEAR(a.data_solicitacao) = ?
      GROUP BY sistema
      ORDER BY instalacoes DESC;
    `;

    const [rows] = await db.query(query, [mes, ano]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Erro nas instalações por sistema:', error);
    res.status(500).json({ error: 'Erro ao buscar dados por sistema.' });
  }
});

// 📊 Comparativo mês atual x anterior por processo com tendência
router.get('/comparativo-processos', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    if (!mes || !ano) return res.status(400).json({ error: 'Mês e ano são obrigatórios.' });

    const mesAtual = parseInt(mes);
    const anoAtual = parseInt(ano);
    let mesAnterior = mesAtual - 1;
    let anoAnterior = anoAtual;

    if (mesAnterior === 0) {
      mesAnterior = 12;
      anoAnterior -= 1;
    }

    const query = `
      SELECT
        p.nome AS processo,
        SUM(CASE WHEN MONTH(a.data_solicitacao) = ? AND YEAR(a.data_solicitacao) = ? THEN 1 ELSE 0 END) AS total_atual,
        SUM(CASE WHEN MONTH(a.data_solicitacao) = ? AND YEAR(a.data_solicitacao) = ? THEN 1 ELSE 0 END) AS total_anterior
      FROM atendimentos a
      LEFT JOIN processos p ON a.processo = p.nome
      GROUP BY p.nome
      ORDER BY total_atual DESC;
    `;

    const [rows] = await db.query(query, [mesAtual, anoAtual, mesAnterior, anoAnterior]);

    const result = rows.map(row => ({
      ...row,
      tendencia: row.total_anterior === 0
        ? (row.total_atual > 0 ? 100 : 0)
        : Math.round(((row.total_atual - row.total_anterior) / row.total_anterior) * 100)
    }));

    res.status(200).json({
      mes_atual: `${mesAtual.toString().padStart(2, '0')}/${anoAtual}`,
      mes_anterior: `${mesAnterior.toString().padStart(2, '0')}/${anoAnterior}`,
      processos: result
    });
  } catch (error) {
    console.error('❌ Erro no comparativo de processos:', error);
    res.status(500).json({ error: 'Erro ao buscar comparativo de processos.' });
  }
});

// 📊 Comparativo de sistemas por mês atual e anterior
router.get('/sistemas-comparativo', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    if (!mes || !ano) return res.status(400).json({ error: 'Mês e ano são obrigatórios.' });

    const mesAtual = parseInt(mes);
    const anoAtual = parseInt(ano);
    let mesAnterior = mesAtual - 1;
    let anoAnterior = anoAtual;

    if (mesAnterior === 0) {
      mesAnterior = 12;
      anoAnterior -= 1;
    }

    const query = `
      SELECT 
        CASE
          WHEN LOWER(sistema) LIKE '%tg%' THEN 'TG'
          WHEN LOWER(sistema) LIKE '%mobne%' THEN 'Mobne'
          WHEN LOWER(sistema) LIKE '%mercos%' THEN 'Mercos'
          ELSE 'Outros'
        END AS sistema,
        SUM(CASE WHEN MONTH(data_solicitacao) = ? AND YEAR(data_solicitacao) = ? THEN 1 ELSE 0 END) AS instalacoes_atual,
        SUM(CASE WHEN MONTH(data_solicitacao) = ? AND YEAR(data_solicitacao) = ? THEN 1 ELSE 0 END) AS instalacoes_anterior
      FROM atendimentos
      WHERE processo = 'Instalação de Sistema'
      GROUP BY sistema;
    `;

    const [rows] = await db.query(query, [mesAtual, anoAtual, mesAnterior, anoAnterior]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Erro no comparativo de sistemas:', error);
    res.status(500).json({ error: 'Erro ao buscar comparativo de sistemas.' });
  }
});

module.exports = router;
