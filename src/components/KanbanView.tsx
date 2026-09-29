import React, { useState } from 'react';
import { 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Printer, 
  Search,
  Filter,
  UserCheck,
  AlertTriangle,
  GripVertical,
  CheckCircle2,
  Clock,
  Wrench,
  Package,
  Layers,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import type { OrdemServico, StatusOS, PrioridadeOS } from '../types/os.ts';

interface KanbanViewProps {
  ordens: OrdemServico[];
  onSelectOS: (os: OrdemServico) => void;
  onUpdateStatus: (id: string, newStatus: StatusOS) => void;
  onPrintOS: (os: OrdemServico) => void;
  onNewOS: () => void;
}

interface ColumnDef {
  id: string;
  targetStatus: StatusOS;
  title: string;
  statuses: StatusOS[];
  colorBorder: string;
  colorBorderActive: string;
  colorBg: string;
  colorHeader: string;
  badgeBg: string;
  badgeText: string;
  icon: React.ReactNode;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  ordens,
  onSelectOS,
  onUpdateStatus,
  onPrintOS,
  onNewOS
}) => {
  // Drag and Drop state
  const [draggedOSId, setDraggedOSId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('TODAS');
  const [filtroTecnico, setFiltroTecnico] = useState<string>('TODOS');

  const columns: ColumnDef[] = [
    {
      id: 'col-orcamento',
      targetStatus: 'ORCAMENTO',
      title: 'Orçamento / Triagem',
      statuses: ['ORCAMENTO'],
      colorBorder: 'border-slate-800',
      colorBorderActive: 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-400',
      colorBg: 'bg-[#0f172a]/90',
      colorHeader: 'text-slate-200',
      badgeBg: 'bg-slate-800',
      badgeText: 'text-slate-300',
      icon: <Clock className="w-4 h-4 text-slate-400" />
    },
    {
      id: 'col-analise',
      targetStatus: 'EM_ANALISE',
      title: 'Aprovada / Análise',
      statuses: ['APROVADA', 'EM_ANALISE'],
      colorBorder: 'border-blue-900/60',
      colorBorderActive: 'border-blue-500 bg-blue-950/60 ring-2 ring-blue-400',
      colorBg: 'bg-blue-950/20',
      colorHeader: 'text-blue-300',
      badgeBg: 'bg-blue-900/40',
      badgeText: 'text-blue-300',
      icon: <Layers className="w-4 h-4 text-blue-400" />
    },
    {
      id: 'col-andamento',
      targetStatus: 'EM_ANDAMENTO',
      title: 'Em Execução / Bancada',
      statuses: ['EM_ANDAMENTO'],
      colorBorder: 'border-amber-900/60',
      colorBorderActive: 'border-amber-500 bg-amber-950/60 ring-2 ring-amber-400',
      colorBg: 'bg-amber-950/20',
      colorHeader: 'text-amber-300',
      badgeBg: 'bg-amber-900/40',
      badgeText: 'text-amber-300',
      icon: <Wrench className="w-4 h-4 text-amber-400" />
    },
    {
      id: 'col-pecas',
      targetStatus: 'AGUARDANDO_PECAS',
      title: 'Aguardando Peças',
      statuses: ['AGUARDANDO_PECAS'],
      colorBorder: 'border-orange-900/60',
      colorBorderActive: 'border-orange-500 bg-orange-950/60 ring-2 ring-orange-400',
      colorBg: 'bg-orange-950/20',
      colorHeader: 'text-orange-300',
      badgeBg: 'bg-orange-900/40',
      badgeText: 'text-orange-300',
      icon: <Package className="w-4 h-4 text-orange-400" />
    },
    {
      id: 'col-finalizada',
      targetStatus: 'FINALIZADA',
      title: 'Pronto / Finalizado',
      statuses: ['FINALIZADA'],
      colorBorder: 'border-emerald-900/60',
      colorBorderActive: 'border-emerald-500 bg-emerald-950/60 ring-2 ring-emerald-400',
      colorBg: 'bg-emerald-950/20',
      colorHeader: 'text-emerald-300',
      badgeBg: 'bg-emerald-900/40',
      badgeText: 'text-emerald-300',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    },
    {
      id: 'col-entregue',
      targetStatus: 'ENTREGUE',
      title: 'Entregue ao Cliente',
      statuses: ['ENTREGUE'],
      colorBorder: 'border-teal-900/60',
      colorBorderActive: 'border-teal-500 bg-teal-950/60 ring-2 ring-teal-400',
      colorBg: 'bg-teal-950/20',
      colorHeader: 'text-teal-300',
      badgeBg: 'bg-teal-900/40',
      badgeText: 'text-teal-300',
      icon: <CheckCircle2 className="w-4 h-4 text-teal-400" />
    }
  ];

  // Helper sequence for column progression
  const sequence: StatusOS[] = [
    'ORCAMENTO',
    'EM_ANALISE',
    'EM_ANDAMENTO',
    'AGUARDANDO_PECAS',
    'FINALIZADA',
    'ENTREGUE'
  ];

  const getNextStatus = (current: StatusOS): StatusOS | null => {
    if (current === 'ORCAMENTO') return 'EM_ANALISE';
    if (current === 'APROVADA' || current === 'EM_ANALISE') return 'EM_ANDAMENTO';
    if (current === 'EM_ANDAMENTO') return 'FINALIZADA';
    if (current === 'AGUARDANDO_PECAS') return 'EM_ANDAMENTO';
    if (current === 'FINALIZADA') return 'ENTREGUE';
    return null;
  };

  const getPrevStatus = (current: StatusOS): StatusOS | null => {
    if (current === 'ENTREGUE') return 'FINALIZADA';
    if (current === 'FINALIZADA') return 'EM_ANDAMENTO';
    if (current === 'AGUARDANDO_PECAS') return 'EM_ANDAMENTO';
    if (current === 'EM_ANDAMENTO') return 'EM_ANALISE';
    if (current === 'EM_ANALISE' || current === 'APROVADA') return 'ORCAMENTO';
    return null;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Filtered orders
  const filteredOrdens = ordens.filter((os) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = os.numeroOS.toLowerCase().includes(q);
      const matchCli = os.cliente?.nome.toLowerCase().includes(q) || false;
      const matchEquip = `${os.equipamento.marca} ${os.equipamento.modelo} ${os.equipamento.tipo}`.toLowerCase().includes(q);
      const matchDef = os.defeitoRelatado.toLowerCase().includes(q);
      if (!matchNum && !matchCli && !matchEquip && !matchDef) return false;
    }

    if (filtroPrioridade !== 'TODAS' && os.prioridade !== filtroPrioridade) {
      return false;
    }

    if (filtroTecnico !== 'TODOS') {
      if (filtroTecnico === 'SEM_TECNICO' && os.tecnicoId) return false;
      if (filtroTecnico !== 'SEM_TECNICO' && os.tecnicoId !== filtroTecnico) return false;
    }

    return true;
  });

  // Extract unique technicians for filter
  const tecnicosUnicos = Array.from(
    new Map(
      ordens
        .filter((o) => o.tecnico)
        .map((o) => [o.tecnico!.id, o.tecnico!])
    ).values()
  );

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedOSId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: string) => {
    // Only clear if leaving the column element itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColId === colId) {
      setDragOverColId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: StatusOS) => {
    e.preventDefault();
    setDragOverColId(null);
    const osId = e.dataTransfer.getData('text/plain') || draggedOSId;
    setDraggedOSId(null);

    if (osId) {
      const currentOS = ordens.find((o) => o.id === osId);
      if (currentOS && currentOS.status !== targetStatus) {
        onUpdateStatus(osId, targetStatus);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0f172a] p-5 rounded-3xl border border-slate-800 shadow-md text-white">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Quadro Kanban Interativo</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Arrastar e Soltar Ativo
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Arraste os cards entre as colunas ou utilize os controles rápidos para avançar as fases das Ordens de Serviço.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar OS, cliente, modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-56"
            />
          </div>

          {/* Filter by Priority */}
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="TODAS">Todas as Prioridades</option>
            <option value="URGENTE">🔥 Urgente</option>
            <option value="ALTA">⚠️ Alta</option>
            <option value="MEDIA">🟡 Média</option>
            <option value="BAIXA">🟢 Baixa</option>
          </select>

          {/* Filter by Technician */}
          <select
            value={filtroTecnico}
            onChange={(e) => setFiltroTecnico(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="TODOS">Todos os Técnicos</option>
            <option value="SEM_TECNICO">Sem Técnico Atribuído</option>
            {tecnicosUnicos.map((t) => (
              <option key={t.id} value={t.id}>
                👨‍🔧 {t.nome}
              </option>
            ))}
          </select>

          {/* Button New OS */}
          <button
            onClick={onNewOS}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova OS</span>
          </button>
        </div>
      </div>

      {/* Helper hint */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
          <span>Dica: <strong>Segure e arraste</strong> qualquer card para outra coluna para atualizar a etapa instantaneamente.</span>
        </span>
        <span>Exibindo <strong>{filteredOrdens.length}</strong> de {ordens.length} ordens</span>
      </div>

      {/* Kanban Board Container with horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start min-h-[calc(100vh-250px)]">
        {columns.map((col) => {
          const colOrdens = filteredOrdens.filter((os) => col.statuses.includes(os.status));
          const totalValorCol = colOrdens.reduce((sum, o) => sum + (o.valorTotal || 0), 0);
          const isOverThisCol = dragOverColId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.targetStatus)}
              className={`w-80 shrink-0 rounded-2xl border transition-all duration-150 p-3.5 flex flex-col max-h-[85vh] shadow-xs ${
                isOverThisCol
                  ? col.colorBorderActive
                  : `${col.colorBorder} ${col.colorBg}`
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/70 mb-3">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <h3 className={`font-extrabold text-sm ${col.colorHeader}`}>{col.title}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-black ${col.badgeBg} ${col.badgeText}`}
                  >
                    {colOrdens.length}
                  </span>
                </div>

                <span className="text-[11px] font-bold text-slate-500 font-mono">
                  {formatCurrency(totalValorCol)}
                </span>
              </div>

              {/* Drop Target Indicator when dragging */}
              {isOverThisCol && (
                <div className="mb-3 py-3 px-2 border-2 border-dashed border-indigo-400 bg-indigo-100/70 rounded-xl text-center text-xs font-bold text-indigo-700 animate-pulse">
                  ↓ Soltar aqui para mover para {col.title}
                </div>
              )}

              {/* Cards Container */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                {colOrdens.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl bg-[#0f172a]/60">
                    Nenhuma OS nesta etapa
                  </div>
                ) : (
                  colOrdens.map((os) => {
                    const nextStatus = getNextStatus(os.status);
                    const prevStatus = getPrevStatus(os.status);
                    const isDraggingThis = draggedOSId === os.id;

                    return (
                      <div
                        key={os.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, os.id)}
                        onDragEnd={() => {
                          setDraggedOSId(null);
                          setDragOverColId(null);
                        }}
                        onClick={() => onSelectOS(os)}
                        className={`bg-[#131d33] rounded-xl p-3.5 border border-slate-750 shadow-md hover:shadow-lg hover:border-indigo-500/50 hover:bg-[#182542] transition-all cursor-grab active:cursor-grabbing group relative text-white ${
                          isDraggingThis ? 'opacity-40 scale-95 border-dashed border-indigo-400' : ''
                        }`}
                      >
                        {/* Drag Handle & Status Tag */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 group-hover:text-slate-300 cursor-grab" title="Arraste para mover">
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>
                            <span className="font-mono text-xs font-extrabold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                              {os.numeroOS}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              os.prioridade === 'URGENTE'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : os.prioridade === 'ALTA'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : os.prioridade === 'BAIXA'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {os.prioridade}
                          </span>
                        </div>

                        {/* Equipment & Client */}
                        <h4 className="font-bold text-white text-sm leading-snug line-clamp-1 group-hover:text-indigo-400 transition-colors">
                          {os.equipamento.tipo} - {os.equipamento.marca} {os.equipamento.modelo}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {os.cliente?.nome || 'Cliente não identificado'}
                        </p>

                        {/* Defect Preview */}
                        <div className="mt-2 text-xs text-slate-300 bg-[#0a101d] p-2 rounded-lg line-clamp-2 border border-slate-800">
                          {os.defeitoRelatado}
                        </div>

                        {/* Technician & Total */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            {os.tecnico ? (
                              <div className="flex items-center gap-1.5" title={os.tecnico.nome}>
                                <div
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: os.tecnico.corIdentificacao }}
                                ></div>
                                <span className="font-semibold text-slate-300 text-[11px] truncate max-w-[100px]">
                                  {os.tecnico.nome.split(' ')[0]}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">Sem técnico</span>
                            )}
                          </div>
                          <span className="font-black text-white text-xs font-mono">
                            {formatCurrency(os.valorTotal)}
                          </span>
                        </div>

                        {/* Quick Direct Status Selector & Progress Buttons */}
                        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                          {/* Direct Select */}
                          <select
                            value={os.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(os.id, e.target.value as StatusOS);
                            }}
                            className="text-[11px] font-semibold py-1 px-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[140px]"
                          >
                            <option value="ORCAMENTO">Orçamento</option>
                            <option value="EM_ANALISE">Em Análise</option>
                            <option value="EM_ANDAMENTO">Em Execução</option>
                            <option value="AGUARDANDO_PECAS">Aguard. Peças</option>
                            <option value="FINALIZADA">Finalizada</option>
                            <option value="ENTREGUE">Entregue</option>
                            <option value="CANCELADA">Cancelada</option>
                          </select>

                          {/* Action Buttons: Prev, Next, Print */}
                          <div className="flex items-center gap-1">
                            {prevStatus && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateStatus(os.id, prevStatus);
                                }}
                                title="Voltar etapa anterior"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {nextStatus && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateStatus(os.id, nextStatus);
                                }}
                                title="Avançar próxima etapa"
                                className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 transition-colors"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPrintOS(os);
                              }}
                              title="Imprimir Comprovante da OS"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
