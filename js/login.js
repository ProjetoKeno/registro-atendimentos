document.addEventListener("DOMContentLoaded", function () {
    const formLogin = document.getElementById("formLogin");

    if (formLogin) {
        formLogin.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = document.getElementById("email").value.trim();
            const senha = document.getElementById("senha").value.trim();

            if (!email || !senha) {
                alert("Por favor, preencha todos os campos.");
                return;
            }

            try {
                const response = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, senha })
                });

                const result = await response.json().catch(() => ({
                    error: "Resposta inválida do servidor."
                }));

                if (response.ok) {
                    // **Salva informações no localStorage**
                    if (result.userRole) {
                        localStorage.setItem("userRole", result.userRole.toLowerCase()); // Normaliza para minúsculas
                    } else {
                        console.warn("⚠️ userRole não foi recebido na resposta da API.");
                    }

                    if (result.nome) {
                        localStorage.setItem("userName", result.nome); // Guarda o nome do usuário
                    }

                    alert(result.message);
                    window.location.href = "/homepage"; // Redireciona após login
                } else {
                    alert(result.error || "Erro ao realizar login.");
                }
            } catch (error) {
                console.error("❌ Erro ao tentar fazer login:", error);
                alert("Erro ao conectar ao servidor.");
            }
        });
    }
});
