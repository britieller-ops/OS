import { Router } from 'express';
import { dbStore, type StatusOS, type PrioridadeOS } from '../data/store.ts';
import { gerarDiagnosticoIA } from '../services/aiService.ts';

const router = Router();

// GET /api/ordens-servico - Listar ordens com filtros
router.get('/', (req, res) => {
  const { status, prioridade, tecnicoId, clienteId, search } = req.query as {
    status?: string;
    prioridade?: string;
    tecnicoId?: string;
    clienteId?: string;
    search?: string;
  };

  const ordens = dbStore.getOrdens({ status, prioridade, tecnicoId, clienteId, search });
  
  // Attach resolved cliente and tecnico info
  const enriched = ordens.map(os => ({
    ...os,
    cliente: dbStore.getClienteById(os.clienteId),
    tecnico: os.tecnicoId ? dbStore.getTecnicoById(os.tecnicoId) : null
  }));

  res.json(enriched);
});

// POST /api/ordens-servico/ai-diagnostico - Obter laudo e diagnóstico via Gemini IA
router.post('/ai-diagnostico', async (req, res) => {
  try {
    const { equipamentoTipo, marca, modelo, defeitoRelatado } = req.body;
    if (!defeitoRelatado) {
      return res.status(400).json({ error: 'Defeito relatado é obrigatório para diagnóstico' });
    }

    const diagnostico = await gerarDiagnosticoIA({
      equipamentoTipo: equipamentoTipo || '',
      marca: marca || '',
      modelo: modelo || '',
      defeitoRelatado
    });

    res.json(diagnostico);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Falha ao processar diagnóstico de IA' });
  }
});

// GET /api/ordens-servico/:id - Obter detalhes completos da OS
router.get('/:id', (req, res) => {
  const os = dbStore.getOrdemById(req.params.id);
  if (!os) {
    return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
  }

  const cliente = dbStore.getClienteById(os.clienteId);
  const tecnico = os.tecnicoId ? dbStore.getTecnicoById(os.tecnicoId) : null;

  res.json({
    ...os,
    cliente,
    tecnico
  });
});

// POST /api/ordens-servico - Criar nova OS
router.post('/', (req, res) => {
  try {
    const novaOS = dbStore.createOrdem(req.body);
    const cliente = dbStore.getClienteById(novaOS.clienteId);
    const tecnico = novaOS.tecnicoId ? dbStore.getTecnicoById(novaOS.tecnicoId) : null;

    res.status(201).json({
      ...novaOS,
      cliente,
      tecnico
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/ordens-servico/:id - Atualizar OS
router.put('/:id', (req, res) => {
  const atualizada = dbStore.updateOrdem(req.params.id, req.body);
  if (!atualizada) {
    return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
  }

  const cliente = dbStore.getClienteById(atualizada.clienteId);
  const tecnico = atualizada.tecnicoId ? dbStore.getTecnicoById(atualizada.tecnicoId) : null;

  res.json({
    ...atualizada,
    cliente,
    tecnico
  });
});

// PATCH /api/ordens-servico/:id/status - Atualização rápida de status (Kanban)
router.patch('/:id/status', (req, res) => {
  const { status, solucaoAplicada } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status é obrigatório' });
  }

  const updateData: any = { status: status as StatusOS };
  if (solucaoAplicada) updateData.solucaoAplicada = solucaoAplicada;
  if (status === 'FINALIZADA' && !updateData.dataConclusao) {
    updateData.dataConclusao = new Date().toISOString();
  }
  if (status === 'ENTREGUE' && !updateData.dataEntrega) {
    updateData.dataEntrega = new Date().toISOString();
  }

  const atualizada = dbStore.updateOrdem(req.params.id, updateData);
  if (!atualizada) {
    return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
  }

  const cliente = dbStore.getClienteById(atualizada.clienteId);
  const tecnico = atualizada.tecnicoId ? dbStore.getTecnicoById(atualizada.tecnicoId) : null;

  res.json({
    ...atualizada,
    cliente,
    tecnico
  });
});

// DELETE /api/ordens-servico/:id - Remover OS
router.delete('/:id', (req, res) => {
  const removida = dbStore.deleteOrdem(req.params.id);
  if (!removida) {
    return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
  }
  res.json({ success: true, message: 'Ordem de serviço removida com sucesso' });
});

export default router;
