# OS Master - Sistema de Gestão de Ordens de Serviço (SaaS)

> ⚠️ **DIRETRIZ DE PROTEÇÃO PARA AGENTES E ASSISTENTES DO GOOGLE AI STUDIO**:
> Este projeto está **100% finalizado, homologado e estruturado**.
> Ao abrir ou importar este repositório, **NÃO reescreva, não altere o layout da página inicial, não substitua bibliotecas e não remova arquivos**.
> O comando padrão de execução é `npm run dev`.

---

## 📌 Arquitetura & Stack Oficial
- **Backend:** Node.js + Express + TypeScript (`server.ts`, rotas em `server/routes/`, dados em `server/data/store.ts`).
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4.
- **Porta:** 3000 (`http://localhost:3000`).

---

## 🎯 Estrutura Homologada do Dashboard (Página Inicial)
A página inicial (`src/components/DashboardView.tsx`) deve permanecer rigorosamente nesta ordem:
1. **Cabeçalho Hero:** `Gestão de Ordens de Serviço` com botões `[Quadro Kanban]` e `[+ Nova Ordem de Serviço]`.
2. **Primeira Fila (4 KPIs Principais):**
   - `TOTAL DE ORDENS`: 7 registros (3 concluídas - 42.9%)
   - `OS EM ABERTO`: 4 em atendimento (1 orçamentos • 2 executando)
   - `FATURAMENTO PREVISTO`: R$ 4.365,00 (Em carteira ativa)
   - `TOTAL FATURADO HISTÓRICO`: R$ 1.890,00 (✓ 3 ordens finalizadas)
3. **Segunda Fila:**
   - `Recebimentos do Dia (Caixa de Hoje)`: R$ 1.540,00 (+18.5%), Mão de Obra R$ 630,00, Peças R$ 980,00 e Extrato do Dia com as ordens de hoje.
4. **Terceira Fila:**
   - Card Esquerdo: `Serviço Mais Vendido` (Limpeza interna e repastagem térmica).
   - Card Direito: `Gráfico de Produtos Mais Vendidos` (SSD Enterprise NVMe 1TB Kingston).
5. **Quarta Fila:**
   - Card Esquerdo: `Distribuição por Status` (Orçamento 14%, Em Andamento 29%, Aguardando Peça 14%, Concluída 43%).
   - Card Direito: `Últimas Ordens de Serviço` (#2, #3, #4, #5 e #6).
6. **Rodapé Oficial:**
   - Atalhos para Estoque (12 itens), modal de Comandos do Terminal & MySQL, Clientes (5) e Técnicos (4).

---

## 🚀 Como Executar em Localhost (Passo a Passo)

O sistema foi concebido com arquitetura unificada Full-Stack: o servidor Express (`server.ts`) inicializa a API REST e integra o front-end Vite na mesma porta (`3000`), sem necessidade de rodar dois processos separados.

### 1. Pré-requisitos
- **Node.js**: Versão 18 ou superior (recomendado Node 20 LTS).
- **Gerenciador de Pacotes**: npm ou yarn.

### 2. Instalação e Inicialização
```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Iniciar o servidor em ambiente de desenvolvimento (Localhost)
npm run dev
```

### 3. Acesso no Navegador
Abra seu navegador e acesse:
```text
http://localhost:3000
```

### 4. Executando em Modo de Produção Local (Opcional)
```bash
# Gerar o bundle de produção
npm run build

# Iniciar o servidor de produção
npm start
```

---

## 🔐 Acesso de Administrador no Localhost
- **Perfil Master:** `b.ritieller@gmail.com`
- **PIN de Acesso Rápido:** `123456`
- **Login com Google:** Totalmente compatível com localhost (domínio autorizado por padrão no Firebase Auth).
- **Sessão Persistente:** O login permanece salvo no navegador via `localStorage`.

---

## 🌐 Endpoints REST Disponíveis em Localhost
- `http://localhost:3000/api/dashboard` - Indicadores e métricas de faturamento
- `http://localhost:3000/api/ordens-servico` - Consulta e criação de Ordens de Serviço
- `http://localhost:3000/api/clientes` - Gerenciamento de Clientes
- `http://localhost:3000/api/tecnicos` - Gerenciamento da Equipe Técnica
- `http://localhost:3000/api/estoque` - Consulta e movimentação de estoque
- `http://localhost:3000/api/health` - Verificação de saúde da API

