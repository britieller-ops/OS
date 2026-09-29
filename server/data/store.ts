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
  formaPagamento?: 'PIX' | 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'BOLETO' | 'TRANSFERENCIA';
  statusPagamento: 'PENDENTE' | 'PAGO' | 'PARCIAL';
  dataAbertura: string;
  dataPrevisao?: string;
  dataConclusao?: string;
  dataEntrega?: string;
  garantiaDias: number;
  termoGarantia?: string;
  historico?: {
    data: string;
    usuario: string;
    acao: string;
    observacao?: string;
  }[];
  cliente?: Cliente;
  tecnico?: Tecnico | null;
  horaRegistroHoje?: string;
}

export interface DashboardMetrics {
  totalOS: number;
  abertas: number;
  emAndamento: number;
  orcamentos: number;
  executando: number;
  aguardandoPecas: number;
  concluidas: number;
  faturamentoTotal: number;
  faturamentoPendente: number;
  faturamentoPrevisto?: number;
  ticketMedio: number;
  taxaSucesso: number;
  estoqueBaixo: number;
  totalPecas: number;
  valorTotalEstoque: number;
  // Métricas de Caixa de Hoje
  caixaHoje: {
    faturamentoHoje: number;
    ordensHojeCount: number;
    maoDeObraHoje: number;
    pecasHoje: number;
    ticketMedioHoje: number;
    variacaoOntemPercent: number;
    ordensFinalizadasHoje: OrdemServico[];
  };
  rankingStatus: {
    status: string;
    label: string;
    count: number;
    percent: number;
    color: string;
  }[];
  servicoLider: {
    nome: string;
    execucoes: number;
    receitaTotal: number;
    precoMedio: number;
  };
  rankingServicos: {
    pos: number;
    nome: string;
    execucoes: number;
    receita: number;
  }[];
  volumeAcumuladoServicos: number;
  produtoCampeao: {
    nome: string;
    unidades: number;
    receitaTotal: number;
  };
  rankingProdutos: {
    pos: number;
    nome: string;
    unidades: number;
    precoMedio: number;
    participacao: number;
    receita: number;
    corBarra: string;
  }[];
  totalItensFaturados: number;
  receitaPecasTotal: number;
}

class InMemoryStore {
  private clientes: Cliente[] = [
    {
      id: 'cli-1',
      nome: 'Mariana Duarte Silveira',
      email: 'mariana.silveira@gmail.com',
      telefone: '(11) 98765-4321',
      whatsapp: '5511987654321',
      cpfCnpj: '321.654.987-00',
      tipoPessoa: 'PF',
      cep: '04538-132',
      logradouro: 'Rua Joaquim Floriano',
      numero: '100',
      bairro: 'Itaim Bibi',
      cidade: 'São Paulo',
      uf: 'SP',
      createdAt: '2026-09-20T10:00:00.000Z'
    },
    {
      id: 'cli-2',
      nome: 'Carlos Eduardo Mendes',
      email: 'carlos.mendes@empresa.com.br',
      telefone: '(11) 97123-8899',
      whatsapp: '5511971238899',
      cpfCnpj: '123.456.789-01',
      tipoPessoa: 'PF',
      cep: '01310-100',
      logradouro: 'Avenida Paulista',
      numero: '1578',
      complemento: 'Apto 82',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      uf: 'SP',
      createdAt: '2026-09-21T14:30:00.000Z'
    },
    {
      id: 'cli-3',
      nome: 'Clínica OdontoSmile Ltda',
      email: 'financeiro@odontosmile.com.br',
      telefone: '(11) 3288-9900',
      whatsapp: '5511999887766',
      cpfCnpj: '12.345.678/0001-90',
      tipoPessoa: 'PJ',
      cep: '04005-002',
      logradouro: 'Rua Vergueiro',
      numero: '2040',
      complemento: 'Conjunto 61',
      bairro: 'Vila Mariana',
      cidade: 'São Paulo',
      uf: 'SP',
      createdAt: '2026-09-22T09:15:00.000Z'
    },
    {
      id: 'cli-4',
      nome: 'Rafael Costa Albuquerque',
      email: 'rafael.costa@tech.dev',
      telefone: '(21) 98877-6655',
      whatsapp: '5521988776655',
      cpfCnpj: '456.789.012-34',
      tipoPessoa: 'PF',
      cep: '22041-010',
      logradouro: 'Rua Barata Ribeiro',
      numero: '502',
      bairro: 'Copacabana',
      cidade: 'Rio de Janeiro',
      uf: 'RJ',
      createdAt: '2026-09-23T11:45:00.000Z'
    },
    {
      id: 'cli-5',
      nome: 'Pedro Henrique Santos',
      email: 'pedro.santos@gmail.com',
      telefone: '(19) 99112-2334',
      whatsapp: '5519991122334',
      cpfCnpj: '789.012.345-67',
      tipoPessoa: 'PF',
      cep: '13010-001',
      logradouro: 'Rua Barão de Jaguara',
      numero: '890',
      bairro: 'Centro',
      cidade: 'Campinas',
      uf: 'SP',
      createdAt: '2026-09-24T16:20:00.000Z'
    }
  ];

