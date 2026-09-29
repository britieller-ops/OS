export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  cpfCnpj: string;
  tipoPessoa: 'PF' | 'PJ';
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  observacoes?: string;
  createdAt: string;
}

export interface Tecnico {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  especialidades: string[];
  ativo: boolean;
  corIdentificacao: string;
  comissaoPercentual: number;
}

export interface PecaEstoque {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  quantidade: number;
  quantidadeMinima: number;
  precoCusto: number;
  precoVenda: number;
  unidade: string;
}

export interface ItemOS {
  id: string;
  tipo: 'SERVICO' | 'PECA';
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  pecaId?: string;
}

export type StatusOS =
  | 'ORCAMENTO'
  | 'APROVADA'
  | 'EM_ANALISE'
  | 'EM_ANDAMENTO'
  | 'AGUARDANDO_PECAS'
  | 'FINALIZADA'
  | 'ENTREGUE'
  | 'CANCELADA';

export type PrioridadeOS = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export interface Equipamento {
  tipo: string;
  marca: string;
  modelo: string;
  numeroSerie?: string;
  acessorios?: string;
  estadoConservacao?: string;
}

export interface OrdemServico {
  id: string;
  numeroOS: string;
  clienteId: string;
  tecnicoId?: string;
  status: StatusOS;
  prioridade: PrioridadeOS;
  equipamento: Equipamento;
  defeitoRelatado: string;
  diagnosticoTecnico?: string;
  solucaoAplicada?: string;
  itens: ItemOS[];
  valorServicos: number;
  valorPecas: number;
  desconto: number;
  valorTotal: number;
  formaPagamento?: 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'DINHEIRO' | 'BOLETO' | 'A_PRAZO' | 'TRANSFERENCIA';
  statusPagamento: 'PENDENTE' | 'PAGO' | 'PARCIAL';
  dataAbertura: string;
  dataPrevisao?: string;
  dataConclusao?: string;
  dataEntrega?: string;
  garantiaDias: number;
  historico?: Array<{
    id?: string;
    data: string;
    usuario: string;
    acao: string;
    observacao?: string;
  }>;
  termoGarantia?: string;
  cliente?: Cliente;
  tecnico?: Tecnico | null;
  horaRegistroHoje?: string;
}

export interface DashboardMetrics {
  totalOS: number;
  abertas: number;
  emAndamento?: number;
  orcamentos?: number;
  executando?: number;
  aguardandoPecas?: number;
  concluidas: number;
  faturamentoTotal?: number;
  faturamentoPendente?: number;
  faturamentoPrevisto?: number;
  totalFaturadoHistorico?: number;
  ticketMedio?: number;
  taxaSucesso?: number;
  estoqueBaixo?: number;
  totalPecas?: number;
  valorTotalEstoque?: number;
  caixaHoje?: {
    faturamentoHoje: number;
    ordensHojeCount: number;
    maoDeObraHoje: number;
    pecasHoje: number;
    ticketMedioHoje: number;
    variacaoOntemPercent: number;
    ordensFinalizadasHoje: OrdemServico[];
  };
  rankingStatus?: Array<{
    status: string;
    label: string;
    count: number;
    percent: number;
    color: string;
  }>;
  servicoLider?: {
    nome: string;
    execucoes: number;
    receitaTotal: number;
    precoMedio: number;
  };
  rankingServicos?: Array<{
    pos: number;
    nome: string;
    execucoes: number;
    receita: number;
  }>;
  volumeAcumuladoServicos?: number;
  produtoCampeao?: {
    nome: string;
    unidades: number;
    receitaTotal: number;
  };
  rankingProdutos?: Array<{
    pos: number;
    nome: string;
    unidades: number;
    precoMedio: number;
    participacao: number;
    receita: number;
    corBarra: string;
  }>;
  totalItensFaturados?: number;
  receitaPecasTotal?: number;
}

export interface AIDiagnosticoResult {
  provaveisCausas: string[];
  testesRecomendados: string[];
  possiveisPecas: string[];
  tempoEstimadoMinutos?: number;
  tempoEstimadoHoras?: number;
  nivelDificuldade?: 'FACIL' | 'MEDIO' | 'COMPLEXO' | 'ESPECIALISTA';
  complexidade?: string;
  orientacoesSeguranca?: string;
  laudoFormatado?: string;
  laudoSugerido?: string;
}

export type UserRole = 'ADMIN' | 'GERENTE' | 'TECNICO' | 'ATENDENTE';

export interface UsuarioSistema {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  ativo: boolean;
  telefone?: string;
  cargo?: string;
  ultimoAcesso?: string;
  permissoes: {
    gerenciarOS: boolean;
    gerenciarFinanceiro: boolean;
    gerenciarCadastros: boolean;
    gerenciarEstoque: boolean;
    gerenciarUsuarios: boolean;
  };
}
