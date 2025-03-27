document.getElementById('formAtendimento').addEventListener('submit', async function(event) {
    event.preventDefault();

    const cliente = document.getElementById('cliente').value;
    const data_solicitacao = document.getElementById('data_solicitacao').value;
    const agente_id = document.getElementById('agente_id').value;

    // Verificação básica para evitar envio de dados vazios
    if (!cliente || !data_solicitacao || !agente_id) {
        alert('❌ Todos os campos são obrigatórios.');
        return;
    }

    const atendimento = {
        cliente,
        data_solicitacao,
        agente_id
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
