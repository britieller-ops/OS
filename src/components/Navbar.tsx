import React, { useState, useRef, useEffect } from 'react';
import { 
  Wrench, 
  Columns3, 
  ListFilter, 
  Package, 
  RotateCw, 
  Users, 
  UserCheck, 
  PlusCircle,
  Plus,
  FolderPlus,
  ChevronDown,
  ShieldCheck,
  Lock,
  LogOut,
  LogIn
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext.tsx';

export type NavTab = 'dashboard' | 'kanban' | 'ordens' | 'cadastros' | 'estoque' | 'clientes' | 'tecnicos';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onNewOS?: () => void;
  onRefresh: () => void;
  estoqueBaixoCount: number;
  onOpenLoginPage?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onNewOS,
  onRefresh,
  estoqueBaixoCount,
  onOpenLoginPage
}) => {
  const { isAdmin, adminUser, openLoginModal, logout } = useAdminAuth();
  const [cadastrosDropdownOpen, setCadastrosDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isCadastrosActive = ['cadastros', 'clientes', 'estoque', 'tecnicos'].includes(activeTab);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCadastrosDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2.5 no-print shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity (Acts as Página Inicial button) */}
        <button
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-3 text-left group cursor-pointer transition-transform active:scale-95"
          title="Ir para a Página Inicial"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 group-hover:bg-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0 transition-colors">
            <Wrench className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                OS<span className="text-indigo-600">Master</span>
              </span>
              <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 group-hover:bg-indigo-100 transition-colors">
                PRO SAAS
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 hidden sm:block leading-none mt-0.5">
              Página Inicial • Gestão de Ordens de Serviço
            </p>
          </div>
        </button>

        {/* Center: Segmented Navigation Pills */}
        <div className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white text-indigo-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Início</span>
          </button>

          <button
            onClick={() => onTabChange('kanban')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'kanban'
                ? 'bg-white text-indigo-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns3 className="w-4 h-4 text-indigo-500" />
            <span>Quadro Kanban</span>
          </button>

          <button
            onClick={() => onTabChange('ordens')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ordens'
                ? 'bg-white text-indigo-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-4 h-4 text-slate-500" />
            <span>Todas as OS</span>
          </button>

          {/* Dedicated Cadastros Menu with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center">
              <button
                onClick={() => onTabChange('cadastros')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-xl text-xs font-semibold transition-all cursor-pointer ${
                  isCadastrosActive
                    ? 'bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Acessar Central de Cadastros"
              >
                <FolderPlus className="w-4 h-4 text-indigo-600" />
                <span>Cadastros</span>
                {estoqueBaixoCount > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {estoqueBaixoCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCadastrosDropdownOpen(!cadastrosDropdownOpen)}
                className={`px-1.5 py-1.5 rounded-r-xl text-xs transition-all cursor-pointer border-l border-slate-200/60 ${
                  isCadastrosActive
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Ver opções de cadastro"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dropdown Menu */}
            {cadastrosDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Menu de Cadastros
                </div>

                <button
                  onClick={() => {
                    onTabChange('clientes');
                    setCadastrosDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                    activeTab === 'clientes' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">1. Clientes</p>
                      <p className="text-[10px] text-slate-400">Pessoas e Empresas</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onTabChange('estoque');
                    setCadastrosDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-colors cursor-pointer mt-1 ${
                    activeTab === 'estoque' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">2. Produtos & Peças</p>
                      <p className="text-[10px] text-slate-400">Catálogo e Estoque</p>
                    </div>
                  </div>
                  {estoqueBaixoCount > 0 && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                      {estoqueBaixoCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    onTabChange('tecnicos');
                    setCadastrosDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-colors cursor-pointer mt-1 ${
                    activeTab === 'tecnicos' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">3. Técnicos & Funcionários</p>
                      <p className="text-[10px] text-slate-400">Colaboradores e Comissões</p>
                    </div>
                  </div>
                </button>

                <div className="mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onTabChange('cadastros');
                      setCadastrosDropdownOpen(false);
                    }}
                    className="w-full text-center py-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/50 rounded-lg transition-colors cursor-pointer"
                  >
                    Abrir Central Completa →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            title="Atualizar dados do sistema"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Admin User Status & Login */}
          <div className="relative" ref={userMenuRef}>
            {isAdmin ? (
              <div>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  title="Perfil Administrador Master"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Admin</span>
                  <ChevronDown className="w-3 h-3 text-indigo-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                        AD
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 text-xs truncate">
                          {adminUser?.displayName || 'Administrador'}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {adminUser?.email || 'b.ritieller@gmail.com'}
                        </p>
                      </div>
                    </div>

                    <div className="py-2 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Acesso Total Master Ativo</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Edições, exclusões e regras administrativas desbloqueadas.
                      </p>
                    </div>

                    {onOpenLoginPage && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenLoginPage();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors cursor-pointer mt-1"
                      >
                        <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Página de Login / Trocar Perfil</span>
                      </button>
                    )}

                    <button
                      onClick={async () => {
                        await logout();
                        setUserMenuOpen(false);
                        if (onOpenLoginPage) onOpenLoginPage();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sair do Modo Admin</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenLoginPage ? onOpenLoginPage() : openLoginModal('Autentique-se como Administrador')}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold transition-all cursor-pointer"
                  title="Acessar Página de Login"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Página de Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="flex md:hidden items-center justify-around pt-2 mt-2 border-t border-slate-100 text-xs">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`py-1 px-2 font-bold cursor-pointer ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-500'}`}
        >
          Início
        </button>
        <button
          onClick={() => onTabChange('kanban')}
          className={`py-1 px-2 font-bold cursor-pointer flex items-center gap-1 ${activeTab === 'kanban' ? 'text-indigo-600' : 'text-slate-500'}`}
        >
          <Columns3 className="w-3.5 h-3.5" />
          <span>Quadro Kanban</span>
        </button>
        <button
          onClick={() => onTabChange('ordens')}
          className={`py-1 px-2 font-bold cursor-pointer ${activeTab === 'ordens' ? 'text-indigo-600' : 'text-slate-500'}`}
        >
          Todas OS
        </button>
      </div>
    </header>
  );
};
