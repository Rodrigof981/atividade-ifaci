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

// === SENSORES IoT ===
const dadosSensores = [];
let idSensor = 0;

// GET todos os sensores
api.get('/sensores', (req, res) => res.status(200).send(dadosSensores));

// GET sensor por id
api.get('/sensores/:id', (req, res) => {
    const sensor = dadosSensores.find(s => s.id === parseInt(req.params.id));
    if (!sensor) return res.status(404).send({ code: 404, msg: "Sensor não encontrado" });
    res.status(200).send(sensor);
});

// POST criar sensor
api.post('/sensores', (req, res) => {
    idSensor++;
    const novoSensor = {
        id: idSensor,
        temperatura: req.body.temperatura || 0,
        pressao: req.body.pressao || 0,
        umidade: req.body.umidade || 0,
        sensor_presenca: req.body.sensor_presenca || false,
        trava_seguranca: req.body.trava_seguranca || false
    };
    dadosSensores.push(novoSensor);
    notificaNodeRed('/sensor-criado', novoSensor);
    res.status(201).send({ code: 201, msg: "Sensor criado com sucesso!", sensor: novoSensor });
});

// PUT editar sensor
api.put('/sensores/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = dadosSensores.findIndex(s => s.id === id);

    if (index === -1) {
        // upsert — cria se não existir (compatível com Node-RED)
        const novoSensor = { id, ...req.body };
        dadosSensores.push(novoSensor);
        return res.status(201).send({ code: 201, msg: "Sensor criado automaticamente!", sensor: novoSensor });
    }

    dadosSensores[index] = { id, ...req.body };
    notificaNodeRed('/sensor-editado', dadosSensores[index]);
    res.status(200).send({ code: 200, msg: "Sensor atualizado com sucesso!", sensor: dadosSensores[index] });
});

// DELETE sensor
api.delete('/sensores/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = dadosSensores.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).send({ code: 404, msg: "Sensor não encontrado" });

    dadosSensores.splice(index, 1);
    notificaNodeRed('/sensor-deletado', { id });
    res.status(200).send({ code: 200, msg: "Sensor deletado com sucesso!" });
});

// === Rotas legadas IoT (compatibilidade com Node-RED) ===
api.get('/iot', (req, res) => res.status(200).send(dadosSensores));

api.post('/newData', (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send({ msg: "Dados não encontrados" });
    }
    idSensor++;
    const { temperatura, pressao, umidade, sensor_presenca, trava_seguranca } = req.body;
    const newData = { id: idSensor, temperatura, pressao, umidade, sensor_presenca, trava_seguranca };
    dadosSensores.push(newData);
    return res.status(201).send({ msg: "Dados recebidos com sucesso!", newData });
});

api.get('/sensor/:id', (req, res) => {
    const sensor = dadosSensores.find(s => s.id === parseInt(req.params.id));
    if (!sensor) return res.status(404).send({ msg: "Sensor não encontrado" });
    res.status(200).send(sensor);
});

api.put('/sensor/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = dadosSensores.findIndex(s => s.id === id);

    if (index === -1) {
        const newData = { id, ...req.body };
        dadosSensores.push(newData);
        return res.status(201).send({ msg: "Sensor criado automaticamente!", data: newData });
    }

    dadosSensores[index] = { id, ...req.body };
    return res.status(200).send({ msg: "Dados do sensor atualizados!", data: dadosSensores[index] });
});

// === INICIAR API ===
const porta = 8080;
api.listen(porta, () => console.log(`API rodando na porta ${porta}`));
