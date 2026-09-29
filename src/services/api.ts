import type {
  OrdemServico,
  Cliente,
  Tecnico,
  PecaEstoque,
  DashboardMetrics,
  AIDiagnosticoResult,
  StatusOS
} from '../types/os.ts';

const BASE_URL = '/api';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    let errMsg = 'Erro na requisição';
    try {
      const err = await response.json();
      errMsg = err.error || err.message || errMsg;
    } catch {
      errMsg = response.statusText || errMsg;
    }
    throw new Error(errMsg);
  }

  return response.json();
}

export const api = {
  // Dashboard
  getDashboard: () => fetchJSON<DashboardMetrics>('/dashboard'),

  // Ordens de Serviço
  getOrdens: (filters?: {
    status?: string;
    prioridade?: string;
    tecnicoId?: string;
    clienteId?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.prioridade) params.append('prioridade', filters.prioridade);
    if (filters?.tecnicoId) params.append('tecnicoId', filters.tecnicoId);
    if (filters?.clienteId) params.append('clienteId', filters.clienteId);
    if (filters?.search) params.append('search', filters.search);
    const qs = params.toString();
    return fetchJSON<OrdemServico[]>(`/ordens-servico${qs ? `?${qs}` : ''}`);
  },

  getOrdemById: (id: string) => fetchJSON<OrdemServico>(`/ordens-servico/${id}`),

  createOrdem: (data: Partial<OrdemServico>) =>
    fetchJSON<OrdemServico>('/ordens-servico', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateOrdem: (id: string, data: Partial<OrdemServico>) =>
    fetchJSON<OrdemServico>(`/ordens-servico/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  updateOrdemStatus: (id: string, status: StatusOS, solucaoAplicada?: string) =>
    fetchJSON<OrdemServico>(`/ordens-servico/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, solucaoAplicada })
    }),

  deleteOrdem: (id: string) =>
    fetchJSON<{ success: boolean; message: string }>(`/ordens-servico/${id}`, {
      method: 'DELETE'
    }),

  requestAIDiagnostico: (dados: {
    equipamentoTipo: string;
    marca: string;
    modelo: string;
    defeitoRelatado: string;
  }) =>
    fetchJSON<AIDiagnosticoResult>('/ordens-servico/ai-diagnostico', {
      method: 'POST',
      body: JSON.stringify(dados)
    }),

  // Clientes
  getClientes: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetchJSON<Cliente[]>(`/clientes${qs}`);
  },

  getClienteById: (id: string) => fetchJSON<Cliente & { ordens: OrdemServico[] }>(`/clientes/${id}`),

  createCliente: (data: Omit<Cliente, 'id' | 'createdAt'>) =>
    fetchJSON<Cliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateCliente: (id: string, data: Partial<Cliente>) =>
    fetchJSON<Cliente>(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteCliente: (id: string) =>
    fetchJSON<{ success: boolean; message: string }>(`/clientes/${id}`, {
      method: 'DELETE'
    }),

  // Técnicos
  getTecnicos: () => fetchJSON<Tecnico[]>('/tecnicos'),

  getTecnicoById: (id: string) => fetchJSON<Tecnico & { ordens: OrdemServico[] }>(`/tecnicos/${id}`),

  createTecnico: (data: Omit<Tecnico, 'id'>) =>
    fetchJSON<Tecnico>('/tecnicos', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateTecnico: (id: string, data: Partial<Tecnico>) =>
    fetchJSON<Tecnico>(`/tecnicos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteTecnico: (id: string) =>
    fetchJSON<{ success: boolean; message: string }>(`/tecnicos/${id}`, {
      method: 'DELETE'
    }),

  // Estoque
  getEstoque: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetchJSON<PecaEstoque[]>(`/estoque${qs}`);
  },

  createPeca: (data: Omit<PecaEstoque, 'id'>) =>
    fetchJSON<PecaEstoque>('/estoque', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updatePeca: (id: string, data: Partial<PecaEstoque>) =>
    fetchJSON<PecaEstoque>(`/estoque/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  ajustarEstoque: (id: string, quantidadeDiferenca: number) =>
    fetchJSON<PecaEstoque>(`/estoque/${id}/ajuste`, {
      method: 'PATCH',
      body: JSON.stringify({ quantidadeDiferenca })
    }),

  deletePeca: (id: string) =>
    fetchJSON<{ success: boolean; message: string }>(`/estoque/${id}`, {
      method: 'DELETE'
    })
};
