const express = require('express');
const router = express.Router();
const db = require('../db');

// 📌 Cadastrar um novo atendimento
router.post('/', async (req, res) => {
    try {
        const { cliente, observacao, processo_id, data_solicitacao, data_instalacao, sistema, ticket, agente_id, backup_cloud } = req.body;

        console.log('📊 Dados recebidos no cadastro:', req.body);

        if (!cliente || !observacao || !processo_id || !agente_id || !data_solicitacao || !backup_cloud) {
            return res.status(400).json({ error: 'Cliente, observação, processo, agente, data de solicitação e backup cloud são obrigatórios.' });
        }

        // ✅ Garantir formato correto (sem ajuste de timezone)
        const formatarData = (data) => new Date(data).toISOString().split('T')[0];

        const dataSolicitacaoFormatada = formatarData(data_solicitacao);
        const dataInstalacaoFormatada = data_instalacao ? formatarData(data_instalacao) : null;

        // Valida processo e agente
        const validateQuery = `
            SELECT (SELECT nome FROM processos WHERE id = ?) AS processo, 
                   (SELECT id FROM agentes WHERE id = ?) AS agente;
        `;

        const [result] = await db.query(validateQuery, [processo_id, agente_id]);
        const { processo, agente } = result[0] || {};

        if (!processo) return res.status(400).json({ error: 'Processo inválido.' });
        if (!agente) return res.status(400).json({ error: 'Agente inválido.' });

        // Inserir o atendimento no banco (com Backup Cloud)
        const insertQuery = `
            INSERT INTO atendimentos (cliente, observacao, processo, data_solicitacao,
                                     data_instalacao, sistema, ticket, agente_id, backup_cloud)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const [insertResult] = await db.query(insertQuery, [
            cliente, observacao, processo,
            dataSolicitacaoFormatada, dataInstalacaoFormatada, sistema, ticket, agente_id, backup_cloud
        ]);

        console.log(`✅ Atendimento cadastrado com sucesso! ID: ${insertResult.insertId}`);
        res.status(201).json({ message: '✅ Atendimento cadastrado com sucesso!', id: insertResult.insertId });

    } catch (error) {
        console.error('❌ Erro ao cadastrar atendimento:', error);
        res.status(500).json({ error: 'Erro ao cadastrar atendimento.' });
    }
});

// 📌 Listar todos os atendimentos (exibindo datas corretas e Backup Cloud)
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT a.id, a.cliente, a.observacao, p.nome AS processo,
                   a.data_solicitacao, a.data_instalacao,
                   a.sistema, a.ticket,
                   IFNULL(ag.nome, 'N/A') AS agente,
                   a.backup_cloud
            FROM atendimentos a
            LEFT JOIN processos p ON a.processo = p.nome
            LEFT JOIN agentes ag ON a.agente_id = ag.id
            ORDER BY a.id ASC; -- ✅ Garante que os atendimentos serão exibidos em ordem crescente
        `;

        const [rows] = await db.query(sql);

        // ✅ Não converter as datas em JavaScript (usa diretamente do MySQL)
        res.status(200).json(rows);
    } catch (error) {
        console.error('❌ Erro ao listar atendimentos:', error);
        res.status(500).json({ error: 'Erro ao buscar atendimentos.' });
    }
});

// 📌 Excluir um atendimento por ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verifica se o atendimento existe
        const [atendimento] = await db.query('SELECT * FROM atendimentos WHERE id = ?', [id]);
        if (atendimento.length === 0) {
            return res.status(404).json({ error: 'Atendimento não encontrado.' });
        }

        // Exclui o atendimento
        await db.query('DELETE FROM atendimentos WHERE id = ?', [id]);
        res.status(200).json({ message: '✅ Atendimento excluído com sucesso!' });

    } catch (error) {
        console.error('❌ Erro ao excluir atendimento:', error);
        res.status(500).json({ error: 'Erro ao excluir atendimento.' });
    }
});

module.exports = router;
