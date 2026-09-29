import { Router } from 'express';
import { dbStore } from '../data/store.ts';

const router = Router();

// GET /api/tecnicos - Listar todos os técnicos
router.get('/', (req, res) => {
  const tecnicos = dbStore.getTecnicos();
  res.json(tecnicos);
});

// GET /api/tecnicos/:id - Detalhes do técnico com suas OSs
router.get('/:id', (req, res) => {
  const tecnico = dbStore.getTecnicoById(req.params.id);
  if (!tecnico) {
    return res.status(404).json({ error: 'Técnico não encontrado' });
  }
  const ordens = dbStore.getOrdens({ tecnicoId: tecnico.id });
  res.json({ ...tecnico, ordens });
});

// POST /api/tecnicos - Criar novo técnico
router.post('/', (req, res) => {
  const { nome, email, telefone, especialidades, ativo, corIdentificacao, comissaoPercentual } = req.body;
  if (!nome || !telefone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  }

  const novo = dbStore.createTecnico({
    nome,
    email: email || '',
    telefone,
    especialidades: Array.isArray(especialidades) ? especialidades : ['Geral'],
    ativo: ativo !== undefined ? Boolean(ativo) : true,
    corIdentificacao: corIdentificacao || '#3B82F6',
    comissaoPercentual: Number(comissaoPercentual) || 10
  });

  res.status(201).json(novo);
});

// PUT /api/tecnicos/:id - Atualizar técnico
router.put('/:id', (req, res) => {
  const atualizado = dbStore.updateTecnico(req.params.id, req.body);
  if (!atualizado) {
    return res.status(404).json({ error: 'Técnico não encontrado' });
  }
  res.json(atualizado);
});

// DELETE /api/tecnicos/:id - Remover técnico
router.delete('/:id', (req, res) => {
  const removido = dbStore.deleteTecnico(req.params.id);
  if (!removido) {
    return res.status(404).json({ error: 'Técnico não encontrado' });
  }
  res.json({ success: true, message: 'Técnico removido com sucesso' });
});

export default router;
