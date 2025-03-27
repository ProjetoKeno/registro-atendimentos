document.getElementById('formCadastroUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
    });

    const result = await response.json();
    if (response.ok) {
        alert(result.message);
        window.location.href = '/listagem.html'; // Redireciona para a listagem
    } else {
        alert('Erro: ' + result.error);
    }
});
