# 🚀 Instruções para Rodar o Projeto
Este guia orienta como configurar e executar tanto o Backend quanto o Frontend da aplicação.

## 📦 Instalação de Dependências
Para que o projeto funcione corretamente, é necessário instalar os módulos do Node (node_modules) em ambas as pastas.

### 1. Servidor Backend
A partir da raiz do projeto, execute:

Bash
cd ifaci
npm install
Estrutura esperada:

ifaci/

server.js

package.json

📂 node_modules/ (será criada aqui)

### 2. Frontend (Next.js/React)
A partir da raiz, entre na pasta do frontend e instale as dependências:

Bash
cd ifaci/frontend
npm install
Estrutura esperada:

ifaci/frontend/

package.json

tsconfig.json

📂 node_modules/ (será criada aqui)

## 🏃‍♂️ Como Rodar a Aplicação
Você precisará de dois terminais abertos simultaneamente.

Passo 1: Iniciar o Backend
No primeiro terminal, dentro da pasta ifaci:

Bash
npm start
URL: http://localhost:8080/

Passo 2: Iniciar o Frontend
No segundo terminal, dentro da pasta ifaci/frontend:

Bash
npm run dev
URL: http://localhost:3000/

🛠️ Resumo da Estrutura de Pastas

ifaci/
├── frontend/           # Aplicação React/Next.js
│   ├── app/
│   └── node_modules/   # Dependências do Front
├── node-red/           # Fluxos do Node-RED
├── server.js           # Ponto de entrada do Backend
├── package.json        # Scripts do Backend
└── node_modules/       # Dependências do Backend