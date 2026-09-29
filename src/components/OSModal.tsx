import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Trash2, 
  Wrench, 
  User, 
  Check, 
  Printer, 
  AlertCircle,
  HelpCircle,
  Cpu
} from 'lucide-react';
import type { 
  OrdemServico, 
  Cliente, 
  Tecnico, 
  PecaEstoque, 
  ItemOS, 
  StatusOS, 
  PrioridadeOS,
  AIDiagnosticoResult
} from '../types/os.ts';
import { api } from '../services/api.ts';

interface OSModalProps {
  os: OrdemServico | null; // null means create mode
  clientes: Cliente[];
  tecnicos: Tecnico[];
  estoque: PecaEstoque[];
  onClose: () => void;
  onSave: (dados: Partial<OrdemServico>) => Promise<void>;
  onPrint?: (os: OrdemServico) => void;
}

export const OSModal: React.FC<OSModalProps> = ({
  os,
  clientes,
  tecnicos,
  estoque,
  onClose,
  onSave,
  onPrint
}) => {
  // Form State
  const [clienteId, setClienteId] = useState<string>(os?.clienteId || (clientes[0]?.id ?? ''));
  const [tecnicoId, setTecnicoId] = useState<string>(os?.tecnicoId || '');
  const [status, setStatus] = useState<StatusOS>(os?.status || 'ORCAMENTO');
  const [prioridade, setPrioridade] = useState<PrioridadeOS>(os?.prioridade || 'MEDIA');
  
  // Equipamento
  const [tipoEquipamento, setTipoEquipamento] = useState(os?.equipamento?.tipo || 'Notebook');
  const [marca, setMarca] = useState(os?.equipamento?.marca || '');
  const [modelo, setModelo] = useState(os?.equipamento?.modelo || '');
  const [numeroSerie, setNumeroSerie] = useState(os?.equipamento?.numeroSerie || '');
  const [acessorios, setAcessorios] = useState(os?.equipamento?.acessorios || '');
  const [estadoConservacao, setEstadoConservacao] = useState(os?.equipamento?.estadoConservacao || '');

  // Defeito & Diagnóstico
  const [defeitoRelatado, setDefeitoRelatado] = useState(os?.defeitoRelatado || '');
  const [diagnosticoTecnico, setDiagnosticoTecnico] = useState(os?.diagnosticoTecnico || '');
  const [solucaoAplicada, setSolucaoAplicada] = useState(os?.solucaoAplicada || '');

  // Itens & Financeiro
  const [itens, setItens] = useState<ItemOS[]>(
    os?.itens && os.itens.length > 0
      ? os.itens
      : [
          {
            id: `item-${Date.now()}`,
            tipo: 'SERVICO',
            descricao: 'Mão de obra / Diagnóstico técnico',
            quantidade: 1,
            valorUnitario: 150.0,
            subtotal: 150.0
          }
        ]
  );
  const [desconto, setDesconto] = useState<number>(os?.desconto || 0);
  const [formaPagamento, setFormaPagamento] = useState<any>(os?.formaPagamento || 'PIX');
  const [statusPagamento, setStatusPagamento] = useState<'PENDENTE' | 'PAGO' | 'PARCIAL'>(os?.statusPagamento || 'PENDENTE');
  const [dataPrevisao, setDataPrevisao] = useState(os?.dataPrevisao ? os.dataPrevisao.split('T')[0] : '');
  const [garantiaDias, setGarantiaDias] = useState<number>(os?.garantiaDias ?? 90);
  const [termoGarantia, setTermoGarantia] = useState(
    os?.termoGarantia || 'Garantia legal de 90 dias a contar da retirada sobre serviços e peças especificadas.'
  );

  // AI Diagnostic State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIDiagnosticoResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'itens' | 'ia'>('geral');

  const [empresaNome, setEmpresaNome] = useState('OS Master Assistência Técnica');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('os_master_empresa_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nome) setEmpresaNome(parsed.nome);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Calculate totals
  const valorServicos = itens
    .filter(i => i.tipo === 'SERVICO')
    .reduce((sum, i) => sum + (i.quantidade * i.valorUnitario), 0);

  const valorPecas = itens
    .filter(i => i.tipo === 'PECA')
    .reduce((sum, i) => sum + (i.quantidade * i.valorUnitario), 0);

  const valorTotal = Math.max(0, valorServicos + valorPecas - (Number(desconto) || 0));

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleAddItem = (tipo: 'SERVICO' | 'PECA') => {
    const newItem: ItemOS = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tipo,
      descricao: tipo === 'SERVICO' ? 'Novo serviço executado' : 'Nova peça / insumo',
      quantidade: 1,
      valorUnitario: 0,
      subtotal: 0
    };
    setItens([...itens, newItem]);
  };

  const handleSelectPecaEstoque = (itemId: string, pecaId: string) => {
    const peca = estoque.find(p => p.id === pecaId);
    if (!peca) return;

    setItens(
      itens.map(item => {
        if (item.id === itemId) {
          const subtotal = item.quantidade * peca.precoVenda;
          return {
            ...item,
            pecaId: peca.id,
            descricao: `${peca.codigo} - ${peca.nome}`,
            valorUnitario: peca.precoVenda,
            subtotal
          };
        }
        return item;
      })
    );
  };

  const handleUpdateItem = (id: string, field: keyof ItemOS, value: any) => {
    setItens(
      itens.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantidade' || field === 'valorUnitario') {
            updated.subtotal = Number(updated.quantidade || 0) * Number(updated.valorUnitario || 0);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItens(itens.filter(item => item.id !== id));
  };

  const handleRunAIDiagnostico = async () => {
    if (!defeitoRelatado.trim()) {
      alert('Por favor, informe primeiro o defeito relatado pelo cliente.');
      return;
    }

    try {
      setAiLoading(true);
      const res = await api.requestAIDiagnostico({
        equipamentoTipo: tipoEquipamento,
        marca,
        modelo,
        defeitoRelatado
      });
      setAiResult(res);
      setActiveTab('ia');
    } catch (err: any) {
      alert(`Falha no diagnóstico com IA: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAILaudo = () => {
    if (aiResult?.laudoSugerido) {
      setDiagnosticoTecnico(prev => {
        if (prev.trim()) {
          return `${prev}\n\n[Diagnóstico IA]: ${aiResult.laudoSugerido}`;
        }
        return aiResult.laudoSugerido || '';
      });
      alert('Laudo da IA transferido para o Diagnóstico Técnico com sucesso!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) {
      alert('Selecione um cliente para a ordem de serviço.');
      return;
    }
    if (!defeitoRelatado.trim()) {
      alert('Preencha o defeito relatado.');
      return;
    }

    try {
      setSaving(true);
      await onSave({
        clienteId,
        tecnicoId: tecnicoId || undefined,
        status,
        prioridade,
        equipamento: {
          tipo: tipoEquipamento,
          marca,
          modelo,
          numeroSerie,
          acessorios,
          estadoConservacao
        },
        defeitoRelatado,
        diagnosticoTecnico,
        solucaoAplicada,
        itens,
        valorServicos,
        valorPecas,
        desconto: Number(desconto) || 0,
        valorTotal,
        formaPagamento,
        statusPagamento,
        dataPrevisao: dataPrevisao ? new Date(dataPrevisao).toISOString() : undefined,
        garantiaDias: Number(garantiaDias) || 90,
        termoGarantia
      });
      onClose();
    } catch (err: any) {
      alert(`Erro ao salvar Ordem de Serviço: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900">
                  {os ? `Editar Ordem ${os.numeroOS}` : 'Nova Ordem de Serviço'}
                </h2>
                {os && (
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                    {os.numeroOS}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {empresaNome} • Gestão de Atendimento Técnico
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {os && onPrint && (
              <button
                type="button"
                onClick={() => onPrint(os)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs cursor-pointer"
                title="Abrir visualização de impressão com cabeçalho e logo"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Visualizar / Imprimir OS</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 px-6 gap-6 bg-white text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'geral'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Dados Gerais & Equipamento
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('itens')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'itens'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>2. Serviços & Peças</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
              {itens.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ia')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'ia'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>3. Copilot IA de Diagnóstico</span>
            {aiResult && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: GERAL & EQUIPAMENTO */}
          {activeTab === 'geral' && (
            <div className="space-y-6">
              {/* Cliente & Técnico Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Cliente Solicitante *
                  </label>
                  <select
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                  >
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome} {c.cpfCnpj ? `(${c.cpfCnpj})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Técnico Responsável
                  </label>
                  <select
                    value={tecnicoId}
                    onChange={(e) => setTecnicoId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                  >
                    <option value="">Nenhum técnico atribuído</option>
                    {tecnicos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome} - {t.especialidades.join(', ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status Atual da OS
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusOS)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                  >
                    <option value="ORCAMENTO">Orçamento</option>
                    <option value="APROVADA">Aprovada pelo Cliente</option>
                    <option value="EM_ANALISE">Em Análise / Triagem</option>
                    <option value="EM_ANDAMENTO">Em Execução / Bancada</option>
                    <option value="AGUARDANDO_PECAS">Aguardando Peças</option>
                    <option value="FINALIZADA">Finalizada / Pronto para Retirada</option>
                    <option value="ENTREGUE">Entregue ao Cliente</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Prioridade de Atendimento
                  </label>
                  <select
                    value={prioridade}
                    onChange={(e) => setPrioridade(e.target.value as PrioridadeOS)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média (Padrão)</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente / Retorno Imediato</option>
                  </select>
                </div>
              </div>

              {/* Equipment Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  Identificação do Equipamento / Objeto
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Aparelho</label>
                    <input
                      type="text"
                      placeholder="Ex: Notebook, Celular, TV..."
                      value={tipoEquipamento}
                      onChange={(e) => setTipoEquipamento(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Marca / Fabricante</label>
                    <input
                      type="text"
                      placeholder="Ex: Dell, Apple, Samsung..."
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Modelo Exato</label>
                    <input
                      type="text"
                      placeholder="Ex: G15 5520, iPhone 13..."
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nº de Série / IMEI</label>
                    <input
                      type="text"
                      placeholder="Ex: BR-123456 / Serial"
                      value={numeroSerie}
                      onChange={(e) => setNumeroSerie(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Acessórios Deixados</label>
                    <input
                      type="text"
                      placeholder="Ex: Fonte original, cabo, capa..."
                      value={acessorios}
                      onChange={(e) => setAcessorios(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Estado de Conservação</label>
                    <input
                      type="text"
                      placeholder="Ex: Bom estado, marcas leves..."
                      value={estadoConservacao}
                      onChange={(e) => setEstadoConservacao(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Defeito Relatado & IA Callout */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Defeito Relatado pelo Cliente *
                  </label>
                  <button
                    type="button"
                    onClick={handleRunAIDiagnostico}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold hover:opacity-90 transition-all shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiLoading ? 'Analisando via IA...' : 'Diagnosticar com IA Copilot'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva detalhadamente o sintoma apresentado pelo equipamento relatado pelo cliente..."
                  value={defeitoRelatado}
                  onChange={(e) => setDefeitoRelatado(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                ></textarea>
              </div>

              {/* Diagnóstico Técnico & Laudo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Diagnóstico Técnico & Constatação em Bancada
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Laudo técnico com os testes realizados e anomalias encontradas..."
                    value={diagnosticoTecnico}
                    onChange={(e) => setDiagnosticoTecnico(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Solução Aplicada / Procedimento
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Descreva o procedimento executado para sanar o defeito..."
                    value={solucaoAplicada}
                    onChange={(e) => setSolucaoAplicada(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ITENS, SERVIÇOS & PAGAMENTO */}
          {activeTab === 'itens' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Discriminação de Serviços e Peças</h3>
                  <p className="text-xs text-slate-500">Adicione a mão de obra aplicada e peças de reposição</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddItem('SERVICO')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Serviço</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddItem('PECA')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Peça do Estoque</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {itens.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="w-24 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.tipo === 'SERVICO'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.tipo}
                      </span>
                    </div>

                    {/* Description or Estoque selector */}
                    <div className="flex-1">
                      {item.tipo === 'PECA' ? (
                        <div className="space-y-1">
                          <select
                            value={item.pecaId || ''}
                            onChange={(e) => handleSelectPecaEstoque(item.id, e.target.value)}
                            className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                          >
                            <option value="">Selecione item do estoque...</option>
                            {estoque.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.codigo} - {p.nome} (Estoque: {p.quantidade} {p.unidade} - R$ {p.precoVenda.toFixed(2)})
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={item.descricao}
                            onChange={(e) => handleUpdateItem(item.id, 'descricao', e.target.value)}
                            placeholder="Descrição personalizada"
                            className="w-full text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700"
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={item.descricao}
                          onChange={(e) => handleUpdateItem(item.id, 'descricao', e.target.value)}
                          placeholder="Descrição do serviço"
                          className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        />
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="w-20 shrink-0">
                      <label className="block text-[10px] text-slate-500">Qtd</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => handleUpdateItem(item.id, 'quantidade', parseInt(e.target.value) || 1)}
                        className="w-full text-xs font-bold px-2 py-1 bg-white border border-slate-200 rounded-lg text-center"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="w-28 shrink-0">
                      <label className="block text-[10px] text-slate-500">Unitário (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.valorUnitario}
                        onChange={(e) => handleUpdateItem(item.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold px-2 py-1 bg-white border border-slate-200 rounded-lg text-right"
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="w-28 shrink-0 text-right">
                      <label className="block text-[10px] text-slate-500">Subtotal</label>
                      <span className="font-extrabold text-xs text-slate-900">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Financial Totals & Payment Fields */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Previsão de Entrega</label>
                    <input
                      type="date"
                      value={dataPrevisao}
                      onChange={(e) => setDataPrevisao(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Forma de Pagamento</label>
                    <select
                      value={formaPagamento}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800"
                    >
                      <option value="PIX">PIX</option>
                      <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                      <option value="CARTAO_DEBITO">Cartão de Débito</option>
                      <option value="DINHEIRO">Dinheiro em Espécie</option>
                      <option value="BOLETO">Boleto Bancário</option>
                      <option value="A_PRAZO">Faturado / A Prazo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Status do Pagamento</label>
                    <select
                      value={statusPagamento}
                      onChange={(e) => setStatusPagamento(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-bold"
                    >
                      <option value="PENDENTE">Pendente</option>
                      <option value="PAGO">Pago / Liquidado</option>
                      <option value="PARCIAL">Entrada Parcial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Garantia (Dias)</label>
                    <input
                      type="number"
                      value={garantiaDias}
                      onChange={(e) => setGarantiaDias(parseInt(e.target.value) || 0)}
                      className="w-32 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Desconto Concedido (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={desconto}
                      onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-right font-bold"
                    />
                  </div>
                </div>

                {/* Subtotals & Total Summary */}
                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-slate-600">
                    <span>Serviços: <strong>{formatCurrency(valorServicos)}</strong></span>
                    <span>Peças: <strong>{formatCurrency(valorPecas)}</strong></span>
                    {desconto > 0 && (
                      <span className="text-rose-600">Desconto: -{formatCurrency(desconto)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">VALOR TOTAL DA OS:</span>
                    <span className="text-xl font-extrabold text-indigo-600">
                      {formatCurrency(valorTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COPILOT IA DE DIAGNÓSTICO */}
          {activeTab === 'ia' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-200 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Análise Preditiva de Defeito</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Geração assistida por Inteligência Artificial para guiar o técnico no diagnóstico rápido, testes e peças sugeridas.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRunAIDiagnostico}
                  disabled={aiLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shrink-0 shadow-sm"
                >
                  {aiLoading ? 'Processando...' : 'Reavaliar com IA'}
                </button>
              </div>

              {aiResult ? (
                <div className="space-y-4">
                  {/* Badges */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="px-3 py-1 rounded-full font-bold bg-purple-100 text-purple-800">
                      Complexidade Estimada: {aiResult.complexidade}
                    </span>
                    <span className="px-3 py-1 rounded-full font-bold bg-blue-100 text-blue-800">
                      Tempo Estimado em Bancada: {aiResult.tempoEstimadoHoras}h
                    </span>
                  </div>

                  {/* Probable Causes */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Possíveis Causas do Defeito
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {aiResult.provaveisCausas?.map((causa, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{causa}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Tests */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Procedimentos & Testes Recomendados
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {aiResult.testesRecomendados?.map((teste, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{teste}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggested Parts */}
                  {aiResult.possiveisPecas && aiResult.possiveisPecas.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Peças / Componentes Prováveis para Substituição
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {aiResult.possiveisPecas.map((p, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Technical Text with Apply Button */}
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                        Laudo Técnico Sugerido pela IA
                      </h5>
                      <button
                        type="button"
                        onClick={handleApplyAILaudo}
                        className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
                      >
                        Copiar para Laudo da OS
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-xl border border-indigo-100">
                      "{aiResult.laudoSugerido}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                  <Sparkles className="w-8 h-8 text-indigo-300 mx-auto animate-bounce" />
                  <p>Clique no botão acima para acionar a análise de inteligência técnica.</p>
                </div>
              )}
            </div>
          )}

          {/* Footer Save & Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
              >
                {saving ? (
                  <span>Salvando...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{os ? 'Salvar Alterações' : 'Cadastrar Ordem de Serviço'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
