import { Router } from 'express';
import { dbStore } from '../data/store.ts';

const router = Router();

// GET /api/estoque - Listar itens do estoque com busca opcional
router.get('/', (req, res) => {
  const search = req.query.search as string | undefined;
  const itens = dbStore.getEstoque(search);
  res.json(itens);
});

// GET /api/estoque/:id - Obter peça por ID
router.get('/:id', (req, res) => {
  const item = dbStore.getPecaById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item de estoque não encontrado' });
  }
  res.json(item);
});

// POST /api/estoque - Adicionar nova peça/insumo
router.post('/', (req, res) => {
  const { codigo, nome, categoria, quantidade, quantidadeMinima, precoCusto, precoVenda, unidade } = req.body;
  if (!nome || !codigo) {
    return res.status(400).json({ error: 'Nome e código do item são obrigatórios' });
  }

  const novaPeca = dbStore.createPeca({
    codigo,
    nome,
    categoria: categoria || 'Geral',
    quantidade: Number(quantidade) || 0,
    quantidadeMinima: Number(quantidadeMinima) || 1,
    precoCusto: Number(precoCusto) || 0,
    precoVenda: Number(precoVenda) || 0,
    unidade: unidade || 'UN'
  });

  res.status(201).json(novaPeca);
});

// PUT /api/estoque/:id - Atualizar peça
router.put('/:id', (req, res) => {
  const atualizado = dbStore.updatePeca(req.params.id, req.body);
  if (!atualizado) {
    return res.status(404).json({ error: 'Item de estoque não encontrado' });
  }
  res.json(atualizado);
});

// PATCH /api/estoque/:id/ajuste - Ajuste rápido de entrada/saída de quantidade
router.patch('/:id/ajuste', (req, res) => {
  const { quantidadeDiferenca } = req.body;
  if (quantidadeDiferenca === undefined) {
    return res.status(400).json({ error: 'quantidadeDiferenca é obrigatória' });
  }

  const atualizado = dbStore.ajustarEstoque(req.params.id, Number(quantidadeDiferenca));
  if (!atualizado) {
    return res.status(404).json({ error: 'Item de estoque não encontrado' });
  }
  res.json(atualizado);
});

// DELETE /api/estoque/:id - Remover item do estoque
router.delete('/:id', (req, res) => {
  const removido = dbStore.deletePeca(req.params.id);
  if (!removido) {
    return res.status(404).json({ error: 'Item de estoque não encontrado' });
  }
  res.json({ success: true, message: 'Item de estoque removido com sucesso' });
});

export default router;
