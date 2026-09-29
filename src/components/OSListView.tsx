import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import type { OrdemServico, StatusOS, PrioridadeOS, Tecnico } from '../types/os.ts';
import { ConfirmModal } from './ConfirmModal.tsx';

interface OSListViewProps {
  ordens: OrdemServico[];
  tecnicos: Tecnico[];
  onSelectOS: (os: OrdemServico) => void;
  onPrintOS: (os: OrdemServico) => void;
  onDeleteOS: (id: string) => void;
  onNewOS: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const OSListView: React.FC<OSListViewProps> = ({
  ordens,
  tecnicos,
  onSelectOS,
  onPrintOS,
  onDeleteOS,
  onNewOS,
  searchQuery,
  onSearchChange
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>('TODOS');
  const [tecnicoFilter, setTecnicoFilter] = useState<string>('TODOS');
  const [deleteTargetOS, setDeleteTargetOS] = useState<OrdemServico | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getStatusBadge = (status: StatusOS) => {
    switch (status) {
      case 'ORCAMENTO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">Orçamento</span>;
      case 'APROVADA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">Aprovada</span>;
      case 'EM_ANALISE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">Em Análise</span>;
      case 'EM_ANDAMENTO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Em Andamento</span>;
      case 'AGUARDANDO_PECAS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30">Aguardando Peças</span>;
      case 'FINALIZADA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Finalizada</span>;
      case 'ENTREGUE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">Entregue</span>;
      case 'CANCELADA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">Cancelada</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">{status}</span>;
    }
  };

  const handleWhatsApp = (os: OrdemServico) => {
    const rawNum = os.cliente?.whatsapp || os.cliente?.telefone || '';
    const phone = rawNum.replace(/\D/g, '');
    if (!phone) {
      alert('Telefone do cliente não cadastrado.');
      return;
    }
    const cleanPhone = phone.startsWith('55') ? phone : `55${phone}`;
    const text = encodeURIComponent(
      `Olá ${os.cliente?.nome || 'cliente'}! Informamos a respeito da sua Ordem de Serviço *${os.numeroOS}* (${os.equipamento.tipo} ${os.equipamento.marca} ${os.equipamento.modelo}). Status atual: *${os.status}*. Valor: ${formatCurrency(os.valorTotal)}. Dúvidas à disposição!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const filteredOrdens = ordens.filter((os) => {
    // Status filter
    if (statusFilter !== 'TODOS') {
      if (statusFilter === 'ABERTAS' && !['ORCAMENTO', 'APROVADA', 'EM_ANALISE'].includes(os.status)) return false;
      if (statusFilter === 'BANCADA' && os.status !== 'EM_ANDAMENTO') return false;
      if (statusFilter === 'PECAS' && os.status !== 'AGUARDANDO_PECAS') return false;
      if (statusFilter === 'CONCLUIDAS' && !['FINALIZADA', 'ENTREGUE'].includes(os.status)) return false;
      if (['ORCAMENTO', 'APROVADA', 'EM_ANALISE', 'EM_ANDAMENTO', 'AGUARDANDO_PECAS', 'FINALIZADA', 'ENTREGUE', 'CANCELADA'].includes(statusFilter) && os.status !== statusFilter) return false;
    }

    // Priority filter
    if (prioridadeFilter !== 'TODOS' && os.prioridade !== prioridadeFilter) {
      return false;
    }

    // Technician filter
    if (tecnicoFilter !== 'TODOS' && os.tecnicoId !== tecnicoFilter) {
      return false;
    }

    // Text search query
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      const matchNum = os.numeroOS.toLowerCase().includes(term);
      const matchClient = os.cliente?.nome.toLowerCase().includes(term);
      const matchEquip = `${os.equipamento.tipo} ${os.equipamento.marca} ${os.equipamento.modelo}`.toLowerCase().includes(term);
      const matchDefeito = os.defeitoRelatado.toLowerCase().includes(term);
      return matchNum || matchClient || matchEquip || matchDefeito;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Ordens de Serviço</h1>
          <p className="text-sm text-slate-400">
            Gerenciamento geral, orçamentos, laudos técnicos e faturamento de ordens.
          </p>
        </div>
        <button
          onClick={onNewOS}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Ordem de Serviço</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 shadow-md space-y-3 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Quick tab filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'TODOS', label: 'Todas' },
              { id: 'ABERTAS', label: 'Abertas / Triagem' },
              { id: 'BANCADA', label: 'Em Andamento' },
              { id: 'PECAS', label: 'Aguardando Peças' },
              { id: 'CONCLUIDAS', label: 'Concluídas' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar nesta lista..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:bg-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Prioridade:</span>
            <select
              value={prioridadeFilter}
              onChange={(e) => setPrioridadeFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none"
            >
              <option value="TODOS">Todas</option>
              <option value="URGENTE">Urgente</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Média</option>
              <option value="BAIXA">Baixa</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Técnico:</span>
            <select
              value={tecnicoFilter}
              onChange={(e) => setTecnicoFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none"
            >
              <option value="TODOS">Todos os Técnicos</option>
              {tecnicos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-slate-400 text-xs font-medium">
            Exibindo <strong>{filteredOrdens.length}</strong> de {ordens.length} ordens
          </div>
        </div>
      </div>

      {/* OS Table */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-md overflow-hidden text-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#0d1424] text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Nº OS</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Equipamento</th>
                <th className="py-3 px-4">Técnico</th>
                <th className="py-3 px-4">Data Abertura</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Prioridade</th>
                <th className="py-3 px-4">Valor Total</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrdens.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                    Nenhuma ordem de serviço encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredOrdens.map((os) => (
                  <tr
                    key={os.id}
                    className="hover:bg-slate-850/80 transition-colors group cursor-pointer text-slate-200"
                    onClick={() => onSelectOS(os)}
                  >
                    {/* OS Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400 text-xs">
                      {os.numeroOS}
                    </td>

                    {/* Client */}
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div>{os.cliente?.nome || 'Cliente avulso'}</div>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {os.cliente?.telefone || os.cliente?.cpfCnpj || '-'}
                      </span>
                    </td>

                    {/* Equipment & Defect */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200 text-xs">
                        {os.equipamento.tipo} - {os.equipamento.marca} {os.equipamento.modelo}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {os.defeitoRelatado}
                      </div>
                    </td>

                    {/* Technician */}
                    <td className="py-3.5 px-4 text-xs">
                      {os.tecnico ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: os.tecnico.corIdentificacao }}
                          ></span>
                          <span className="text-slate-300 font-medium">{os.tecnico.nome}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Não atribuído</span>
                      )}
                    </td>

                    {/* Opening Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">
                      {formatDate(os.dataAbertura)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(os.status)}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          os.prioridade === 'URGENTE'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : os.prioridade === 'ALTA'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {os.prioridade}
                      </span>
                    </td>

                    {/* Total Value */}
                    <td className="py-3.5 px-4 font-bold text-white text-xs">
                      {formatCurrency(os.valorTotal)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectOS(os)}
                          title="Ver / Editar Detalhes"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onPrintOS(os)}
                          title="Imprimir OS / Salvar PDF"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleWhatsApp(os)}
                          title="Enviar atualização via WhatsApp"
                          className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetOS(os)}
                          title="Excluir OS"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetOS)}
        title="Excluir Ordem de Serviço"
        message={`Deseja realmente excluir a ordem de serviço "${deleteTargetOS?.numeroOS}"?`}
        confirmText="Sim, Excluir OS"
        danger={true}
        requireAdmin={true}
        onConfirm={async () => {
          if (deleteTargetOS) {
            await onDeleteOS(deleteTargetOS.id);
            setDeleteTargetOS(null);
          }
        }}
        onCancel={() => setDeleteTargetOS(null)}
      />
    </div>
  );
};
