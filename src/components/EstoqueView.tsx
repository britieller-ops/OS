import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  X, 
  PlusCircle, 
  MinusCircle,
  Tag
} from 'lucide-react';
import type { PecaEstoque } from '../types/os.ts';
import { ConfirmModal } from './ConfirmModal.tsx';

interface EstoqueViewProps {
  estoque: PecaEstoque[];
  onSavePeca: (dados: Omit<PecaEstoque, 'id'>, id?: string) => Promise<void>;
  onAjustarEstoque: (id: string, diff: number) => Promise<void>;
  onDeletePeca: (id: string) => Promise<void>;
}

export const EstoqueView: React.FC<EstoqueViewProps> = ({
  estoque,
  onSavePeca,
  onAjustarEstoque,
  onDeletePeca
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('TODAS');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPeca, setEditingPeca] = useState<PecaEstoque | null>(null);
  const [deleteTargetPeca, setDeleteTargetPeca] = useState<PecaEstoque | null>(null);

  // Form State
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Geral');
  const [quantidade, setQuantidade] = useState(1);
  const [quantidadeMinima, setQuantidadeMinima] = useState(3);
  const [precoCusto, setPrecoCusto] = useState(0);
  const [precoVenda, setPrecoVenda] = useState(0);
  const [unidade, setUnidade] = useState('UN');
  const [saving, setSaving] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const openCreateModal = () => {
    setEditingPeca(null);
    setCodigo('');
    setNome('');
    setCategoria('Armazenamento');
    setQuantidade(5);
    setQuantidadeMinima(2);
    setPrecoCusto(0);
    setPrecoVenda(0);
    setUnidade('UN');
    setModalOpen(true);
  };

  const openEditModal = (p: PecaEstoque) => {
    setEditingPeca(p);
    setCodigo(p.codigo);
    setNome(p.nome);
    setCategoria(p.categoria);
    setQuantidade(p.quantidade);
    setQuantidadeMinima(p.quantidadeMinima);
    setPrecoCusto(p.precoCusto);
    setPrecoVenda(p.precoVenda);
    setUnidade(p.unidade);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !nome.trim()) {
      alert('Código e nome do item são obrigatórios.');
      return;
    }

    try {
      setSaving(true);
      await onSavePeca(
        {
          codigo,
          nome,
          categoria,
          quantidade: Number(quantidade) || 0,
          quantidadeMinima: Number(quantidadeMinima) || 1,
          precoCusto: Number(precoCusto) || 0,
          precoVenda: Number(precoVenda) || 0,
          unidade
        },
        editingPeca?.id
      );
      setModalOpen(false);
    } catch (err: any) {
      alert(`Erro ao salvar item no estoque: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Categories list
  const categorias = ['TODAS', ...Array.from(new Set(estoque.map(p => p.categoria)))];

  // Totals
  const valorTotalCusto = estoque.reduce((sum, p) => sum + (p.quantidade * p.precoCusto), 0);
  const valorTotalVenda = estoque.reduce((sum, p) => sum + (p.quantidade * p.precoVenda), 0);
  const itensEstoqueBaixo = estoque.filter(p => p.quantidade <= p.quantidadeMinima);

  const filteredEstoque = estoque.filter(p => {
    if (selectedCategoria !== 'TODAS' && p.categoria !== selectedCategoria) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      return p.nome.toLowerCase().includes(term) || p.codigo.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Estoque & Peças</h1>
          <p className="text-sm text-slate-400">
            Controle de componentes, insumos técnicos, alertas de reposição e precificação.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Peça</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between text-white">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Itens Cadastrados</p>
            <h3 className="text-3xl font-extrabold text-white mt-1">{estoque.length}</h3>
            <p className="text-xs text-slate-400 mt-1">Peças e insumos</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between text-white">
          <div>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Patrimônio em Estoque (Venda)</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{formatCurrency(valorTotalVenda)}</h3>
            <p className="text-xs text-slate-400 mt-1">Custo: {formatCurrency(valorTotalCusto)}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between text-white">
          <div>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Estoque em Nível Crítico</p>
            <h3 className="text-3xl font-extrabold text-amber-400 mt-1">{itensEstoqueBaixo.length}</h3>
            <p className="text-xs text-slate-400 mt-1">Abaixo do limite de segurança</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoria(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategoria === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Estoque Table */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-md overflow-hidden text-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#0d1424] text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Código SKU</th>
                <th className="py-3 px-4">Descrição da Peça</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4 text-center">Saldo em Estoque</th>
                <th className="py-3 px-4 text-right">Custo Unit.</th>
                <th className="py-3 px-4 text-right">Preço de Venda</th>
                <th className="py-3 px-4 text-right">Margem</th>
                <th className="py-3 px-4 text-center">Ajuste Rápido</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredEstoque.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                    Nenhum item de estoque encontrado.
                  </td>
                </tr>
              ) : (
                filteredEstoque.map((p) => {
                  const isLow = p.quantidade <= p.quantidadeMinima;
                  const margem = p.precoCusto > 0 ? (((p.precoVenda - p.precoCusto) / p.precoCusto) * 100).toFixed(0) : 100;

                  return (
                    <tr key={p.id} className="hover:bg-slate-850/80 transition-colors text-slate-200">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400 text-xs">
                        {p.codigo}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white text-xs">
                        {p.nome}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-[11px]">
                          {p.categoria}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`font-black text-xs px-2.5 py-0.5 rounded-full ${
                              isLow
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {p.quantidade} {p.unidade}
                          </span>
                          {isLow && (
                            <span title={`Mínimo: ${p.quantidadeMinima}`}>
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs font-mono text-slate-500">
                        {formatCurrency(p.precoCusto)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs font-bold font-mono text-slate-900">
                        {formatCurrency(p.precoVenda)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs font-bold text-emerald-600">
                        +{margem}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onAjustarEstoque(p.id, -1)}
                            disabled={p.quantidade <= 0}
                            title="Dar saída em 1 unidade"
                            className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-30"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onAjustarEstoque(p.id, 1)}
                            title="Dar entrada em 1 unidade"
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Editar Peça"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetPeca(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Excluir Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Peca */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingPeca ? 'Editar Peça / Item' : 'Nova Peça para Estoque'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Código SKU *</label>
                  <input
                    type="text"
                    required
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="SSD-1TB"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Categoria</label>
                  <input
                    type="text"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Armazenamento, Telas..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descrição / Nome do Item *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome detalhado com especificações"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Qtd Atual</label>
                  <input
                    type="number"
                    min="0"
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Qtd Mínima</label>
                  <input
                    type="number"
                    min="1"
                    value={quantidadeMinima}
                    onChange={(e) => setQuantidadeMinima(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unidade</label>
                  <select
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                  >
                    <option value="UN">UN</option>
                    <option value="PAR">PAR</option>
                    <option value="METRO">METRO</option>
                    <option value="LT">LITRO</option>
                    <option value="KG">KG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={precoCusto}
                    onChange={(e) => setPrecoCusto(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-bold text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={precoVenda}
                    onChange={(e) => setPrecoVenda(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-bold text-right text-indigo-700"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  {saving ? 'Salvando...' : 'Salvar Peça'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetPeca)}
        title="Excluir Peça do Estoque"
        message={`Deseja realmente excluir a peça "${deleteTargetPeca?.nome}" (${deleteTargetPeca?.codigo})?`}
        confirmText="Sim, Excluir Peça"
        danger={true}
        requireAdmin={true}
        onConfirm={async () => {
          if (deleteTargetPeca) {
            await onDeletePeca(deleteTargetPeca.id);
            setDeleteTargetPeca(null);
          }
        }}
        onCancel={() => setDeleteTargetPeca(null)}
      />
    </div>
  );
};
