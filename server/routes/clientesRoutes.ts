import { Router } from 'express';
import { dbStore } from '../data/store.ts';

const router = Router();

// GET /api/clientes - Listar clientes com busca opcional
router.get('/', (req, res) => {
  const search = req.query.search as string | undefined;
  const clientes = dbStore.getClientes(search);
  res.json(clientes);
});

// GET /api/clientes/:id - Buscar cliente específico com suas OSs
router.get('/:id', (req, res) => {
  const cliente = dbStore.getClienteById(req.params.id);
  if (!cliente) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }
  const ordens = dbStore.getOrdens({ clienteId: cliente.id });
  res.json({ ...cliente, ordens });
});

// POST /api/clientes - Criar novo cliente
router.post('/', (req, res) => {
  const { nome, email, telefone, whatsapp, cpfCnpj, tipoPessoa, cep, logradouro, numero, complemento, bairro, cidade, uf, observacoes } = req.body;
  if (!nome || !telefone) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  }

  const novoCliente = dbStore.createCliente({
    nome,
    email: email || '',
    telefone,
    whatsapp: whatsapp || telefone.replace(/\D/g, ''),
    cpfCnpj: cpfCnpj || '',
    tipoPessoa: tipoPessoa || 'PF',
    cep: cep || '',
    logradouro: logradouro || '',
    numero: numero || '',
    complemento: complemento || '',
    bairro: bairro || '',
    cidade: cidade || 'São Paulo',
    uf: uf || 'SP',
    observacoes: observacoes || ''
  });

  res.status(201).json(novoCliente);
});

// PUT /api/clientes/:id - Atualizar dados do cliente
router.put('/:id', (req, res) => {
  const atualizado = dbStore.updateCliente(req.params.id, req.body);
  if (!atualizado) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }
  res.json(atualizado);
});

// DELETE /api/clientes/:id - Remover cliente
router.delete('/:id', (req, res) => {
  const removido = dbStore.deleteCliente(req.params.id);
  if (!removido) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }
  res.json({ success: true, message: 'Cliente removido com sucesso' });
});

export default router;
