const express = require('express');
const cors = require('cors');
const api = express();

// Middlewares
api.use(express.json());
api.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// Helper para notificar o Node-RED sem travar a API
const notificaNodeRed = async (endpoint, payload) => {
    try {
        await fetch(`http://localhost:1880${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (erro) {
        console.warn(`Node-RED (${endpoint}) não disponível:`, erro.message);
    }
};

// === USUÁRIOS ===
const dadosUsuarios = [];
let idUsuario = 0;

api.get('/usuarios', (req, res) => res.status(200).send(dadosUsuarios));

api.post('/novoUsuario', (req, res) => {
    idUsuario++;
    const user = { id: idUsuario, ...req.body };
    dadosUsuarios.push(user);
    res.status(201).send({ code: 201, msg: "Usuário criado com sucesso!", user });
});

api.put('/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = dadosUsuarios.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).send({ code: 404, msg: "Usuário não encontrado" });

    dadosUsuarios[index] = { id, ...req.body };
    res.status(200).send({ code: 200, msg: "Usuário editado com sucesso!" });
});

api.delete('/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = dadosUsuarios.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).send({ code: 404, msg: "Usuário não encontrado" });

    dadosUsuarios.splice(index, 1);
    res.status(200).send({ code: 200, msg: "Usuário deletado com sucesso!" });
});

// === EQUIPAMENTOS ===
const dadosEquipamentos = [];
let idEquipamento = 0;

api.get('/equipamentos', (req, res) => res.status(200).send(dadosEquipamentos));

api.post('/equipamentos', async (req, res) => {
    idEquipamento++;
    const equipamento = { id: idEquipamento, nome: req.body.nome };
    dadosEquipamentos.push(equipamento);
    notificaNodeRed('/equipamento-criado', equipamento);
    res.status(201).send({ code: 201, msg: "Equipamento criado com sucesso!", equipamento });
});

api.put('/equipamentos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const index = dadosEquipamentos.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).send({ code: 404, msg: "Equipamento não encontrado" });

    dadosEquipamentos[index] = { id, ...req.body };
    notificaNodeRed('/equipamento-editado', { id, ...req.body });
    res.status(200).send({ code: 200, msg: "Equipamento editado com sucesso!" });
});

api.delete('/equipamentos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const index = dadosEquipamentos.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).send({ code: 404, msg: "Equipamento não encontrado" });

    const equipamento = dadosEquipamentos[index];
    dadosEquipamentos.splice(index, 1);
    notificaNodeRed('/equipamento-deletado', { id, nome: equipamento.nome });
    res.status(200).send({ code: 200, msg: "Equipamento deletado com sucesso!" });
});

// === IOT (Node-RED) ===
const iot_data = [];
let idSensor = 0;

api.get('/iot', (req, res) => res.status(200).send(iot_data));

api.get('/sensor/:id', (req, res) => {
    const sensor = iot_data.find(s => s.id === parseInt(req.params.id));
    if (!sensor) return res.status(404).send({ msg: "Sensor não encontrado" });
    res.status(200).send(sensor);
});

api.post('/newData', (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send({ msg: "Dados não encontrados" });
    }
    idSensor++;
    const { temperatura, pressao, umidade, sensor_presenca, trava_seguranca } = req.body;
    const newData = { id: idSensor, temperatura, pressao, umidade, sensor_presenca, trava_seguranca };
    iot_data.push(newData);
    return res.status(201).send({ msg: "Dados recebidos com sucesso!", newData });
});

// upsert — cria se não existir
api.put('/sensor/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = iot_data.findIndex(s => s.id === id);

    if (index === -1) {
        const newData = { id, ...req.body };
        iot_data.push(newData);
        return res.status(201).send({ msg: "Sensor criado automaticamente!", data: newData });
    }

    iot_data[index] = { id, ...req.body };
    return res.status(200).send({ msg: "Dados do sensor atualizados!", data: iot_data[index] });
});

// === INICIAR API ===
const porta = 8080;
api.listen(porta, () => console.log(`API rodando na porta ${porta}`));