  private tecnicos: Tecnico[] = [
    {
      id: 'tec-admin',
      nome: 'Administrador (b.ritieller)',
      email: 'b.ritieller@gmail.com',
      telefone: '(11) 99999-0000',
      especialidades: ['Administração Geral', 'Gestão & Homologação', 'Supervisão Técnica'],
      ativo: true,
      corIdentificacao: '#6366F1',
      comissaoPercentual: 0
    },
    {
      id: 'tec-1',
      nome: 'Rodrigo',
      email: 'rodrigo.tech@osmaster.com',
      telefone: '(11) 98111-2233',
      especialidades: ['Smartphones & iPhones', 'Soldagem BGA', 'Telas & Baterias'],
      ativo: true,
      corIdentificacao: '#3B82F6',
      comissaoPercentual: 15
    },
    {
      id: 'tec-2',
      nome: 'Juliana',
      email: 'juliana.apple@osmaster.com',
      telefone: '(11) 97222-3344',
      especialidades: ['MacBooks & iMacs', 'Desoxidação Ultrassônica', 'Placas-Mãe Apple'],
      ativo: true,
      corIdentificacao: '#8B5CF6',
      comissaoPercentual: 18
    },
    {
      id: 'tec-3',
      nome: 'Lucas',
      email: 'lucas.servers@osmaster.com',
      telefone: '(11) 99333-4455',
      especialidades: ['Servidores & Workstations', 'RAID & Failover', 'Hardware Gamer'],
      ativo: true,
      corIdentificacao: '#F59E0B',
      comissaoPercentual: 12
    },
    {
      id: 'tec-4',
      nome: 'Marcos',
      email: 'marcos.t4@osmaster.com',
      telefone: '(11) 96444-5566',
      especialidades: ['Notebooks Corporativos', 'Lenovo ThinkPad / Dell Latitude', 'iPads'],
      ativo: true,
      corIdentificacao: '#10B981',
      comissaoPercentual: 14
    }
  ];

  private estoque: PecaEstoque[] = [
    {
      id: 'pec-1',
      codigo: 'SSD-NVME-1TB-KNG',
      nome: 'SSD Enterprise NVMe 1TB Kingston Server Grade',
      categoria: 'Armazenamento & Servidores',
      quantidade: 8,
      quantidadeMinima: 3,
      precoCusto: 260.0,
      precoVenda: 420.0,
      unidade: 'UN'
    },
    {
      id: 'pec-2',
      codigo: 'DISP-IP14PM-ORIG',
      nome: 'Módulo Display Super Retina XDR OLED Original',
      categoria: 'Telas & Displays',
      quantidade: 2,
      quantidadeMinima: 2,
      precoCusto: 850.0,
      precoVenda: 1250.0,
      unidade: 'UN'
    },
    {
      id: 'pec-3',
      codigo: 'BAT-LEN-TP-50WH',
      nome: 'Bateria Original Lenovo ThinkPad 50Wh',
      categoria: 'Baterias',
      quantidade: 4,
      quantidadeMinima: 2,
      precoCusto: 180.0,
      precoVenda: 320.0,
      unidade: 'UN'
    },
    {
      id: 'pec-4',
      codigo: 'BAT-SAM-5000',
      nome: 'Bateria Original Samsung 5000mAh',
      categoria: 'Baterias',
      quantidade: 6,
      quantidadeMinima: 3,
      precoCusto: 130.0,
      precoVenda: 280.0,
      unidade: 'UN'
    },
    {
      id: 'pec-5',
      codigo: 'CON-USBC-IPAD11',
      nome: 'Conector de Carga USB-C Dock Original iPad Pro 11',
      categoria: 'Conectores & Portas',
      quantidade: 5,
      quantidadeMinima: 2,
      precoCusto: 90.0,
      precoVenda: 240.0,
      unidade: 'UN'
    },
    {
      id: 'pec-6',
      codigo: 'PASTA-ARCTIC-MX4',
      nome: 'Pasta Térmica Arctic MX-4 4g',
      categoria: 'Insumos Térmicos',
      quantidade: 15,
      quantidadeMinima: 5,
      precoCusto: 25.0,
      precoVenda: 65.0,
      unidade: 'TB'
    },
    {
      id: 'pec-7',
      codigo: 'RAM-DDR4-16GB',
      nome: 'Memória RAM Kingston Fury 16GB DDR4 3200MHz',
      categoria: 'Memória RAM',
      quantidade: 6,
      quantidadeMinima: 2,
      precoCusto: 160.0,
      precoVenda: 290.0,
      unidade: 'UN'
    },
    {
      id: 'pec-8',
      codigo: 'FONT-CORSAIR-750W',
      nome: 'Fonte Corsair RM750x 750W 80 Plus Gold',
      categoria: 'Fontes',
      quantidade: 3,
      quantidadeMinima: 1,
      precoCusto: 480.0,
      precoVenda: 750.0,
      unidade: 'UN'
    },
    {
      id: 'pec-9',
      codigo: 'TEC-TP-T14-ABNT',
      nome: 'Teclado Original ThinkPad T14 ABNT2',
      categoria: 'Teclados',
      quantidade: 2,
      quantidadeMinima: 1,
      precoCusto: 190.0,
      precoVenda: 380.0,
      unidade: 'UN'
    },
    {
      id: 'pec-10',
      codigo: 'FLEX-LIGHTNING-14P',
      nome: 'Flex Cabo de Carga Lightning iPhone 14 Pro',
      categoria: 'Cabos & Conectores',
      quantidade: 4,
      quantidadeMinima: 2,
      precoCusto: 45.0,
      precoVenda: 120.0,
      unidade: 'UN'
    },
    {
      id: 'pec-11',
      codigo: 'FAN-CM-120MM',
      nome: 'Ventilador Cooler FAN Cooler Master 120mm',
      categoria: 'Refrigeração',
      quantidade: 10,
      quantidadeMinima: 4,
      precoCusto: 35.0,
      precoVenda: 85.0,
      unidade: 'UN'
    },
    {
      id: 'pec-12',
      codigo: 'CABO-FLAT-GEN',
      nome: 'Cabo Flat LCD 40 vias Universal',
      categoria: 'Cabos & Conectores',
      quantidade: 2,
      quantidadeMinima: 3,
      precoCusto: 35.0,
      precoVenda: 95.0,
      unidade: 'UN'
    }
  ];

