import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Receipt, 
  Check, 
  Settings2, 
  Upload, 
  Trash2, 
  Building2,
  Image as ImageIcon,
  Edit2,
  Download,
  ExternalLink,
  AlertCircle,
  FileDown,
  Loader2
} from 'lucide-react';
import { generateOSPDF } from '../utils/generateOSPDF.ts';
import type { OrdemServico } from '../types/os.ts';

export interface EmpresaConfig {
  nome: string;
  subtitulo?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  telefone: string;
  email: string;
  endereco: string;
  cidadeUf: string;
  chavePix?: string;
  logoUrl?: string; // Base64 data url or https link
}

const DEFAULT_EMPRESA_CONFIG: EmpresaConfig = {
  nome: 'OS Master Assistência Técnica',
  subtitulo: 'Manutenção Especializada em Hardware & Dispositivos',
  cnpj: '12.345.678/0001-90',
  inscricaoEstadual: 'Isento',
  telefone: '(11) 98765-4321',
  email: 'contato@osmaster.com.br',
  endereco: 'Av. Central de Serviços, 1000',
  cidadeUf: 'São Paulo - SP',
  chavePix: '12.345.678/0001-90',
  logoUrl: ''
};

const STORAGE_KEY = 'os_master_empresa_config';

interface OSPrintModalProps {
  os: OrdemServico;
  onClose: () => void;
}

