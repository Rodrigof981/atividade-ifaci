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

    // Notifica o Node-RED sobre o novo equipamento
    try {
        await fetch('http://localhost:1880/equipamento-criado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipamento)
        });
    } catch (erro) {
        console.warn('Node-RED não disponível, notificação ignorada:', erro.message);
    }

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

    // Deleta dispositivos vinculados
    for (let i = dadosDispositivos.length - 1; i >= 0; i--) {
        if (dadosDispositivos[i].equipamentoId === id) dadosDispositivos.splice(i, 1);
    }

    notificaNodeRed('/equipamento-deletado', { id, nome: equipamento.nome });
    res.status(200).send({ code: 200, msg: "Equipamento e dispositivos deletados" });
});

// === DISPOSITIVOS ===
const dadosDispositivos = [];
let idDispositivo = 0;

// GET dispositivos de um equipamento
api.get('/equipamentos/:id/dispositivos', (req, res) => {
    const equipamentoId = parseInt(req.params.id);
    const lista = dadosDispositivos.filter(d => d.equipamentoId === equipamentoId);
    res.status(200).send(lista);
});

// POST criar dispositivo em equipamento
api.post('/equipamentos/:id/dispositivos', async (req, res) => {
    const equipamentoId = parseInt(req.params.id);
    idDispositivo++;

    const novoDispositivo = {
        id: idDispositivo,
        equipamentoId,
        statusDispositivo: req.body.statusDispositivo || "offline",
        sensores: {
            temperatura: req.body.sensores?.temperatura || 0,
            pressao: req.body.sensores?.pressao || 0,
            umidade: req.body.sensores?.umidade || 0,
            presenca: req.body.sensores?.presenca || false,
            rele: req.body.sensores?.rele || false
        },
        comandoLiberarConexao: req.body.comandoLiberarConexao || false,
        comandoLiberarRele: req.body.comandoLiberarRele || false
    };

    dadosDispositivos.push(novoDispositivo);
    notificaNodeRed('/dispositivo-criado', novoDispositivo);
    res.status(201).send({ code: 201, msg: "Dispositivo criado com sucesso!", novoDispositivo });
});

// PUT atualizar dispositivo (sensores ou comandos)
api.put('/dispositivos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const disp = dadosDispositivos.find(d => d.id === id);
    if (!disp) return res.status(404).send({ code: 404, msg: "Dispositivo não encontrado" });

    if (req.body.statusDispositivo) disp.statusDispositivo = req.body.statusDispositivo;
    if (req.body.sensores) disp.sensores = { ...disp.sensores, ...req.body.sensores };
    if (req.body.comandoLiberarConexao !== undefined) disp.comandoLiberarConexao = req.body.comandoLiberarConexao;
    if (req.body.comandoLiberarRele !== undefined) disp.comandoLiberarRele = req.body.comandoLiberarRele;

    notificaNodeRed('/dispositivo-editado', disp);
    res.status(200).send({ code: 200, msg: "Dispositivo atualizado com sucesso!", disp });
});

// DELETE dispositivo
api.delete('/dispositivos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const index = dadosDispositivos.findIndex(d => d.id === id);
    if (index === -1) return res.status(404).send({ code: 404, msg: "Dispositivo não encontrado" });

    const dispositivo = dadosDispositivos[index];
    dadosDispositivos.splice(index, 1);
    notificaNodeRed('/dispositivo-deletado', { id, equipamentoId: dispositivo.equipamentoId });
    res.status(200).send({ code: 200, msg: "Dispositivo deletado com sucesso!" });
});

// === IOT (Node-RED) ===
const iot_data = [];
let idSensor = 0;

// GET todos os dados IoT
api.get('/iot', (req, res) => res.status(200).send(iot_data));

// GET sensor por id
api.get('/sensor/:id', (req, res) => {
    const sensor = iot_data.find(s => s.id === parseInt(req.params.id));
    if (!sensor) return res.status(404).send({ msg: "Sensor não encontrado" });
    res.status(200).send(sensor);
});

// POST criar novo dado IoT (usado pelo Node-RED)
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

// PUT atualizar sensor por id (usado pelo Node-RED) — cria se não existir (upsert)
api.put('/sensor/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = iot_data.findIndex(s => s.id === id);

    if (index === -1) {
        // Sensor não existe ainda — cria com o id informado
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