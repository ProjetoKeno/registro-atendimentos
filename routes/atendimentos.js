const express = require('express');
const router = express.Router();
const db = require('../db');

// 📌 Cadastrar atendimento
router.post('/', async (req, res) => {
  try {
    const {
      cliente,
      observacao,
      processo_id,
      data_solicitacao,
      data_instalacao,
      sistema,
      ticket,
      agente_id,
      backup_cloud
    } = req.body;

    if (!cliente || !observacao || !processo_id || !agente_id || !data_solicitacao || !backup_cloud) {
      return res.status(400).json({ error: 'Cliente, observação, processo, agente, data de solicitação e backup cloud são obrigatórios.' });
    }

    const formatarData = (data) => new Date(data).toISOString().split('T')[0];
    const dataSolicitacaoFormatada = formatarData(data_solicitacao);
    const dataInstalacaoFormatada = data_instalacao ? formatarData(data_instalacao) : null;

    const validateQuery = `
      SELECT 
        (SELECT nome FROM processos WHERE id = ?) AS processo, 
        (SELECT id FROM agentes WHERE id = ?) AS agente;
    `;
    const [result] = await db.query(validateQuery, [processo_id, agente_id]);
    const { processo, agente } = result[0] || {};

    if (!processo) return res.status(400).json({ error: 'Processo inválido.' });
    if (!agente) return res.status(400).json({ error: 'Agente inválido.' });

    const insertQuery = `
      INSERT INTO atendimentos 
        (cliente, observacao, processo, data_solicitacao, data_instalacao, sistema, ticket, agente_id, backup_cloud)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [insertResult] = await db.query(insertQuery, [
      cliente, observacao, processo,
      dataSolicitacaoFormatada, dataInstalacaoFormatada, sistema, ticket, agente_id, backup_cloud
    ]);

    res.status(201).json({ message: '✅ Atendimento cadastrado com sucesso!', id: insertResult.insertId });

  } catch (error) {
    console.error('❌ Erro ao cadastrar atendimento:', error);
    res.status(500).json({ error: 'Erro ao cadastrar atendimento.' });
  }
});

// 📌 Listar atendimentos com filtros (com fallback para mês/ano atual)
router.get('/', async (req, res) => {
  try {
    const { mes, ano, agente_id } = req.query;

    const agora = new Date();
    const mesFiltrado = mes || String(agora.getMonth() + 1).padStart(2, '0');
    const anoFiltrado = ano || agora.getFullYear();

    let sql = `
      SELECT a.id, a.cliente, a.observacao, p.nome AS processo,
             a.data_solicitacao, a.data_instalacao,
             a.sistema, a.ticket,
             IFNULL(ag.nome, 'N/A') AS agente,
             a.backup_cloud
      FROM atendimentos a
      LEFT JOIN processos p ON a.processo = p.nome
      LEFT JOIN agentes ag ON a.agente_id = ag.id
      WHERE MONTH(a.data_solicitacao) = ? AND YEAR(a.data_solicitacao) = ?
    `;

    const params = [mesFiltrado, anoFiltrado];

    if (agente_id) {
      sql += ' AND a.agente_id = ?';
      params.push(agente_id);
    }

    // 🔽 Ordenar pela data de solicitação (mais recentes primeiro)
    sql += ' ORDER BY a.data_solicitacao DESC';

    const [rows] = await db.query(sql, params);
    res.status(200).json(rows);

  } catch (error) {
    console.error('❌ Erro ao buscar atendimentos:', error);
    res.status(500).json({ error: 'Erro ao buscar atendimentos.' });
  }
});

// 📌 Excluir atendimento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [atendimento] = await db.query('SELECT * FROM atendimentos WHERE id = ?', [id]);
    if (atendimento.length === 0) {
      return res.status(404).json({ error: 'Atendimento não encontrado.' });
    }

    await db.query('DELETE FROM atendimentos WHERE id = ?', [id]);
    res.status(200).json({ message: '✅ Atendimento excluído com sucesso!' });

  } catch (error) {
    console.error('❌ Erro ao excluir atendimento:', error);
    res.status(500).json({ error: 'Erro ao excluir atendimento.' });
  }
});

module.exports = router;
