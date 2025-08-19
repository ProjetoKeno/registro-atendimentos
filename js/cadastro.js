document.getElementById('formAtendimento').addEventListener('submit', async function(event) {
    event.preventDefault();

    const cliente = document.getElementById('cliente').value.trim();
    const observacao = document.getElementById('observacao').value.trim();
    const processo_id = document.getElementById('processo_id').value;
    const data_solicitacao = document.getElementById('data_solicitacao').value;
    const data_instalacao = document.getElementById('data_instalacao') ? document.getElementById('data_instalacao').value : null;
    const sistema = document.getElementById('sistema') ? document.getElementById('sistema').value.trim() : '';
    const ticket = document.getElementById('ticket') ? document.getElementById('ticket').value.trim() : '';
    const agente_id = document.getElementById('agente_id').value;
    const backup_cloud = document.getElementById('backup_cloud').value;

    // Validação mínima dos campos obrigatórios
    if (!cliente || !observacao || !processo_id || !agente_id || !data_solicitacao || !backup_cloud) {
        alert('❌ Todos os campos obrigatórios devem ser preenchidos!');
        return;
    }

    const atendimento = {
        cliente,
        observacao,
        processo_id,
        data_solicitacao,
        data_instalacao: data_instalacao || null,
        sistema,
        ticket,
        agente_id,
        backup_cloud
    };

    try {
        const response = await fetch('/api/atendimentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(atendimento)
        });

        const result = await response.json();

        if (response.ok) {
            alert('✅ Atendimento cadastrado com sucesso!');
            window.location.href = '/views/listagem.html';
        } else {
            alert('❌ Erro ao cadastrar: ' + result.error);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('❌ Erro ao conectar ao servidor.');
    }
});