export const OSPrintModal: React.FC<OSPrintModalProps> = ({ os, onClose }) => {
  // Format selection: 'a4' | '80mm'
  const [format, setFormat] = useState<'a4' | '80mm'>('a4');
  
  // Customization options
  const [showWarranty, setShowWarranty] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);
  const [showDiagnosis, setShowDiagnosis] = useState(true);
  const [viaType, setViaType] = useState<'cliente' | 'oficina' | 'unica'>('unica');

  // Company Data & Logo State
  const [empresa, setEmpresa] = useState<EmpresaConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_EMPRESA_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Erro ao ler empresa do localStorage:', e);
    }
    return DEFAULT_EMPRESA_CONFIG;
  });

  // Modal to customize company data & logo
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [formEmpresa, setFormEmpresa] = useState<EmpresaConfig>(empresa);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormEmpresa(empresa);
  }, [empresa]);

  const handleSaveEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    setEmpresa(formEmpresa);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formEmpresa));
    } catch (err) {
      console.error('Erro ao salvar no localStorage:', err);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setConfigModalOpen(false);
    }, 900);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem é muito grande. Escolha uma imagem de até 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormEmpresa(prev => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormEmpresa(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Listen for Ctrl+P / Cmd+P and Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [printFeedback, setPrintFeedback] = useState<string | null>(null);

  const handlePrint = () => {
    setPrintFeedback('Abrindo caixa de impressão...');
    try {
      window.focus();
      setTimeout(() => {
        window.print();
        setTimeout(() => setPrintFeedback(null), 1000);
      }, 60);
    } catch (err) {
      console.warn('Erro ao chamar window.print():', err);
      setPrintFeedback('Impressão bloqueada pelo navegador. Use o atalho Ctrl+P.');
      setTimeout(() => setPrintFeedback(null), 3000);
    }
  };

  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Generate and download a real vector PDF file (100% reliable, never downloads HTML)
  const handleDownloadPDF = () => {
    setGeneratingPDF(true);
    try {
      generateOSPDF(os, empresa, format, viaType);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setTimeout(() => setGeneratingPDF(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-xs print-modal-container flex flex-col">
      {/* ============================================================== */}
      {/* FIXED TOP TOOLBAR (STICKY, NEVER COVERS DOCUMENT)              */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-50 bg-slate-900/95 border-b border-slate-800 text-white px-4 sm:px-6 py-3 shadow-xl backdrop-blur-md no-print shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Format Switcher & Edit Header Button */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setFormat('a4')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  format === 'a4'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Papel A4</span>
              </button>
              <button
                onClick={() => setFormat('80mm')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  format === '80mm'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Cupom 80mm</span>
              </button>
            </div>

            {/* Customization Button */}
            <button
              onClick={() => setConfigModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold rounded-xl border border-indigo-500/40 transition-all cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Meus Dados & Logo</span>
            </button>
          </div>

          {/* Right: Via, Options, Print & Close */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Via */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-300 border-r border-slate-700 pr-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Via:</span>
              {(['unica', 'cliente', 'oficina'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setViaType(v)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    viaType === v ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v === 'unica' ? 'Padrão' : v === 'cliente' ? 'Cliente' : 'Oficina'}
                </button>
              ))}
            </div>

            {/* Direct Download PDF Button (100% Reliable in any browser / iframe) */}
            <button
              onClick={handleDownloadPDF}
              disabled={generatingPDF}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="Gerar e baixar a Ordem de Serviço em arquivo PDF real"
            >
              {generatingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Baixar PDF</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              title="Disparar impressão do navegador ou salvar PDF (Atalho: Ctrl + P)"
            >
              <Printer className="w-4 h-4" />
              <span>{printFeedback || 'Imprimir'}</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Fechar janela de impressão"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* ============================================================== */}
      {/* SCROLLABLE DOCUMENT VIEWPORT (TOP-ALIGNED, NO CUTOFF)          */}
      {/* ============================================================== */}
      <main className="flex-1 w-full flex flex-col items-center justify-start p-4 sm:p-8">
        
        {/* Iframe Environment Notice (when running in AI Studio sandbox) */}
        {isInsideIframe && (
          <div className="w-full max-w-[210mm] mb-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Ambiente de Preview (Iframe):</strong> Os navegadores impedem a janela nativa de impressão dentro do painel. Clique em <strong>Baixar PDF</strong> ou abra em <strong>Tela Cheia</strong>.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={generatingPDF}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                title="Baixar arquivo da OS em formato PDF"
              >
                {generatingPDF ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Gerando PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Baixar PDF</span>
                  </>
                )}
              </button>
              <a
                href={window.location.href}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs flex items-center gap-1 border border-white/20 transition-all cursor-pointer"
                title="Abrir o sistema fora do iframe em nova aba"
              >
                <span>Tela Cheia</span>
                <ExternalLink className="w-3 h-3 text-slate-300" />
              </a>
            </div>
          </div>
        )}

        {/* Visual Indicator of Active Header (no-print) */}
        <div className="w-full max-w-[210mm] mb-4 flex items-center justify-between text-xs text-slate-400 px-2 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Cabeçalho Ativo: <strong className="text-white">{empresa.nome}</strong> ({empresa.cnpj})</span>
          </div>
          <button
            onClick={() => setConfigModalOpen(true)}
            className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            <span>Editar Logo & Dados</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* 1. LAYOUT MINIMALISTA: PAPEL A4                                */}
        {/* ============================================================== */}
        {format === 'a4' && (
          <article className="print-area-a4 bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-12 rounded-xl shadow-2xl space-y-5 text-[11px] leading-tight font-sans">
            
            {/* ========================================================== */}
            {/* CABEÇALHO OFICIAL VISÍVEL DA ORDEM DE SERVIÇO             */}
            {/* ========================================================== */}
            <div className="border-b-2 border-black pb-4 flex items-start justify-between gap-6">
              {/* Left: Logo & Company details */}
              <div className="flex items-start gap-4">
                {empresa.logoUrl ? (
                  <div className="shrink-0 bg-white p-1 rounded border border-gray-300">
                    <img 
                      src={empresa.logoUrl} 
                      alt={empresa.nome} 
                      className="max-h-20 max-w-[180px] object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-black text-white flex flex-col items-center justify-center font-black text-xl shrink-0 shadow-xs">
                    <span>OS</span>
                    <span className="text-[8px] font-normal tracking-widest text-gray-300">MASTER</span>
                  </div>
                )}

                <div>
                  <h1 className="text-base font-black tracking-tight text-black uppercase">
                    {empresa.nome}
                  </h1>
                  {empresa.subtitulo && (
                    <p className="text-[10px] text-gray-700 font-medium mt-0.5">
                      {empresa.subtitulo}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-700 mt-1">
                    CNPJ/CPF: <strong>{empresa.cnpj}</strong> {empresa.inscricaoEstadual ? `• IE: ${empresa.inscricaoEstadual}` : ''}
                  </p>
                  <p className="text-[10px] text-gray-700">
                    {empresa.endereco} • {empresa.cidadeUf} • Tel/WhatsApp: <strong>{empresa.telefone}</strong>
                  </p>
                  {empresa.email && (
                    <p className="text-[10px] text-gray-700">
                      E-mail: {empresa.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: OS Details */}
              <div className="text-right shrink-0">
                <span className="text-[9px] uppercase tracking-wider text-gray-600 block">
                  {viaType === 'cliente' ? 'Via do Cliente' : viaType === 'oficina' ? 'Via da Oficina' : 'Ordem de Serviço'}
                </span>
                <div className="text-2xl font-black font-mono text-black">
                  {os.numeroOS}
                </div>
                <span className="text-[10px] text-gray-700 block mt-0.5">
                  Entrada: <strong>{formatDate(os.dataAbertura)}</strong>
                </span>
                <span className="inline-block border-2 border-black px-2 py-0.5 text-[9px] font-bold uppercase mt-1">
                  {os.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Grid Minimalista: Cliente & Atendimento */}
            <div className="grid grid-cols-2 gap-6 border-b border-black pb-4">
              {/* Cliente */}
              <div className="space-y-1">
                <div className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">
                  1. DADOS DO CLIENTE
                </div>
                <div className="font-bold text-sm text-black">
                  {os.cliente?.nome || 'Cliente não cadastrado'}
                </div>
                <div>CPF/CNPJ: {os.cliente?.cpfCnpj || '-'}</div>
                <div>Telefone: <strong>{os.cliente?.telefone || '-'}</strong></div>
                <div>E-mail: {os.cliente?.email || '-'}</div>
                {os.cliente?.logradouro && (
                  <div className="text-[10px] text-gray-700">
                    {os.cliente.logradouro}, {os.cliente.numero} - {os.cliente.bairro}, {os.cliente.cidade}/{os.cliente.uf}
                  </div>
                )}
              </div>

              {/* Atendimento & Aparelho */}
              <div className="space-y-1">
                <div className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">
                  2. EQUIPAMENTO & ATENDIMENTO
                </div>
                <div className="font-bold text-sm text-black">
                  {os.equipamento.tipo} {os.equipamento.marca} {os.equipamento.modelo}
                </div>
                <div>Nº de Série / IMEI: <span className="font-mono font-bold">{os.equipamento.numeroSerie || 'Não visível / Não informado'}</span></div>
                <div>Técnico Responsável: <strong>{os.tecnico?.nome || 'Técnico Responsável'}</strong></div>
                <div>Previsão de Entrega: {os.dataPrevisao ? formatDate(os.dataPrevisao) : 'A definir'}</div>
                <div>Acessórios / Condições: {os.equipamento.acessorios || 'Nenhum acessório deixado'}</div>
              </div>
            </div>

            {/* Defeito Relatado e Laudo */}
            <div className="space-y-3 border-b border-black pb-4">
              <div>
                <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider block mb-0.5">
                  3. DEFEITO RELATADO PELO CLIENTE
                </span>
                <p className="text-black italic pl-2 border-l-2 border-black">
                  "{os.defeitoRelatado}"
                </p>
              </div>

              {showDiagnosis && (os.diagnosticoTecnico || os.solucaoAplicada) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {os.diagnosticoTecnico && (
                    <div>
                      <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider block mb-0.5">
                        DIAGNÓSTICO TÉCNICO / CONSTATAÇÃO
                      </span>
                      <p className="text-black pl-2 border-l border-gray-400">
                        {os.diagnosticoTecnico}
                      </p>
                    </div>
                  )}
                  {os.solucaoAplicada && (
                    <div>
                      <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider block mb-0.5">
                        SOLUÇÃO APLICADA / MANUTENÇÃO
                      </span>
                      <p className="text-black pl-2 border-l border-gray-400">
                        {os.solucaoAplicada}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tabela de Serviços e Peças */}
            <div className="space-y-3 border-b border-black pb-4">
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider block">
                4. DISCRIMINAÇÃO DE SERVIÇOS E PEÇAS
              </span>

              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="py-1.5 font-bold uppercase text-gray-700">Item</th>
                    <th className="py-1.5 font-bold uppercase text-gray-700">Tipo</th>
                    <th className="py-1.5 text-center font-bold uppercase text-gray-700">Qtd</th>
                    <th className="py-1.5 text-right font-bold uppercase text-gray-700">Unitário</th>
                    <th className="py-1.5 text-right font-bold uppercase text-gray-700">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {os.itens.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-1.5 text-black font-medium">{item.descricao}</td>
                      <td className="py-1.5 text-gray-600 uppercase text-[9px]">{item.tipo}</td>
                      <td className="py-1.5 text-center">{item.quantidade}</td>
                      <td className="py-1.5 text-right font-mono">{formatCurrency(item.valorUnitario)}</td>
                      <td className="py-1.5 text-right font-mono font-semibold">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totais */}
              <div className="flex justify-end pt-1">
                <div className="w-60 space-y-1 text-right">
                  <div className="flex justify-between text-gray-600 text-[10px]">
                    <span>Subtotal Serviços:</span>
                    <span className="font-mono">{formatCurrency(os.valorServicos)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-[10px]">
                    <span>Subtotal Peças:</span>
                    <span className="font-mono">{formatCurrency(os.valorPecas)}</span>
                  </div>
                  {os.desconto > 0 && (
                    <div className="flex justify-between text-black text-[10px]">
                      <span>Desconto:</span>
                      <span className="font-mono">- {formatCurrency(os.desconto)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black border-t-2 border-black pt-1 mt-1 text-black">
                    <span>TOTAL:</span>
                    <span className="font-mono">{formatCurrency(os.valorTotal)}</span>
                  </div>
                  <div className="text-[9px] text-gray-600 pt-0.5">
                    Forma de Pagto: <strong>{os.formaPagamento || 'A combinar'}</strong> ({os.statusPagamento})
                  </div>
                  {empresa.chavePix && (
                    <div className="text-[9px] text-gray-700 pt-0.5">
                      Chave PIX: <span className="font-mono font-bold text-black">{empresa.chavePix}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Termo de Garantia Resumido */}
            {showWarranty && (
              <div className="text-[9px] text-gray-600 leading-tight space-y-1 border-b border-gray-300 pb-3">
                <span className="font-bold uppercase text-black block">TERMO DE GARANTIA:</span>
                <p>
                  {os.termoGarantia || 'Garantia legal de 90 dias conforme Art. 26 do Código de Defesa do Consumidor, válida exclusivamente para os serviços executados e peças aplicadas discriminadas nesta ordem. Não cobrimos danos causados por quedas, umidade, curto-circuito, mau uso ou intervenção de terceiros.'}
                </p>
                <p>
                  Aparelhos não retirados no prazo de 90 dias após a conclusão estarão sujeitos a cobrança de taxa de guarda ou descarte conforme legislação aplicável.
                </p>
              </div>
            )}

            {/* Assinaturas Minimalistas */}
            {showSignatures && (
              <div className="grid grid-cols-2 gap-12 pt-8 text-center text-[10px]">
                <div>
                  <div className="border-t border-black pt-1">
                    <span className="font-bold block text-black">{os.cliente?.nome || 'Assinatura do Cliente'}</span>
                    <span className="text-[9px] text-gray-500">Declaro que retirei o equipamento testado e em perfeitas condições</span>
                  </div>
                </div>
                <div>
                  <div className="border-t border-black pt-1">
                    <span className="font-bold block text-black">{os.tecnico?.nome || empresa.nome}</span>
                    <span className="text-[9px] text-gray-500">Responsável Técnico / Oficina</span>
                  </div>
                </div>
              </div>
            )}

          </article>
        )}

        {/* ============================================================== */}
        {/* 2. LAYOUT MINIMALISTA: CUPOM NÃO FISCAL 80MM (BOBINA TÉRMICA)   */}
        {/* ============================================================== */}
        {format === '80mm' && (
          <article className="print-area-80mm bg-white text-black w-full max-w-[80mm] p-5 rounded-lg shadow-2xl font-mono text-[11px] leading-tight select-all">
            {/* Header Térmico com Logo opcional e Dados */}
            <div className="text-center space-y-1 pb-2 border-b border-dashed border-black">
              {empresa.logoUrl && (
                <div className="flex justify-center mb-1">
                  <img 
                    src={empresa.logoUrl} 
                    alt={empresa.nome} 
                    className="max-h-14 max-w-[140px] object-contain filter grayscale contrast-125"
                  />
                </div>
              )}
              <div className="font-bold text-xs uppercase tracking-tight">
                {empresa.nome}
              </div>
              <div className="text-[10px] text-gray-800">
                CNPJ/CPF: {empresa.cnpj}
              </div>
              <div className="text-[10px] text-gray-800">
                Tel/WhatsApp: {empresa.telefone}
              </div>
              <div className="text-[9px] text-gray-600">
                {empresa.endereco} - {empresa.cidadeUf}
              </div>
            </div>

            {/* Título do Comprovante */}
            <div className="text-center py-2 border-b border-dashed border-black space-y-0.5">
              <div className="font-bold text-xs">
                COMPROVANTE NAO FISCAL
              </div>
              <div className="font-bold text-sm tracking-wider">
                {os.numeroOS}
              </div>
              <div className="text-[10px]">
                DATA: {formatDate(os.dataAbertura)}
              </div>
              <div className="text-[10px] uppercase font-bold">
                STATUS: {os.status.replace('_', ' ')}
              </div>
            </div>

            {/* Dados do Cliente */}
            <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
              <div><strong>CLIENTE:</strong> {os.cliente?.nome || '-'}</div>
              <div><strong>CONTATO:</strong> {os.cliente?.telefone || '-'}</div>
              {os.cliente?.cpfCnpj && <div><strong>DOC:</strong> {os.cliente.cpfCnpj}</div>}
            </div>

            {/* Equipamento */}
            <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
              <div><strong>APARELHO:</strong> {os.equipamento.tipo} {os.equipamento.marca} {os.equipamento.modelo}</div>
              <div><strong>SERIAL/IMEI:</strong> {os.equipamento.numeroSerie || 'N/A'}</div>
              {os.equipamento.acessorios && <div><strong>ACESSORIOS:</strong> {os.equipamento.acessorios}</div>}
            </div>

            {/* Defeito Relatado */}
            <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
              <div className="font-bold">DEFEITO RELATADO:</div>
              <div className="italic">"{os.defeitoRelatado}"</div>
            </div>

            {/* Itens e Serviços */}
            <div className="py-2 border-b border-dashed border-black space-y-1 text-[10px]">
              <div className="font-bold">ITENS / SERVICOS:</div>
              {os.itens.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-1">
                  <span className="truncate max-w-[190px]">
                    {item.quantidade}x {item.descricao}
                  </span>
                  <span className="font-bold shrink-0">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totais do Cupom */}
            <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
              {os.valorServicos > 0 && (
                <div className="flex justify-between">
                  <span>Total Servicos:</span>
                  <span>{formatCurrency(os.valorServicos)}</span>
                </div>
              )}
              {os.valorPecas > 0 && (
                <div className="flex justify-between">
                  <span>Total Pecas:</span>
                  <span>{formatCurrency(os.valorPecas)}</span>
                </div>
              )}
              {os.desconto > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Desconto:</span>
                  <span>- {formatCurrency(os.desconto)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold pt-1 border-t border-black">
                <span>TOTAL A PAGAR:</span>
                <span>{formatCurrency(os.valorTotal)}</span>
              </div>
              <div className="text-[9px] pt-0.5">
                Pagto: {os.formaPagamento || 'A combinar'} ({os.statusPagamento})
              </div>
              {empresa.chavePix && (
                <div className="text-[9px] pt-0.5 font-bold">
                  PIX: {empresa.chavePix}
                </div>
              )}
            </div>

            {/* Termo de Garantia Resumido */}
            {showWarranty && (
              <div className="py-2 border-b border-dashed border-black text-[9px] text-gray-700 leading-tight">
                GARANTIA: 90 dias conforme CDC art. 26 para servicos e pecas desta OS. Danos por mau uso, umidade ou violacao perdem garantia. Aparelhos nao retirados em 90 dias serao destinados a guarda.
              </div>
            )}

            {/* Assinatura */}
            {showSignatures && (
              <div className="pt-6 pb-2 text-center text-[10px] space-y-1">
                <div className="border-t border-black pt-1">
                  Assinatura do Cliente
                </div>
                <div className="text-[8px] text-gray-500">
                  Aparelho retirado testado
                </div>
              </div>
            )}

            {/* Rodapé térmico */}
            <div className="text-center pt-2 text-[9px] text-gray-600">
              *** Obrigado pela preferencia! ***
            </div>
          </article>
        )}

      </main>

      {/* ============================================================== */}
      {/* 3. MODAL: PERSONALIZAR CABEÇALHO & LOGO                        */}
      {/* ============================================================== */}
      {configModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Meus Dados & Logotipo</h3>
                  <p className="text-xs text-slate-500">Personalize o cabeçalho impresso das Ordens de Serviço</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfigModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmpresa} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              
              {/* Seção Logotipo */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Sua Logomarca</span>
                
                <div className="flex items-center gap-4">
                  {formEmpresa.logoUrl ? (
                    <div className="relative group w-24 h-16 bg-white border border-slate-200 rounded-xl p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                      <img 
                        src={formEmpresa.logoUrl} 
                        alt="Logo" 
                        className="max-h-full max-w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        title="Remover logotipo"
                        className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-16 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6 stroke-1" />
                      <span className="text-[9px] mt-0.5">Sem Logo</span>
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      className="hidden"
                      id="logo-upload-input"
                    />
                    <label
                      htmlFor="logo-upload-input"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Carregar Imagem (PNG/JPG)</span>
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Recomendado: imagem com fundo transparente ou branco.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nome da Empresa */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nome da Empresa / Razão Social *
                </label>
                <input
                  type="text"
                  required
                  value={formEmpresa.nome}
                  onChange={(e) => setFormEmpresa({ ...formEmpresa, nome: e.target.value })}
                  placeholder="Ex: Minha Assistência Técnica"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* Subtítulo / Slogan */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Subtítulo / Especialidade
                </label>
                <input
                  type="text"
                  value={formEmpresa.subtitulo || ''}
                  onChange={(e) => setFormEmpresa({ ...formEmpresa, subtitulo: e.target.value })}
                  placeholder="Ex: Reparo em Celulares, Notebooks e Placas"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* CNPJ e Telefone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    CNPJ ou CPF *
                  </label>
                  <input
                    type="text"
                    required
                    value={formEmpresa.cnpj}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, cnpj: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={formEmpresa.telefone}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Endereço e Cidade */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formEmpresa.endereco}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, endereco: e.target.value })}
                    placeholder="Rua Exemplo, 100 - Bairro"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Cidade/UF
                  </label>
                  <input
                    type="text"
                    value={formEmpresa.cidadeUf}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, cidadeUf: e.target.value })}
                    placeholder="São Paulo - SP"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* E-mail e Chave PIX */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formEmpresa.email}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, email: e.target.value })}
                    placeholder="contato@empresa.com"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Chave PIX (Para Recebimentos)
                  </label>
                  <input
                    type="text"
                    value={formEmpresa.chavePix || ''}
                    onChange={(e) => setFormEmpresa({ ...formEmpresa, chavePix: e.target.value })}
                    placeholder="CNPJ, E-mail ou Telefone"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Rodapé do Modal */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {savedSuccess ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>Dados e Logo salvos com sucesso!</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Os dados ficam salvos permanentemente no seu navegador.
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfigModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Salvar Cabeçalho
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
