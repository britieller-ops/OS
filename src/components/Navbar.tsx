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
  LogIn,
  Sun,
  Moon
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
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onNewOS,
  onRefresh,
  estoqueBaixoCount,
  onOpenLoginPage,
  isDarkMode = true,
  onToggleTheme
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
    <header className="sticky top-0 z-30 bg-[#0d1424] border-b border-slate-800/80 px-4 sm:px-6 py-2.5 no-print shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity (Acts as Página Inicial button) */}
        <button
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-3 text-left group cursor-pointer transition-transform active:scale-95"
          title="Ir para a Página Inicial"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-900/50 shrink-0 transition-colors">
            <Wrench className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                OS<span className="text-indigo-400">Master</span>
              </span>
              <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 group-hover:bg-indigo-500/30 transition-colors">
                PRO SAAS
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 hidden sm:block leading-none mt-0.5">
              Página Inicial • Gestão de Ordens de Serviço
            </p>
          </div>
        </button>

        {/* Center: Segmented Navigation Pills */}
        <div className="hidden md:flex items-center bg-[#080d19] p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <span>Início</span>
          </button>

          <button
            onClick={() => onTabChange('kanban')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'kanban'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Columns3 className="w-4 h-4 text-indigo-400" />
            <span>Quadro Kanban</span>
          </button>

          <button
            onClick={() => onTabChange('ordens')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ordens'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ListFilter className="w-4 h-4 text-slate-400" />
            <span>Todas as OS</span>
          </button>

          {/* Dedicated Cadastros Menu with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center">
              <button
                onClick={() => onTabChange('cadastros')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-xl text-xs font-semibold transition-all cursor-pointer ${
                  isCadastrosActive
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
                title="Acessar Central de Cadastros"
              >
                <FolderPlus className="w-4 h-4 text-indigo-400" />
                <span>Cadastros</span>
                {estoqueBaixoCount > 0 && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {estoqueBaixoCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCadastrosDropdownOpen(!cadastrosDropdownOpen)}
                className={`px-1.5 py-1.5 rounded-r-xl text-xs transition-all cursor-pointer border-l border-slate-800 ${
                  isCadastrosActive
                    ? 'bg-indigo-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
                title="Ver opções de cadastro"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dropdown Menu */}
            {cadastrosDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white">
                <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Menu de Cadastros
                </div>

                <button
                  onClick={() => {
                    onTabChange('clientes');
                    setCadastrosDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                    activeTab === 'clientes' ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30' : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">1. Clientes</p>
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
                    activeTab === 'estoque' ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30' : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">2. Produtos & Peças</p>
                      <p className="text-[10px] text-slate-400">Catálogo e Estoque</p>
                    </div>
                  </div>
                  {estoqueBaixoCount > 0 && (
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
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
                    activeTab === 'tecnicos' ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30' : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">3. Técnicos & Funcionários</p>
                      <p className="text-[10px] text-slate-400">Colaboradores e Comissões</p>
                    </div>
                  </div>
                </button>

                <div className="mt-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      onTabChange('cadastros');
                      setCadastrosDropdownOpen(false);
                    }}
                    className="w-full text-center py-1.5 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
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
            className="p-2 rounded-xl border border-slate-800 bg-[#0f172a] hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Theme Mode Toggle */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={isDarkMode ? "Alternar para tema claro" : "Alternar para tema escuro profissional"}
              className="p-2 rounded-xl border border-slate-800 bg-[#0f172a] hover:bg-slate-800 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
          )}

          {/* Admin User Status & Login */}
          <div className="relative" ref={userMenuRef}>
            {isAdmin ? (
              <div>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  title="Perfil Administrador Master"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">Admin</span>
                  <ChevronDown className="w-3 h-3 text-indigo-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-800">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                        AD
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-white text-xs truncate">
                          {adminUser?.displayName || 'Administrador'}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {adminUser?.email || 'b.ritieller@gmail.com'}
                        </p>
                      </div>
                    </div>

                    <div className="py-2 text-[11px] text-slate-300 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
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
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl transition-colors cursor-pointer mt-1"
                      >
                        <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Página de Login / Trocar Perfil</span>
                      </button>
                    )}

                    <button
                      onClick={async () => {
                        await logout();
                        setUserMenuOpen(false);
                        if (onOpenLoginPage) onOpenLoginPage();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer mt-1"
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
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold transition-all cursor-pointer"
                  title="Acessar Página de Login"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Página de Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="flex md:hidden items-center justify-around pt-2 mt-2 border-t border-slate-800 text-xs">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`py-1 px-2 font-bold cursor-pointer ${activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          Início
        </button>
        <button
          onClick={() => onTabChange('kanban')}
          className={`py-1 px-2 font-bold cursor-pointer flex items-center gap-1 ${activeTab === 'kanban' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <Columns3 className="w-3.5 h-3.5" />
          <span>Quadro Kanban</span>
        </button>
        <button
          onClick={() => onTabChange('ordens')}
          className={`py-1 px-2 font-bold cursor-pointer ${activeTab === 'ordens' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          Todas OS
        </button>
      </div>
    </header>
  );
};
