const db = require('../db');

async function registrarLog({
  usuario = 'Sistema',
  acao,
  tabela_afetada,
  registro_id = null,
  dados_anteriores = null,
  dados_novos = null
}) {
  try {
    const query = `
      INSERT INTO logs (usuario, acao, tabela_afetada, registro_id, dados_anteriores, dados_novos)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      usuario,
      acao,
      tabela_afetada,
      registro_id,
      dados_anteriores ? JSON.stringify(dados_anteriores) : null,
      dados_novos ? JSON.stringify(dados_novos) : null
    ]);
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
}

module.exports = { registrarLog };
