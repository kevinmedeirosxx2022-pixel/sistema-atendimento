const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

let clientes = [];

// Carregar clientes
if (fs.existsSync("clientes.json")) {
    clientes = JSON.parse(fs.readFileSync("clientes.json"));
}

// ================= LOGIN =================

app.post("/login", (req, res) => {

    const { usuario, senha } = req.body;

    if (usuario === "admin" && senha === "1234") {
        return res.json({ status: "ok", token: "admin-logado" });
    }

    res.status(401).json({ erro: "Usuário ou senha incorretos" });
});

// ================= SALVAR CLIENTE =================

app.post("/salvar", (req, res) => {

    if (!req.body.nome || !req.body.servico || !req.body.valor) {
        return res.status(400).json({ erro: "Dados inválidos" });
    }

    const cliente = {
        nome: req.body.nome,
        servico: req.body.servico,
        valor: Number(req.body.valor)
    };

    clientes.push(cliente);

    fs.writeFileSync("clientes.json", JSON.stringify(clientes, null, 2));

    res.json({ status: "Cliente salvo" });
});

// ================= LISTAR CLIENTES =================

app.get("/clientes", (req, res) => {

    if (req.headers.authorization !== "admin-logado") {
        return res.status(403).json({ erro: "Não autorizado" });
    }

    res.json(clientes);
});

// ================= EXCLUIR CLIENTE =================

app.delete("/clientes/:index", (req, res) => {

    if (req.headers.authorization !== "admin-logado") {
        return res.status(403).json({ erro: "Não autorizado" });
    }

    const index = parseInt(req.params.index);

    if (index >= 0 && index < clientes.length) {

        clientes.splice(index, 1);
        fs.writeFileSync("clientes.json", JSON.stringify(clientes, null, 2));

        return res.json({ status: "Cliente removido" });
    }

    res.status(404).json({ erro: "Cliente não encontrado" });
});

app.listen(PORT, () => {
    console.log("Servidor rodando em http://localhost:3000");
});