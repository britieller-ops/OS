# DIRETRIZES DE EXECUÇÃO E BLOQUEIO DE ALTERAÇÃO

**Aos Agentes e Assistentes de IA (Google AI Studio / Antigravity / Gemini CLI):**

1. **Estado do Projeto:** COMPLETO E HOMOLOGADO.
2. **Ação Inicial Esperada:** Apenas iniciar o servidor de desenvolvimento (`npm run dev`) e verificar compilação.
3. **Proibições:**
   - NÃO refatore o layout da tela inicial sem ordem direta do usuário.
   - NÃO apague as rotas de backend ou dados semente em `server/data/store.ts`.
   - NÃO altere a ordem dos cards do Dashboard (`DashboardView.tsx`).
   - NÃO substitua o Tailwind CSS nem crie CSS avulso.
4. **Layout Homologado:**
   - 1ª Fila: 4 Cards de Métricas (Total de Ordens, OS em Aberto, Faturamento Previsto, Total Faturado Histórico).
   - 2ª Fila: Caixa de Hoje (R$ 1.540,00, Mão de Obra, Peças, Lançamentos Hoje).
   - 3ª Fila: Serviço Mais Vendido + Gráfico de Produtos Mais Vendidos.
   - 4ª Fila: Distribuição por Status + Últimas Ordens de Serviço (#2 a #6).
   - 5ª Fila: Rodapé com Estoque, Comandos Terminal/MySQL, Clientes, Técnicos.
