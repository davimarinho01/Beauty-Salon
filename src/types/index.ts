// Tipos base do sistema
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

// Funcionários
export interface Funcionario extends BaseEntity {
  nome: string
  sobrenome: string
  telefone: string
  email: string
  funcao: string
  ativo: boolean
  meta_semanal?: number
  meta_mensal?: number
  comissao_percentual?: number
}

// Serviços
export interface Servico extends BaseEntity {
  nome: string
  valor_base: number
  funcionario_responsavel_id: string
  funcionario?: Funcionario
  ativo: boolean
  descricao?: string
}

// Clientes
export interface Cliente extends BaseEntity {
  nome: string
  telefone?: string
  email?: string
  data_nascimento?: string
  observacoes?: string
}

// Métodos de pagamento
export type MetodoPagamento = 'PIX' | 'DINHEIRO' | 'CREDITO' | 'DEBITO'

// Movimentações financeiras
export interface MovimentacaoFinanceira extends BaseEntity {
  tipo: 'ENTRADA' | 'SAIDA'
  valor: number
  descricao: string
  metodo_pagamento?: MetodoPagamento
  funcionario_id?: string
  funcionario?: Funcionario
  servico_id?: string
  servico?: Servico
  cliente_nome?: string
  data_movimentacao: string
}

// Agendamentos
export interface Agendamento extends BaseEntity {
  servico_id: string // Mantido para compatibilidade - serviço principal
  servico?: Servico
  funcionario_id: string // Mantido para compatibilidade - funcionário principal
  funcionario?: Funcionario
  cliente_nome: string
  cliente_telefone?: string
  data_agendamento: string
  horario: string
  horario_fim?: string
  status: 'AGENDADO' | 'CONFIRMADO' | 'REALIZADO' | 'CANCELADO'
  observacoes?: string
  google_calendar_event_id?: string
  // Novos campos para múltiplos serviços e funcionários
  servicos?: AgendamentoServico[]
  funcionarios?: AgendamentoFuncionario[]
  valor_total?: number // Soma de todos os serviços
}

// Relacionamento Agendamento-Serviço
export interface AgendamentoServico extends BaseEntity {
  agendamento_id: string
  servico_id: string
  servico?: Servico
  valor_aplicado?: number
  ordem: number
}

// Relacionamento Agendamento-Funcionário
export interface AgendamentoFuncionario extends BaseEntity {
  agendamento_id: string
  funcionario_id: string
  funcionario?: Funcionario
  responsavel_principal: boolean
  ordem: number
}

// Eventos do Google Calendar
export interface EventoGoogle extends BaseEntity {
  google_event_id: string
  titulo: string
  descricao?: string
  data_inicio: string
  data_fim?: string
  local?: string
  organizador?: string
  participantes?: string[]
  link_meet?: string
  cor?: string
  all_day?: boolean
  synced_at: string
}

// União de tipos para visualização no calendário
export type EventoCalendario = Agendamento | EventoGoogle

// Type guards para diferenciar os tipos
export const isAgendamento = (evento: EventoCalendario): evento is Agendamento => {
  return 'servico_id' in evento && 'funcionario_id' in evento
}

export const isEventoGoogle = (evento: EventoCalendario): evento is EventoGoogle => {
  return 'google_event_id' in evento && 'titulo' in evento
}

// Relatórios e estatísticas
export interface EstatisticasDashboard {
  faturamento_total: number
  entradas_total: number
  saidas_total: number
  saldo_caixa: number
  variacao_faturamento: number
  variacao_entradas: number
  variacao_saidas: number
  variacao_saldo: number
}

export interface FaturamentoDiario {
  data: string
  valor: number
}

export interface EstatisticasMetodoPagamento {
  metodo: MetodoPagamento
  total: number
  quantidade: number
  percentual: number
}

export interface PerformanceFuncionario {
  funcionario_id: string
  funcionario_nome: string
  clientes_atendidos: number
  faturamento: number
  servicos_realizados: number
  meta_atingida: boolean
}

// Formulários
export interface FormularioEntrada {
  funcionario_id: string
  valor: number
  servico_id: string
  cliente_nome: string
  metodo_pagamento: MetodoPagamento
  data_movimentacao?: string
}

export interface FormularioSaida {
  tipo_saida: string
  valor: number
  descricao: string
  data_movimentacao?: string
}

export interface FormularioServico {
  nome: string
  valor_base: number
  funcionario_responsavel_id: string
  descricao?: string
}

export interface FormularioFuncionario {
  nome: string
  sobrenome: string
  telefone: string
  email: string
  funcao: string
}

export interface FormularioAgendamento {
  // Compatibilidade - serviço e funcionário principal
  servico_id: string
  funcionario_id: string
  // Múltiplos serviços e funcionários
  servicos_ids: string[]
  funcionarios_ids: string[]
  // Dados do agendamento
  cliente_nome: string
  cliente_telefone?: string
  data_agendamento: string
  horario: string
  horario_fim?: string
  observacoes?: string
}

// Autenticação e Usuários
export type UserRole = 'admin' | 'recepcao'

export interface User extends BaseEntity {
  nome: string
  sobrenome: string
  email: string
  role: UserRole
  ativo: boolean
  avatar_url?: string
  telefone?: string
  ultimo_login?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkPermission: (requiredRole?: UserRole) => boolean
}

// Permissões por funcionalidade
export interface Permission {
  view: boolean
  create: boolean
  edit: boolean
  delete: boolean
}

export interface RolePermissions {
  dashboard: Permission
  financeiro: Permission
  servicos: Permission
  agendamentos: Permission
  funcionarios: Permission
  configuracoes: Permission
}
