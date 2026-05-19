# Painel de Controle IoT

Aplicação full-stack para gerenciamento de usuários, equipamentos e dispositivos IoT, com integração ao Node-RED para recebimento e notificação de eventos em tempo real.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│          Next.js 16 + React 19 + Tailwind CSS           │
│               http://localhost:3000                     │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP REST
┌────────────────────────▼────────────────────────────────┐
│                       API (Backend)                     │
│                  Express 5 + Node.js                    │
│                  http://localhost:8080                  │
│                                                         │
│  Rotas:                                                 │
│  GET/POST        /usuarios                              │
│  PUT/DELETE      /usuarios/:id                          │
│  GET/POST        /equipamentos                          │
│  PUT/DELETE      /equipamentos/:id                      │
│  GET/POST        /equipamentos/:id/dispositivos         │
│  PUT/DELETE      /dispositivos/:id                      │
│  GET             /iot                                   │
│  POST            /newData                               │
│  PUT             /sensor/:id                            │
└──────────┬──────────────────────────┬───────────────────┘
           │ Notificações (HTTP POST) │ Dados IoT (HTTP PUT/POST)
┌──────────▼──────────────────────────▼───────────────────┐
│                      Node-RED                           │
│                  http://localhost:1880                  │
│                                                         │
│  Endpoints recebidos:                                   │
│  POST  /equipamento-criado                              │
│  POST  /equipamento-editado                             │
│  POST  /equipamento-deletado                            │
│  POST  /dispositivo-criado                              │
│  POST  /dispositivo-editado                             │
│  POST  /dispositivo-deletado                            │
│                                                         │
│  Endpoints enviados para a API:                         │
│  POST  /newData        (cria sensor IoT)                │
│  PUT   /sensor/:id     (atualiza sensor a cada 5s)      │
└─────────────────────────────────────────────────────────┘
```

### Estrutura de pastas

```
ifaci/
├── api/                          # Backend Express
│   ├── server.js
│   └── package.json
├── frontend/                     # Frontend Next.js
│   ├── app/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── CriarUsuario.tsx
│   │   │   ├── ListarUsuario.tsx
│   │   │   ├── CriarEquipamentos.tsx
│   │   │   ├── ListarEquipamentos.tsx
│   │   │   └── ListarSensores.tsx
│   │   ├── equipamentos/
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── package.json
├── node-red/
│   └── file.json                 # Fluxo Node-RED
└── postman/
    └── Painel_IoT.postman_collection.json
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [Node-RED](https://nodered.org/) — veja as opções de instalação abaixo

### Instalando o Node-RED

**Opção 1 — npm (recomendado para desenvolvimento)**

```bash
npm install -g --unsafe-perm node-red
```

Após instalar, inicie com:

```bash
node-red
```

---

**Opção 2 — Docker**

Sem persistência (dados perdidos ao parar o container):

```bash
docker run -it -p 1880:1880 --name nodered nodered/node-red
```

Com persistência de dados (recomendado):

```bash
docker run -it -p 1880:1880 -v node_red_data:/data --name nodered nodered/node-red
```

Para parar e reiniciar o container:

```bash
docker stop nodered
docker start nodered
```

---

> Independente da opção escolhida, o Node-RED ficará disponível em `http://localhost:1880`

---

## Como iniciar

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

### 2. Iniciar o Backend (API)

```bash
cd api
npm install
npm start
```

API disponível em `http://localhost:8080`

### 3. Iniciar o Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponível em `http://localhost:3000`

### 4. Iniciar o Node-RED

```bash
node-red
```

Acesse `http://localhost:1880`, importe o fluxo e faça o deploy:

1. Menu (☰) → **Import**
2. Selecione o arquivo `node-red/file.json`
3. Clique **Import** e depois **Deploy**

---

## Funcionalidades

| Módulo | Funcionalidades |
|---|---|
| Usuários | Criar, listar, editar e deletar usuários |
| Equipamentos | Criar, listar, editar e deletar equipamentos |
| Sensores IoT | Visualizar dados em tempo real enviados pelo Node-RED (atualização a cada 5s) |
| Node-RED | Recebe notificações de todos os eventos CRUD via HTTP e envia dados de sensores simulados |

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express 5 |
| IoT / Automação | Node-RED |

---

## Endpoints da API

Base URL: `http://localhost:8080`

### Usuários

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/usuarios` | Lista todos os usuários |
| `POST` | `/novoUsuario` | Cria um novo usuário |
| `PUT` | `/usuarios/:id` | Edita um usuário pelo id |
| `DELETE` | `/usuarios/:id` | Deleta um usuário pelo id |

**Body — POST `/novoUsuario`**
```json
{
  "nome_completo": "João da Silva",
  "email": "joao@email.com",
  "senha": "senha123"
}
```

### Equipamentos

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/equipamentos` | Lista todos os equipamentos |
| `POST` | `/equipamentos` | Cria um equipamento (notifica Node-RED) |
| `PUT` | `/equipamentos/:id` | Edita um equipamento (notifica Node-RED) |
| `DELETE` | `/equipamentos/:id` | Deleta um equipamento pelo id (notifica Node-RED) |

**Body — POST/PUT `/equipamentos`**
```json
{
  "nome": "Equipamento A"
}
```

### IoT / Sensores (Node-RED)

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/iot` | Lista todos os dados de sensores recebidos |
| `GET` | `/sensor/:id` | Retorna dados de um sensor pelo id |
| `POST` | `/newData` | Cria um novo registro de sensor (usado pelo Node-RED) |
| `PUT` | `/sensor/:id` | Atualiza sensor pelo id — cria automaticamente se não existir (upsert) |

**Body — POST `/newData` e PUT `/sensor/:id`**
```json
{
  "temperatura": 22.5,
  "pressao": 1012.0,
  "umidade": 65.0,
  "sensor_presenca": false,
  "trava_seguranca": false
}
```

> 📬 Uma Postman Collection com todos os endpoints está disponível em `postman/Painel_IoT.postman_collection.json`