  private ordens: OrdemServico[] = [
    {
      id: 'os-1',
      numeroOS: 'OS-2026-001',
      clienteId: 'cli-5',
      tecnicoId: 'tec-1',
      status: 'FINALIZADA',
      prioridade: 'MEDIA',
      equipamento: {
        tipo: 'Desktop',
        marca: 'Dell',
        modelo: 'OptiPlex 7090 Tower Core i7',
        numeroSerie: 'DEL7090T-4481'
      },
      defeitoRelatado: 'Aquecimento excessivo e ventoinhas em velocidade máxima contínua.',
      diagnosticoTecnico: 'Pasta térmica ressecada e obstrução de poeira nas aletas do dissipador.',
      itens: [
        {
          id: 'item-1-1',
          tipo: 'SERVICO',
          descricao: 'Limpeza interna completa e repastagem térmica',
          quantidade: 1,
          valorUnitario: 200.0,
          subtotal: 200.0
        },
        {
          id: 'item-1-2',
          tipo: 'PECA',
          descricao: 'Pasta Térmica Arctic MX-4 4g',
          quantidade: 1,
          valorUnitario: 65.0,
          subtotal: 65.0
        }
      ],
      valorServicos: 200.0,
      valorPecas: 65.0,
      desconto: 0,
      valorTotal: 265.0,
      formaPagamento: 'PIX',
      statusPagamento: 'PAGO',
      dataAbertura: '2026-09-25T09:00:00.000Z',
      dataConclusao: '2026-09-25T16:00:00.000Z',
      garantiaDias: 90
    },
    {
      id: 'os-2',
      numeroOS: 'OS-2026-002',
      clienteId: 'cli-1',
      tecnicoId: 'tec-1',
      status: 'EM_ANDAMENTO',
      prioridade: 'ALTA',
      equipamento: {
        tipo: 'Smartphone',
        marca: 'Apple',
        modelo: 'iPhone 14 Pro Max 256GB (Apple A2894 Space Black)',
        numeroSerie: 'DX98LL0012'
      },
      defeitoRelatado: 'Queda quebrou o vidro frontal e não responde ao toque em certas áreas.',
      diagnosticoTecnico: 'Troca de módulo display OLED e flex True Tone.',
      itens: [
        {
          id: 'item-2-1',
          tipo: 'PECA',
          descricao: 'Módulo Display Super Retina XDR OLED Original',
          quantidade: 1,
          valorUnitario: 1250.0,
          subtotal: 1250.0
        },
        {
          id: 'item-2-2',
          tipo: 'SERVICO',
          descricao: 'Mão de obra de substituição de tela e calibração',
          quantidade: 1,
          valorUnitario: 250.0,
          subtotal: 250.0
        }
      ],
      valorServicos: 250.0,
      valorPecas: 1250.0,
      desconto: 0,
      valorTotal: 1500.0,
      formaPagamento: 'CARTAO_CREDITO',
      statusPagamento: 'PENDENTE',
      dataAbertura: '2026-09-28T14:00:00.000Z',
      garantiaDias: 90
    },
    {
      id: 'os-3',
      numeroOS: 'OS-2026-003',
      clienteId: 'cli-2',
      tecnicoId: 'tec-2',
      status: 'AGUARDANDO_PECAS',
      prioridade: 'URGENTE',
      equipamento: {
        tipo: 'Notebook',
        marca: 'Apple',
        modelo: 'MacBook Pro M1 13" 2020 (Apple A2338 Space Gray)',
        numeroSerie: 'C02FG190Q05D'
      },
      defeitoRelatado: 'Derrubou café no teclado. Não liga e luz do carregador apaga.',
      diagnosticoTecnico: 'Curto na linha primária PPBUS_G3H e oxidação de capacitores.',
      itens: [
        {
          id: 'item-3-1',
          tipo: 'SERVICO',
          descricao: 'Desoxidação química em cuba ultrassônica',
          quantidade: 1,
          valorUnitario: 350.0,
          subtotal: 350.0
        },
        {
          id: 'item-3-2',
          tipo: 'SERVICO',
          descricao: 'Micro-soldagem BGA e reconstrução de trilhas',
          quantidade: 1,
          valorUnitario: 450.0,
          subtotal: 450.0
        },
        {
          id: 'item-3-3',
          tipo: 'SERVICO',
          descricao: 'Limpeza interna completa e repastagem térmica',
          quantidade: 1,
          valorUnitario: 100.0,
          subtotal: 100.0
        }
      ],
      valorServicos: 900.0,
      valorPecas: 0,
      desconto: 0,
      valorTotal: 900.0,
      formaPagamento: 'PIX',
      statusPagamento: 'PENDENTE',
      dataAbertura: '2026-09-27T10:30:00.000Z',
      garantiaDias: 90
    },
    {
      id: 'os-4',
      numeroOS: 'OS-2026-004',
      clienteId: 'cli-3',
      tecnicoId: 'tec-3',
      status: 'ORCAMENTO',
      prioridade: 'ALTA',
      equipamento: {
        tipo: 'Servidor',
        marca: 'Custom Workstation',
        modelo: 'Servidor Desktop Xeon E5 (Custom Gamer/Server Workstation Dual Xeon E5-2680 v4 64GB ECC)',
        numeroSerie: 'SRV-ODONTO-2024'
      },
      defeitoRelatado: 'Lentidão severa no sistema de prontuários e alertas de setores defeituosos no disco.',
      diagnosticoTecnico: 'Falha iminente na controladora e discos. Necessário migração para RAID de NVMe.',
      itens: [
        {
          id: 'item-4-1',
          tipo: 'PECA',
          descricao: 'SSD Enterprise NVMe 1TB Kingston Server Grade',
          quantidade: 2,
          valorUnitario: 420.0,
          subtotal: 840.0
        },
        {
          id: 'item-4-2',
          tipo: 'SERVICO',
          descricao: 'Clonagem de imagem e rebuild de arranjo com failover',
          quantidade: 1,
          valorUnitario: 300.0,
          subtotal: 300.0
        },
        {
          id: 'item-4-3',
          tipo: 'SERVICO',
          descricao: 'Limpeza interna completa e repastagem térmica',
          quantidade: 1,
          valorUnitario: 180.0,
          subtotal: 180.0
        }
      ],
      valorServicos: 480.0,
      valorPecas: 840.0,
      desconto: 0,
      valorTotal: 1320.0,
      formaPagamento: 'BOLETO',
      statusPagamento: 'PENDENTE',
      dataAbertura: '2026-09-29T08:00:00.000Z',
      horaRegistroHoje: '10:45',
      garantiaDias: 180
    },
    {
      id: 'os-5',
      numeroOS: 'OS-2026-005',
      clienteId: 'cli-4',
      tecnicoId: 'tec-4',
      status: 'FINALIZADA',
      prioridade: 'MEDIA',
      equipamento: {
        tipo: 'Tablet',
        marca: 'Apple',
        modelo: 'iPad Pro 11 polegadas M2 (Apple iPad Pro 4ª Geração Wi-Fi 128GB)',
        numeroSerie: 'DMPZK829Q16M'
      },
      defeitoRelatado: 'Não segura carga pelo cabo USB-C e porta com mau contato.',
      diagnosticoTecnico: 'Conector dock desgastado. Substituição do sub-dock completa.',
      itens: [
        {
          id: 'item-5-1',
          tipo: 'PECA',
          descricao: 'Conector de Carga USB-C Dock Original iPad Pro 11',
          quantidade: 1,
          valorUnitario: 240.0,
          subtotal: 240.0
        },
        {
          id: 'item-5-2',
          tipo: 'SERVICO',
          descricao: 'Mão de obra de substituição de conector',
          quantidade: 1,
          valorUnitario: 230.0,
          subtotal: 230.0
        }
      ],
      valorServicos: 230.0,
      valorPecas: 240.0,
      desconto: 0,
      valorTotal: 470.0,
      formaPagamento: 'PIX',
      statusPagamento: 'PAGO',
      dataAbertura: '2026-09-27T11:00:00.000Z',
      dataConclusao: '2026-09-29T11:30:00.000Z',
      horaRegistroHoje: '11:30',
      garantiaDias: 90
    },
    {
      id: 'os-6',
      numeroOS: 'OS-2026-006',
      clienteId: 'cli-1',
      tecnicoId: 'tec-4',
      status: 'FINALIZADA',
      prioridade: 'MEDIA',
      equipamento: {
        tipo: 'Notebook',
        marca: 'Lenovo',
        modelo: 'Notebook Lenovo ThinkPad T14 (Lenovo ThinkPad T14 Gen 2 Core i5)',
        numeroSerie: 'PF2K8841-LNV'
      },
      defeitoRelatado: 'Bateria esgota em 15 minutos e ventoinha faz barulho de rolamento.',
      diagnosticoTecnico: 'Desgaste químico da célula de bateria e cooler obstruído.',
      itens: [
        {
          id: 'item-6-1',
          tipo: 'PECA',
          descricao: 'Bateria Original Lenovo ThinkPad 50Wh',
          quantidade: 1,
          valorUnitario: 320.0,
          subtotal: 320.0
        },
        {
          id: 'item-6-2',
          tipo: 'PECA',
          descricao: 'SSD Enterprise NVMe 1TB Kingston Server Grade',
          quantidade: 1,
          valorUnitario: 420.0,
          subtotal: 420.0
        },
        {
          id: 'item-6-3',
          tipo: 'SERVICO',
          descricao: 'Limpeza interna completa e repastagem térmica',
          quantidade: 1,
          valorUnitario: 140.0,
          subtotal: 140.0
        },
        {
          id: 'item-6-4',
          tipo: 'SERVICO',
          descricao: 'Mão de obra e calibração de bateria',
          quantidade: 1,
          valorUnitario: 190.0,
          subtotal: 190.0
        }
      ],
      valorServicos: 330.0,
      valorPecas: 740.0,
      desconto: 0,
      valorTotal: 1070.0,
      formaPagamento: 'CARTAO_CREDITO',
      statusPagamento: 'PAGO',
      dataAbertura: '2026-09-26T15:00:00.000Z',
      dataConclusao: '2026-09-29T14:15:00.000Z',
      horaRegistroHoje: '14:15',
      garantiaDias: 90
    },
    {
      id: 'os-7',
      numeroOS: 'OS-2026-007',
      clienteId: 'cli-5',
      tecnicoId: 'tec-1',
      status: 'EM_ANDAMENTO',
      prioridade: 'MEDIA',
      equipamento: {
        tipo: 'Smartphone',
        marca: 'Samsung',
        modelo: 'Galaxy S22 Ultra 5G 256GB',
        numeroSerie: 'SM-S908E-0099'
      },
      defeitoRelatado: 'Bateria descarregando com menos de 3 horas de uso e tampa traseira ligeiramente estufada.',
      diagnosticoTecnico: 'Troca de bateria original 5000mAh e adesivo de vedação IP68.',
      itens: [
        {
          id: 'item-7-1',
          tipo: 'PECA',
          descricao: 'Bateria Original Samsung 5000mAh',
          quantidade: 1,
          valorUnitario: 280.0,
          subtotal: 280.0
        },
        {
          id: 'item-7-2',
          tipo: 'SERVICO',
          descricao: 'Mão de obra e testes de ciclagem',
          quantidade: 1,
          valorUnitario: 180.0,
          subtotal: 180.0
        }
      ],
      valorServicos: 180.0,
      valorPecas: 280.0,
      desconto: 0,
      valorTotal: 460.0,
      formaPagamento: 'PIX',
      statusPagamento: 'PENDENTE',
      dataAbertura: '2026-09-28T16:00:00.000Z',
      garantiaDias: 90
    }
  ];

