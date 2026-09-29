import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Columns3, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  User, 
  Laptop, 
  Wrench, 
  ChevronLeft, 
  ChevronRight,
  X,
  Phone,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import type { OrdemServico, Cliente, Tecnico } from '../types/os.ts';

export interface CompromissoAgenda {
  id: string;
  osId?: string;
  numeroOS?: string;
  clienteNome: string;
  clienteTelefone?: string;
  aparelho: string;
  tipo: 'ENTREGA' | 'DIAGNOSTICO' | 'VISITA_TECNICA' | 'RETIRADA' | 'REVISAO';
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  status: 'AGENDADO' | 'CONFIRMADO' | 'CONCLUIDO';
  tecnicoNome?: string;
  observacoes?: string;
}

interface AgendaHeroProps {
  ordens: OrdemServico[];
  clientes: Cliente[];
  tecnicos: Tecnico[];
  onSelectOS: (os: OrdemServico) => void;
  onNewOS: () => void;
  onNavigateToKanban: () => void;
}

const STORAGE_KEY = 'osmaster_agenda_compromissos';

const SEED_COMPROMISSOS: CompromissoAgenda[] = [
  {
    id: 'ag-1',
    numeroOS: 'OS-2026-004',
    clienteNome: 'Carlos Eduardo Mendes',
    clienteTelefone: '(11) 98765-4321',
    aparelho: 'Notebook Dell Inspiron 15',
    tipo: 'ENTREGA',
    data: '2026-09-29',
    horario: '09:30',
    status: 'CONFIRMADO',
    tecnicoNome: 'Rodrigo Silva',
    observacoes: 'Cliente virá retirar às 09:30. Aparelho pronto com SSD novo.'
  },
  {
    id: 'ag-2',
    numeroOS: 'OS-2026-001',
    clienteNome: 'Mariana Oliveira Costa',
    clienteTelefone: '(11) 99123-4567',
    aparelho: 'MacBook Air M1 2020',
    tipo: 'DIAGNOSTICO',
    data: '2026-09-29',
    horario: '11:00',
    status: 'AGENDADO',
    tecnicoNome: 'Juliana Mendes',
    observacoes: 'Diagnóstico da placa lógica agendado para bancada 2.'
  },
  {
    id: 'ag-3',
    numeroOS: 'OS-2026-005',
    clienteNome: 'Lucas Fernando Alves',
    clienteTelefone: '(11) 97654-3210',
    aparelho: 'iPhone 13 Pro 128GB',
    tipo: 'RETIRADA',
    data: '2026-09-29',
    horario: '14:30',
    status: 'AGENDADO',
    tecnicoNome: 'Lucas Ferreira',
    observacoes: 'Aparelho pronto. Cliente solicitou testes de tela na entrega.'
  },
  {
    id: 'ag-4',
    numeroOS: 'OS-2026-002',
    clienteNome: 'Tech Solutions Consultoria',
    clienteTelefone: '(11) 98888-7777',
    aparelho: 'Servidor Lenovo ThinkCentre',
    tipo: 'VISITA_TECNICA',
    data: '2026-09-29',
    horario: '16:00',
    status: 'CONFIRMADO',
    tecnicoNome: 'Rodrigo Silva',
    observacoes: 'Instalação e alinhamento de rede no cliente corporativo.'
  },
  {
    id: 'ag-5',
    numeroOS: 'OS-2026-007',
    clienteNome: 'Patrícia Rocha',
    clienteTelefone: '(11) 99999-1111',
    aparelho: 'PlayStation 5 Sony',
    tipo: 'ENTREGA',
    data: '2026-09-30',
    horario: '10:00',
    status: 'AGENDADO',
    tecnicoNome: 'Marcos Vinicius',
    observacoes: 'Limpeza e troca de metal líquido finalizados.'
  },
  {
    id: 'ag-6',
    numeroOS: 'OS-2026-006',
    clienteNome: 'Roberto Santos',
    clienteTelefone: '(11) 98877-6655',
    aparelho: 'iPad Air 4ª Geração',
    tipo: 'DIAGNOSTICO',
    data: '2026-10-01',
    horario: '15:00',
    status: 'AGENDADO',
    tecnicoNome: 'Juliana Mendes',
    observacoes: 'Avaliação de conector e bateria.'
  }
];

