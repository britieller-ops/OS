import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  UserCheck, 
  Plus, 
  FolderPlus, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ClientesView } from './ClientesView.tsx';
import { EstoqueView } from './EstoqueView.tsx';
import { TecnicosView } from './TecnicosView.tsx';
import type { Cliente, Tecnico, PecaEstoque, OrdemServico } from '../types/os.ts';

export type CadastrosSubTab = 'clientes' | 'produtos' | 'tecnicos';

interface CadastrosViewProps {
  initialSubTab?: CadastrosSubTab;
  clientes: Cliente[];
  tecnicos: Tecnico[];
  estoque: PecaEstoque[];
  ordens: OrdemServico[];
  onSaveCliente: (dados: Omit<Cliente, 'id' | 'createdAt'>, id?: string) => Promise<void>;
  onDeleteCliente: (id: string) => Promise<void>;
  onSaveTecnico: (dados: Omit<Tecnico, 'id'>, id?: string) => Promise<void>;
  onDeleteTecnico: (id: string) => Promise<void>;
  onSavePeca: (dados: Omit<PecaEstoque, 'id'>, id?: string) => Promise<void>;
  onAjustarEstoque: (id: string, diff: number) => Promise<void>;
  onDeletePeca: (id: string) => Promise<void>;
  onSelectOS: (os: OrdemServico) => void;
}

export const CadastrosView: React.FC<CadastrosViewProps> = ({
  initialSubTab = 'clientes',
  clientes,
  tecnicos,
  estoque,
  ordens,
  onSaveCliente,
  onDeleteCliente,
  onSaveTecnico,
  onDeleteTecnico,
  onSavePeca,
  onAjustarEstoque,
  onDeletePeca,
  onSelectOS
}) => {
  const [subTab, setSubTab] = useState<CadastrosSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Alertas de estoque baixo
  const estoqueBaixo = estoque.filter(p => p.quantidade <= p.quantidadeMinima);

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. CABEÇALHO DA CENTRAL DE CADASTROS                           */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-900/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <FolderPlus className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold tracking-wider text-indigo-300 uppercase">
                Módulo Central
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Central de Cadastros
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Gerencie a base de <strong>Clientes</strong>, catálogo de <strong>Produtos & Peças</strong> e equipe de <strong>Técnicos (Funcionários)</strong> da assistência.
            </p>
          </div>

          {/* Mini Cards de Resumo */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xs">
            <button
              onClick={() => setSubTab('clientes')}
              className={`text-left p-2.5 rounded-xl transition-all cursor-pointer ${
                subTab === 'clientes' ? 'bg-indigo-600 text-white shadow-xs' : 'hover:bg-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-indigo-200">
                <Users className="w-3.5 h-3.5" />
                <span>Clientes</span>
              </div>
              <p className="text-lg font-black mt-0.5">{clientes.length}</p>
            </button>

            <button
              onClick={() => setSubTab('produtos')}
              className={`text-left p-2.5 rounded-xl transition-all cursor-pointer ${
                subTab === 'produtos' ? 'bg-indigo-600 text-white shadow-xs' : 'hover:bg-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-indigo-200">
                <Package className="w-3.5 h-3.5" />
                <span>Produtos</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-lg font-black">{estoque.length}</p>
                {estoqueBaixo.length > 0 && (
                  <span className="text-[10px] font-bold bg-amber-500 text-slate-900 px-1.5 rounded-full">
                    !{estoqueBaixo.length}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setSubTab('tecnicos')}
              className={`text-left p-2.5 rounded-xl transition-all cursor-pointer ${
                subTab === 'tecnicos' ? 'bg-indigo-600 text-white shadow-xs' : 'hover:bg-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-indigo-200">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Técnicos</span>
              </div>
              <p className="text-lg font-black mt-0.5">{tecnicos.length}</p>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SUB-TABS INTERNAS: CLIENTES / PRODUTOS / TÉCNICOS              */}
        {/* ============================================================== */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-indigo-900/60 overflow-x-auto pb-1">
          <button
            onClick={() => setSubTab('clientes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              subTab === 'clientes'
                ? 'bg-white text-indigo-900 shadow-md scale-102'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-500" />
            <span>1. Cadastro de Clientes</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-extrabold">
              {clientes.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('produtos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              subTab === 'produtos'
                ? 'bg-white text-indigo-900 shadow-md scale-102'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 text-indigo-500" />
            <span>2. Cadastro de Produtos & Peças (Estoque)</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-extrabold">
              {estoque.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('tecnicos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              subTab === 'tecnicos'
                ? 'bg-white text-indigo-900 shadow-md scale-102'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4 text-indigo-500" />
            <span>3. Cadastro de Técnicos (Funcionários)</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-extrabold">
              {tecnicos.length}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CONTEÚDO DA SUB-TAB ATIVA                                   */}
      {/* ============================================================== */}
      <div>
        {subTab === 'clientes' && (
          <ClientesView
            clientes={clientes}
            ordens={ordens}
            onSaveCliente={onSaveCliente}
            onDeleteCliente={onDeleteCliente}
            onSelectOS={onSelectOS}
          />
        )}

        {subTab === 'produtos' && (
          <EstoqueView
            estoque={estoque}
            onSavePeca={onSavePeca}
            onAjustarEstoque={onAjustarEstoque}
            onDeletePeca={onDeletePeca}
          />
        )}

        {subTab === 'tecnicos' && (
          <TecnicosView
            tecnicos={tecnicos}
            ordens={ordens}
            onSaveTecnico={onSaveTecnico}
            onDeleteTecnico={onDeleteTecnico}
          />
        )}
      </div>
    </div>
  );
};
