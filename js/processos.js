document.addEventListener('DOMContentLoaded', carregarProcessos);
const form = document.getElementById('formProcesso');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('processoId').value;
  const nome = document.getElementById('nome').value.trim();

  const metodo = id ? 'PUT' : 'POST';
  const url = id ? `/api/processos/${id}` : '/api/processos';

  await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome })
  });

  form.reset();
  carregarProcessos();
});

async function carregarProcessos() {
  const resposta = await fetch('/api/processos');
  const processos = await resposta.json();

  const tabela = document.getElementById('listaProcessos');
  tabela.innerHTML = '';

  processos.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nome}</td>
      <td>
        <button onclick="editarProcesso(${p.id}, '${p.nome}')">Editar</button>
        <button onclick="excluirProcesso(${p.id})">Excluir</button>
      </td>
    `;
    tabela.appendChild(tr);
  });
}

function editarProcesso(id, nome) {
  document.getElementById('processoId').value = id;
  document.getElementById('nome').value = nome;
}

function cancelarEdicao() {
  form.reset();
}

async function excluirProcesso(id) {
  if (confirm('Tem certeza que deseja excluir este processo?')) {
    await fetch(`/api/processos/${id}`, { method: 'DELETE' });
    carregarProcessos();
  }
}