export const AgendaHero: React.FC<AgendaHeroProps> = ({
  ordens,
  clientes,
  tecnicos,
  onSelectOS,
  onNewOS,
  onNavigateToKanban
}) => {
  const [compromissos, setCompromissos] = useState<CompromissoAgenda[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return SEED_COMPROMISSOS;
  });

  // Current selected date: default today '2026-09-29'
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-29');
  const [filterTipo, setFilterTipo] = useState<string>('TODOS');

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compromissos));
    } catch {
      // ignore
    }
  }, [compromissos]);

  // Calendar week days
  const weekDays = [
    { label: 'Seg', date: '2026-09-28', dayNumber: '28' },
    { label: 'Ter', date: '2026-09-29', dayNumber: '29', isToday: true },
    { label: 'Qua', date: '2026-09-30', dayNumber: '30' },
    { label: 'Qui', date: '2026-10-01', dayNumber: '01' },
    { label: 'Sex', date: '2026-10-02', dayNumber: '02' },
    { label: 'Sáb', date: '2026-10-03', dayNumber: '03' }
  ];

  // Compromissos for selected date
  const filteredCompromissos = compromissos
    .filter(c => c.data === selectedDate)
    .filter(c => filterTipo === 'TODOS' || c.tipo === filterTipo)
    .sort((a, b) => a.horario.localeCompare(b.horario));

  // Toggle status
  const handleToggleStatus = (id: string) => {
    setCompromissos(prev =>
      prev.map(c => {
        if (c.id === id) {
          const nextStatus = c.status === 'CONCLUIDO' ? 'AGENDADO' : 'CONCLUIDO';
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  // WhatsApp trigger
  const handleWhatsApp = (c: CompromissoAgenda) => {
    const cleanPhone = (c.clienteTelefone || '').replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Olá, ${c.clienteNome}! Aqui é da assistência técnica OS Master sobre seu ${c.aparelho}. Lembramos que temos agendamento para hoje (${c.horario}) referente a: ${c.tipo}. Qualquer dúvida estamos à disposição!`
    );
    window.open(`https://wa.me/55${cleanPhone || '11999999999'}?text=${msg}`, '_blank');
  };

  // Find OS to open
  const handleOpenOS = (numeroOS?: string) => {
    if (!numeroOS) return;
    const os = ordens.find(o => o.numeroOS === numeroOS);
    if (os) {
      onSelectOS(os);
    }
  };

  return (
    <div className="bg-[#0f172a] rounded-3xl p-5 sm:p-7 text-white relative overflow-hidden shadow-xl border border-slate-800">
      {/* Background Tech Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <CalendarIcon className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Agenda de Serviços & Prazos da Assistência
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
              Terça-feira, 29 de Setembro • Hoje
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Agenda Técnica Operacional
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Controle de entregas, diagnósticos agendados e visitas técnicas em bancada.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onNavigateToKanban}
            className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer active:scale-95"
            title="Ir para o Quadro Kanban"
          >
            <Columns3 className="w-4 h-4 text-indigo-400" />
            <span>Quadro Kanban</span>
          </button>

          <button
            onClick={onNewOS}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
            title="Abrir formulário de Nova Ordem de Serviço"
          >
            <Plus className="w-4 h-4" />
            <span>Nova OS</span>
          </button>
        </div>
      </div>

      {/* Middle Row: Week Days Selector & Filter Tabs */}
      <div className="relative z-10 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80">
        {/* Days of the Week Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {weekDays.map((d) => {
            const isSelected = selectedDate === d.date;
            const countForDay = compromissos.filter(c => c.data === d.date).length;

            return (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`flex flex-col items-center justify-center min-w-[58px] py-2 px-2 rounded-2xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/25'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  {d.label}
                </span>
                <span className="text-base font-black my-0.5 leading-none">
                  {d.dayNumber}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-700 text-slate-300'
                }`}>
                  {countForDay} {countForDay === 1 ? 'item' : 'itens'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Tipo Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800/70 p-1 rounded-xl border border-slate-700/70 self-start md:self-auto overflow-x-auto">
          {['TODOS', 'ENTREGA', 'DIAGNOSTICO', 'RETIRADA', 'VISITA_TECNICA'].map(t => (
            <button
              key={t}
              onClick={() => setFilterTipo(t)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterTipo === t
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'TODOS' ? 'Todos' : t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Compromissos Cards for Selected Day */}
      <div className="relative z-10 pt-4">
        {filteredCompromissos.length === 0 ? (
          <div className="py-10 text-center bg-slate-900/50 rounded-2xl border border-slate-800/60">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">
              Nenhum serviço ou entrega agendada para este dia.
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Clique em "Nova OS" para cadastrar uma ordem de serviço com prazo de entrega.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredCompromissos.map((c) => {
              const isDone = c.status === 'CONCLUIDO';

              const tipoColor = {
                ENTREGA: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                DIAGNOSTICO: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
                RETIRADA: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                VISITA_TECNICA: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                REVISAO: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              }[c.tipo];

              return (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isDone
                      ? 'bg-slate-900/50 border-slate-800/80 opacity-60'
                      : 'bg-slate-850/80 border-slate-700/80 hover:border-slate-600 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Top Row: Horário & Tipo Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-black text-indigo-300">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{c.horario}</span>
                      </div>

                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${tipoColor}`}>
                        {c.tipo.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Aparelho & Cliente */}
                    <div className="mb-2">
                      <h4 className="text-xs font-black text-white leading-tight flex items-center gap-1.5 truncate">
                        <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.aparelho}</span>
                      </h4>
                      <p className="text-[11px] text-slate-300 font-semibold mt-0.5 truncate flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{c.clienteNome}</span>
                      </p>
                    </div>

                    {/* Observação / Detalhe */}
                    {c.observacoes && (
                      <p className="text-[10px] text-slate-400 line-clamp-2 italic mb-2 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/80">
                        "{c.observacoes}"
                      </p>
                    )}

                    {/* Técnico */}
                    {c.tecnicoNome && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-2">
                        <Wrench className="w-3 h-3 text-indigo-400" />
                        <span>Resp: <strong className="text-slate-300">{c.tecnicoNome}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => handleToggleStatus(c.id)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                      title={isDone ? 'Marcar como pendente' : 'Marcar como concluído'}
                    >
                      <Check className="w-3 h-3" />
                      <span>{isDone ? 'Concluído' : 'Concluir'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {c.numeroOS && (
                        <button
                          onClick={() => handleOpenOS(c.numeroOS)}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 cursor-pointer transition-colors"
                          title="Abrir Ordem de Serviço vinculada"
                        >
                          {c.numeroOS}
                        </button>
                      )}

                      <button
                        onClick={() => handleWhatsApp(c)}
                        className="p-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 cursor-pointer transition-colors"
                        title="Enviar lembrete via WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
