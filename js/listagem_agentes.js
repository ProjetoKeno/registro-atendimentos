document.addEventListener("DOMContentLoaded", async () => {
    const agentesLista = document.getElementById("agentesTabela"); // Corrigido ID
    let userRole = localStorage.getItem("userRole") || ""; // Obtém o userRole do localStorage

    console.log("Role do usuário:", userRole); // Debug para ver o que está sendo salvo

    userRole = userRole.toLowerCase(); // Normaliza para minúsculas

    async function carregarAgentes() {
        try {
            const resposta = await fetch("/api/agentes");
            const agentes = await resposta.json();

            if (!resposta.ok) {
                throw new Error("Erro ao carregar agentes.");
            }

            agentesLista.innerHTML = ""; // Limpa a tabela antes de carregar

            agentes.forEach((agente) => {
                const tr = document.createElement("tr");
                tr.setAttribute("data-id", agente.id);

                tr.innerHTML = `
                    <td>${agente.id}</td>
                    <td>${agente.nome}</td>
                    <td>${agente.email}</td>
                    <td>
                        ${userRole === "admin" ? 
                            `<button class="btn-excluir" data-id="${agente.id}">❌ Excluir</button>` 
                            : "🔒"}
                    </td>
                `;

                agentesLista.appendChild(tr);
            });

            adicionarEventosExclusao();
        } catch (erro) {
            console.error("Erro ao carregar agentes:", erro);
            agentesLista.innerHTML = `<tr><td colspan="4">Erro ao carregar agentes.</td></tr>`;
        }
    }

    function adicionarEventosExclusao() {
        document.querySelectorAll(".btn-excluir").forEach((botao) => {
            botao.addEventListener("click", async (event) => {
                const agenteId = event.target.getAttribute("data-id");

                if (!agenteId) return;

                if (confirm("Tem certeza que deseja excluir este agente?")) {
                    try {
                        const resposta = await fetch(`/api/agentes/${agenteId}`, {
                            method: "DELETE",
                        });

                        if (!resposta.ok) {
                            throw new Error("Erro ao excluir o agente.");
                        }

                        // Remove o agente da lista sem precisar recarregar a página
                        document.querySelector(`tr[data-id="${agenteId}"]`).remove();
                        alert("Agente excluído com sucesso!");

                    } catch (erro) {
                        console.error("Erro ao excluir agente:", erro);
                        alert("Erro ao excluir agente.");
                    }
                }
            });
        });
    }

    carregarAgentes();
});
