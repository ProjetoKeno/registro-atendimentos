const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Ajuste conforme seu arquivo de conexão com o MySQL
const bcrypt = require("bcrypt");

// Rota de login
router.post("/api/login", async (req, res) => {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
        return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }

    try {
        const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: "Usuário não encontrado." });
        }

        const usuario = rows[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ error: "Senha incorreta." });
        }

        // Define o cargo do usuário (admin ou comum)
        res.json({
            message: "Login realizado com sucesso!",
            userRole: usuario.role // 'admin' ou 'user'
        });
    } catch (erro) {
        console.error("Erro no login:", erro);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

module.exports = router;