  // Métodos Clientes
  getClientes(search?: string): Cliente[] {
    if (!search) return [...this.clientes];
    const q = search.toLowerCase();
    return this.clientes.filter(
      c => c.nome.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.telefone.includes(q) || c.cpfCnpj.includes(q)
    );
  }

  getClienteById(id: string): Cliente | undefined {
    return this.clientes.find(c => c.id === id);
  }

  createCliente(data: Omit<Cliente, 'id' | 'createdAt'>): Cliente {
    const novo: Cliente = {
      ...data,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.clientes.unshift(novo);
    return novo;
  }

  updateCliente(id: string, data: Partial<Cliente>): Cliente | null {
    const idx = this.clientes.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.clientes[idx] = { ...this.clientes[idx], ...data };
    return this.clientes[idx];
  }

  deleteCliente(id: string): boolean {
    const idx = this.clientes.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.clientes.splice(idx, 1);
    return true;
  }

  // Métodos Técnicos
  getTecnicos(): Tecnico[] {
    return [...this.tecnicos];
  }

  getTecnicoById(id: string): Tecnico | undefined {
    return this.tecnicos.find(t => t.id === id);
  }

  createTecnico(data: Omit<Tecnico, 'id'>): Tecnico {
    const novo: Tecnico = {
      ...data,
      id: `tec-${Date.now()}`
    };
    this.tecnicos.push(novo);
    return novo;
  }

  updateTecnico(id: string, data: Partial<Tecnico>): Tecnico | null {
    const idx = this.tecnicos.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.tecnicos[idx] = { ...this.tecnicos[idx], ...data };
    return this.tecnicos[idx];
  }

  deleteTecnico(id: string): boolean {
    const idx = this.tecnicos.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.tecnicos.splice(idx, 1);
    return true;
  }

  // Métodos Estoque
  getEstoque(filters?: { search?: string; categoria?: string } | string): PecaEstoque[] {
    let list = [...this.estoque];
    if (typeof filters === 'string') {
      const q = filters.toLowerCase();
      return list.filter(p => p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
    }
    if (filters?.categoria && filters.categoria !== 'TODAS') {
      list = list.filter(p => p.categoria === filters.categoria);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
    }
    return list;
  }

  getPecaById(id: string): PecaEstoque | undefined {
    return this.estoque.find(p => p.id === id);
  }

  createPeca(data: Omit<PecaEstoque, 'id'>): PecaEstoque {
    const nova: PecaEstoque = {
      ...data,
      id: `pec-${Date.now()}`
    };
    this.estoque.push(nova);
    return nova;
  }

  updatePeca(id: string, data: Partial<PecaEstoque>): PecaEstoque | null {
    const idx = this.estoque.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.estoque[idx] = { ...this.estoque[idx], ...data };
    return this.estoque[idx];
  }

  ajustarEstoque(id: string, diff: number): PecaEstoque | null {
    const idx = this.estoque.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.estoque[idx].quantidade = Math.max(0, this.estoque[idx].quantidade + diff);
    return this.estoque[idx];
  }

  deletePeca(id: string): boolean {
    const idx = this.estoque.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.estoque.splice(idx, 1);
    return true;
  }

  // Métodos Ordens de Serviço
  getOrdens(filters?: {
    status?: string;
    prioridade?: string;
    tecnicoId?: string;
    clienteId?: string;
    search?: string;
  }): OrdemServico[] {
    let list = [...this.ordens];

    if (filters?.status) {
      list = list.filter(o => o.status === filters.status);
    }
    if (filters?.prioridade) {
      list = list.filter(o => o.prioridade === filters.prioridade);
    }
    if (filters?.tecnicoId) {
      list = list.filter(o => o.tecnicoId === filters.tecnicoId);
    }
    if (filters?.clienteId) {
      list = list.filter(o => o.clienteId === filters.clienteId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(o => {
        const num = o.numeroOS.toLowerCase();
        const def = o.defeitoRelatado.toLowerCase();
        const equip = `${o.equipamento.tipo} ${o.equipamento.marca} ${o.equipamento.modelo}`.toLowerCase();
        return num.includes(q) || def.includes(q) || equip.includes(q);
      });
    }

    return list;
  }

  getOrdemById(id: string): OrdemServico | undefined {
    return this.ordens.find(o => o.id === id);
  }

  createOrdem(data: Partial<OrdemServico>): OrdemServico {
    const count = this.ordens.length + 1;
    const padCount = String(count).padStart(3, '0');
    const numeroOS = `OS-2026-${padCount}`;

    const nova: OrdemServico = {
      id: `os-${Date.now()}`,
      numeroOS,
      clienteId: data.clienteId || this.clientes[0].id,
      tecnicoId: data.tecnicoId,
      status: data.status || 'ORCAMENTO',
      prioridade: data.prioridade || 'MEDIA',
      equipamento: data.equipamento || { tipo: 'Equipamento', marca: '', modelo: '' },
      defeitoRelatado: data.defeitoRelatado || '',
      diagnosticoTecnico: data.diagnosticoTecnico,
      solucaoAplicada: data.solucaoAplicada,
      itens: data.itens || [],
      valorServicos: data.valorServicos || 0,
      valorPecas: data.valorPecas || 0,
      desconto: data.desconto || 0,
      valorTotal: data.valorTotal || 0,
      formaPagamento: data.formaPagamento,
      statusPagamento: data.statusPagamento || 'PENDENTE',
      dataAbertura: data.dataAbertura || new Date().toISOString(),
      dataPrevisao: data.dataPrevisao,
      garantiaDias: data.garantiaDias ?? 90,
      termoGarantia: data.termoGarantia,
      historico: [
        {
          data: new Date().toISOString(),
          usuario: 'Sistema',
          acao: 'Abertura de Ordem de Serviço'
        }
      ]
    };

    this.ordens.unshift(nova);
    return nova;
  }

  updateOrdem(id: string, data: Partial<OrdemServico>): OrdemServico | null {
    const idx = this.ordens.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.ordens[idx] = {
      ...this.ordens[idx],
      ...data
    };
    return this.ordens[idx];
  }

  deleteOrdem(id: string): boolean {
    const idx = this.ordens.findIndex(o => o.id === id);
    if (idx === -1) return false;
    this.ordens.splice(idx, 1);
    return true;
  }

  // Métricas do Dashboard
  getDashboardMetrics(): DashboardMetrics {
    const totalOS = this.ordens.length;
    const orcamentos = this.ordens.filter(o => o.status === 'ORCAMENTO').length;
    const emAndamento = this.ordens.filter(o => o.status === 'EM_ANDAMENTO').length;
    const aguardandoPecas = this.ordens.filter(o => o.status === 'AGUARDANDO_PECAS').length;
    const concluidas = this.ordens.filter(o => o.status === 'FINALIZADA' || o.status === 'ENTREGUE').length;
    const abertas = orcamentos + emAndamento + aguardandoPecas;

    const faturamentoTotal = this.ordens
      .filter(o => o.status === 'FINALIZADA' || o.status === 'ENTREGUE')
      .reduce((acc, o) => acc + (o.valorTotal || 0), 0);
    const faturamentoPendente = this.ordens
      .filter(o => o.statusPagamento === 'PENDENTE')
      .reduce((acc, o) => acc + (o.valorTotal || 0), 0);
    const faturamentoPrevisto = this.ordens
      .filter(o => o.status !== 'FINALIZADA' && o.status !== 'ENTREGUE' && o.status !== 'CANCELADA')
      .reduce((acc, o) => acc + (o.valorTotal || 0), 0);

    const ticketMedio = concluidas > 0 ? faturamentoTotal / concluidas : 0;
    const taxaSucesso = totalOS > 0 ? Number(((concluidas / totalOS) * 100).toFixed(1)) : 42.9;

    const estoqueBaixo = this.estoque.filter(p => p.quantidade <= p.quantidadeMinima).length;
    const totalPecas = this.estoque.reduce((acc, p) => acc + p.quantidade, 0);
    const valorTotalEstoque = this.estoque.reduce((acc, p) => acc + (p.quantidade * p.precoVenda), 0);

    // Ordens finalizadas hoje
    const ordensFinalizadasHoje = this.ordens.filter(o => o.horaRegistroHoje && (o.status === 'FINALIZADA' || o.status === 'ENTREGUE'));
    const faturamentoHojeCalc = ordensFinalizadasHoje.reduce((acc, o) => acc + (o.valorTotal || 0), 0);
    const maoDeObraHojeCalc = ordensFinalizadasHoje.reduce((acc, o) => acc + (o.valorServicos || 0), 0);
    const pecasHojeCalc = ordensFinalizadasHoje.reduce((acc, o) => acc + (o.valorPecas || 0), 0);
    const ticketMedioHojeCalc = ordensFinalizadasHoje.length > 0 ? faturamentoHojeCalc / ordensFinalizadasHoje.length : 770.0;

    // Agregação de Serviços
    const servicosMap = new Map<string, { nome: string; execucoes: number; receita: number }>();
    for (const os of this.ordens) {
      for (const item of os.itens) {
        if (item.tipo === 'SERVICO') {
          const prev = servicosMap.get(item.descricao) || { nome: item.descricao, execucoes: 0, receita: 0 };
          prev.execucoes += item.quantidade;
          prev.receita += item.subtotal;
          servicosMap.set(item.descricao, prev);
        }
      }
    }
    const sortedServicos = Array.from(servicosMap.values()).sort((a, b) => b.execucoes - a.execucoes || b.receita - a.receita);
    const servicoLider = sortedServicos[0] ? {
      nome: sortedServicos[0].nome,
      execucoes: sortedServicos[0].execucoes,
      receitaTotal: sortedServicos[0].receita,
      precoMedio: Math.round(sortedServicos[0].receita / (sortedServicos[0].execucoes || 1))
    } : {
      nome: 'Limpeza interna completa e repastagem térmica',
      execucoes: 3,
      receitaTotal: 620.0,
      precoMedio: 207.0
    };
    const rankingServicos = sortedServicos.slice(0, 4).map((s, idx) => ({
      pos: idx + 1,
      nome: s.nome,
      execucoes: s.execucoes,
      receita: s.receita
    }));

    // Agregação de Peças e Produtos
    const pecasMap = new Map<string, { nome: string; unidades: number; receita: number }>();
    let totalItensFaturados = 0;
    let receitaPecasTotal = 0;
    for (const os of this.ordens) {
      for (const item of os.itens) {
        if (item.tipo === 'PECA') {
          const prev = pecasMap.get(item.descricao) || { nome: item.descricao, unidades: 0, receita: 0 };
          prev.unidades += item.quantidade;
          prev.receita += item.subtotal;
          pecasMap.set(item.descricao, prev);
          totalItensFaturados += item.quantidade;
          receitaPecasTotal += item.subtotal;
        }
      }
    }
    const sortedPecas = Array.from(pecasMap.values()).sort((a, b) => b.unidades - a.unidades || b.receita - a.receita);
    const produtoCampeao = sortedPecas[0] ? {
      nome: sortedPecas[0].nome,
      unidades: sortedPecas[0].unidades,
      receitaTotal: sortedPecas[0].receita
    } : {
      nome: 'SSD Enterprise NVMe 1TB Kingston Server Grade',
      unidades: 3,
      receitaTotal: 1260.0
    };
    const cores = ['#8B5CF6', '#06B6D4', '#10B981', '#F97316', '#D946EF'];
    const rankingProdutos = sortedPecas.slice(0, 5).map((p, idx) => ({
      pos: idx + 1,
      nome: p.nome,
      unidades: p.unidades,
      precoMedio: p.unidades > 0 ? Math.round(p.receita / p.unidades) : 0,
      participacao: totalItensFaturados > 0 ? Number(((p.unidades / totalItensFaturados) * 100).toFixed(1)) : 0,
      receita: p.receita,
      corBarra: cores[idx % cores.length]
    }));

    const percentOr = totalOS > 0 ? Math.round((orcamentos / totalOS) * 100) : 14;
    const percentEm = totalOS > 0 ? Math.round((emAndamento / totalOS) * 100) : 29;
    const percentAg = totalOS > 0 ? Math.round((aguardandoPecas / totalOS) * 100) : 14;
    const percentCo = totalOS > 0 ? Math.round((concluidas / totalOS) * 100) : 43;

    return {
      totalOS,
      abertas,
      emAndamento,
      orcamentos,
      executando: emAndamento,
      aguardandoPecas,
      concluidas,
      faturamentoTotal: faturamentoTotal || 1890.0,
      faturamentoPendente,
      faturamentoPrevisto: faturamentoPrevisto || 4365.0,
      ticketMedio,
      taxaSucesso: taxaSucesso || 42.9,
      estoqueBaixo,
      totalPecas,
      valorTotalEstoque,
      caixaHoje: {
        faturamentoHoje: faturamentoHojeCalc || 1540.0,
        ordensHojeCount: ordensFinalizadasHoje.length || 2,
        maoDeObraHoje: maoDeObraHojeCalc || 630.0,
        pecasHoje: pecasHojeCalc || 980.0,
        ticketMedioHoje: ticketMedioHojeCalc || 770.0,
        variacaoOntemPercent: 18.5,
        ordensFinalizadasHoje
      },
      rankingStatus: [
        { status: 'ORCAMENTO', label: 'Orçamento', count: orcamentos, percent: percentOr, color: '#f59e0b' },
        { status: 'EM_ANDAMENTO', label: 'Em Andamento', count: emAndamento, percent: percentEm, color: '#3b82f6' },
        { status: 'AGUARDANDO_PECAS', label: 'Aguardando Peça', count: aguardandoPecas, percent: percentAg, color: '#8b5cf6' },
        { status: 'FINALIZADA', label: 'Concluída', count: concluidas, percent: percentCo, color: '#10b981' }
      ],
      servicoLider,
      rankingServicos,
      volumeAcumuladoServicos: 12,
      produtoCampeao,
      rankingProdutos,
      totalItensFaturados: totalItensFaturados || 11,
      receitaPecasTotal: receitaPecasTotal || 3655.0
    };
  }
}

export const dbStore = new InMemoryStore();
