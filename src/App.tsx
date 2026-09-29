import React, { useState, useEffect } from 'react';
import { Navbar, type NavTab } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { KanbanView } from './components/KanbanView.tsx';
import { OSListView } from './components/OSListView.tsx';
import { ClientesView } from './components/ClientesView.tsx';
import { TecnicosView } from './components/TecnicosView.tsx';
import { EstoqueView } from './components/EstoqueView.tsx';
import { CadastrosView } from './components/CadastrosView.tsx';
import { OSModal } from './components/OSModal.tsx';
import { OSPrintModal } from './components/OSPrintModal.tsx';
import { AdminAuthProvider } from './context/AdminAuthContext.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { api } from './services/api.ts';
import type { 
  OrdemServico, 
  Cliente, 
  Tecnico, 
  PecaEstoque, 
  DashboardMetrics,
  StatusOS 
} from './types/os.ts';

function MainContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isLoginPage, setIsLoginPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('osmaster_dark_mode');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('osmaster_dark_mode', String(isDarkMode));
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  // Main State
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [estoque, setEstoque] = useState<PecaEstoque[]>([]);

  // Modals
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
  const [osModalOpen, setOsModalOpen] = useState(false);
  const [printOS, setPrintOS] = useState<OrdemServico | null>(null);

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      const [metricsData, ordensData, clientesData, tecnicosData, estoqueData] = await Promise.all([
        api.getDashboard(),
        api.getOrdens(),
        api.getClientes(),
        api.getTecnicos(),
        api.getEstoque()
      ]);
      setMetrics(metricsData);
      setOrdens(ordensData);
      setClientes(clientesData);
      setTecnicos(tecnicosData);
      setEstoque(estoqueData);
    } catch (err: any) {
      console.error('Falha ao carregar dados do OS Master:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for OS
  const handleOpenNewOS = () => {
    setSelectedOS(null);
    setOsModalOpen(true);
  };

  const handleSelectOS = (os: OrdemServico) => {
    setSelectedOS(os);
    setOsModalOpen(true);
  };

  const handleSaveOS = async (dados: Partial<OrdemServico>) => {
    if (selectedOS) {
      await api.updateOrdem(selectedOS.id, dados);
    } else {
      await api.createOrdem(dados);
    }
    await loadData();
  };

  const handleUpdateOSStatus = async (id: string, newStatus: StatusOS) => {
    // Atualização otimista imediata na interface para resposta instantânea
    setOrdens(prev =>
      prev.map(os => (os.id === id ? { ...os, status: newStatus } : os))
    );

    try {
      await api.updateOrdemStatus(id, newStatus);
      // Sincroniza métricas e dados em segundo plano sem travar a interface
      const [metricsData, ordensData] = await Promise.all([
        api.getDashboard(),
        api.getOrdens()
      ]);
      setMetrics(metricsData);
      setOrdens(ordensData);
    } catch (err: any) {
      console.error('Falha ao alterar status da OS:', err);
      alert(`Falha ao alterar status da OS: ${err.message || 'Erro de conexão'}`);
      await loadData();
    }
  };

  const handleDeleteOS = async (id: string) => {
    try {
      await api.deleteOrdem(id);
      await loadData();
    } catch (err: any) {
      alert(`Erro ao excluir OS: ${err.message}`);
    }
  };

  // Handlers for Clientes
  const handleSaveCliente = async (dados: Omit<Cliente, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      await api.updateCliente(id, dados);
    } else {
      await api.createCliente(dados);
    }
    await loadData();
  };

  const handleDeleteCliente = async (id: string) => {
    try {
      await api.deleteCliente(id);
      await loadData();
    } catch (err: any) {
      alert(`Erro ao excluir cliente: ${err.message}`);
    }
  };

  // Handlers for Técnicos
  const handleSaveTecnico = async (dados: Omit<Tecnico, 'id'>, id?: string) => {
    if (id) {
      await api.updateTecnico(id, dados);
    } else {
      await api.createTecnico(dados);
    }
    await loadData();
  };

  const handleDeleteTecnico = async (id: string) => {
    try {
      await api.deleteTecnico(id);
      await loadData();
    } catch (err: any) {
      alert(`Erro ao remover técnico: ${err.message}`);
    }
  };

  // Handlers for Estoque
  const handleSavePeca = async (dados: Omit<PecaEstoque, 'id'>, id?: string) => {
    if (id) {
      await api.updatePeca(id, dados);
    } else {
      await api.createPeca(dados);
    }
    await loadData();
  };

  const handleAjustarEstoque = async (id: string, diff: number) => {
    try {
      await api.ajustarEstoque(id, diff);
      await loadData();
    } catch (err: any) {
      alert(`Erro ao ajustar estoque: ${err.message}`);
    }
  };

  const handleDeletePeca = async (id: string) => {
    try {
      await api.deletePeca(id);
      await loadData();
    } catch (err: any) {
      alert(`Erro ao remover peça: ${err.message}`);
    }
  };

  if (isLoginPage) {
    return (
      <LoginPage
        tecnicos={tecnicos}
        onLoginSuccess={() => {
          setIsLoginPage(false);
          loadData();
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-[#f8fafc] text-slate-900'} flex flex-col antialiased transition-colors duration-200`}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewOS={handleOpenNewOS}
        onRefresh={loadData}
        estoqueBaixoCount={metrics?.estoqueBaixo || 3}
        onOpenLoginPage={() => setIsLoginPage(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(prev => !prev)}
      />

      {/* Main Content Area */}
      <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${printOS ? 'no-print' : ''}`}>
        {loading && !metrics ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-500">Carregando painel OS Master...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="max-w-7xl mx-auto">
                <DashboardView
                  metrics={metrics}
                  ordens={ordens}
                  clientes={clientes}
                  tecnicos={tecnicos}
                  onSelectOS={handleSelectOS}
                  onNewOS={handleOpenNewOS}
                  onNavigateToKanban={() => setActiveTab('kanban')}
                  onNavigateToEstoque={() => setActiveTab('estoque')}
                  onNavigateToOrdens={() => setActiveTab('ordens')}
                  onNavigateToClientes={() => setActiveTab('clientes')}
                  onNavigateToTecnicos={() => setActiveTab('tecnicos')}
                  onPrintOS={(os) => setPrintOS(os)}
                />
              </div>
            )}

            {activeTab === 'ordens' && (
              <div className="max-w-7xl mx-auto">
                <OSListView
                  ordens={ordens}
                  tecnicos={tecnicos}
                  onSelectOS={handleSelectOS}
                  onPrintOS={(os) => setPrintOS(os)}
                  onDeleteOS={handleDeleteOS}
                  onNewOS={handleOpenNewOS}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            )}

            {activeTab === 'kanban' && (
              <div className="max-w-7xl mx-auto">
                <KanbanView
                  ordens={ordens}
                  onSelectOS={handleSelectOS}
                  onUpdateStatus={handleUpdateOSStatus}
                  onPrintOS={(os) => setPrintOS(os)}
                  onNewOS={handleOpenNewOS}
                />
              </div>
            )}

            {['cadastros', 'clientes', 'estoque', 'tecnicos'].includes(activeTab) && (
              <div className="max-w-7xl mx-auto">
                <CadastrosView
                  initialSubTab={
                    activeTab === 'estoque'
                      ? 'produtos'
                      : activeTab === 'tecnicos'
                      ? 'tecnicos'
                      : 'clientes'
                  }
                  clientes={clientes}
                  tecnicos={tecnicos}
                  estoque={estoque}
                  ordens={ordens}
                  onSaveCliente={handleSaveCliente}
                  onDeleteCliente={handleDeleteCliente}
                  onSaveTecnico={handleSaveTecnico}
                  onDeleteTecnico={handleDeleteTecnico}
                  onSavePeca={handleSavePeca}
                  onAjustarEstoque={handleAjustarEstoque}
                  onDeletePeca={handleDeletePeca}
                  onSelectOS={handleSelectOS}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* OS Creation & Editing Modal */}
      {osModalOpen && (
        <OSModal
          os={selectedOS}
          clientes={clientes}
          tecnicos={tecnicos}
          estoque={estoque}
          onClose={() => setOsModalOpen(false)}
          onSave={handleSaveOS}
          onPrint={(os) => {
            setOsModalOpen(false);
            setPrintOS(os);
          }}
        />
      )}

      {/* Printable Service Order Slip Modal */}
      {printOS && (
        <OSPrintModal
          os={printOS}
          onClose={() => setPrintOS(null)}
        />
      )}

      {/* Admin Authentication Modal */}
      <AdminLoginModal />
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <MainContent />
    </AdminAuthProvider>
  );
}

