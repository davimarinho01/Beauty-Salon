import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anonima'

// Cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)

// Função para testar conexão
export const testConnection = async () => {
  try {
    const { error } = await supabase.from('funcionarios').select('count', { count: 'exact' })
    if (error) throw error
    console.log('✅ Conexão com Supabase estabelecida!')
    return true
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error)
    return false
  }
}

// Tipos para o banco
export interface Database {
  public: {
    Tables: {
      funcionarios: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          nome: string
          sobrenome: string
          telefone: string
          email: string
          funcao: string
          ativo: boolean
          meta_semanal: number | null
          meta_mensal: number | null
          comissao_percentual: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          nome: string
          sobrenome: string
          telefone: string
          email: string
          funcao: string
          ativo?: boolean
          meta_semanal?: number | null
          meta_mensal?: number | null
          comissao_percentual?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          nome?: string
          sobrenome?: string
          telefone?: string
          email?: string
          funcao?: string
          ativo?: boolean
          meta_semanal?: number | null
          meta_mensal?: number | null
          comissao_percentual?: number | null
        }
      }
      servicos: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          nome: string
          valor_base: number
          funcionario_responsavel_id: string
          ativo: boolean
          descricao: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          nome: string
          valor_base: number
          funcionario_responsavel_id: string
          ativo?: boolean
          descricao?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          nome?: string
          valor_base?: number
          funcionario_responsavel_id?: string
          ativo?: boolean
          descricao?: string | null
        }
      }
      movimentacoes_financeiras: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          tipo: 'ENTRADA' | 'SAIDA'
          valor: number
          descricao: string
          metodo_pagamento: 'PIX' | 'DINHEIRO' | 'CREDITO' | 'DEBITO' | null
          funcionario_id: string | null
          servico_id: string | null
          cliente_nome: string | null
          data_movimentacao: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          tipo: 'ENTRADA' | 'SAIDA'
          valor: number
          descricao: string
          metodo_pagamento?: 'PIX' | 'DINHEIRO' | 'CREDITO' | 'DEBITO' | null
          funcionario_id?: string | null
          servico_id?: string | null
          cliente_nome?: string | null
          data_movimentacao?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          tipo?: 'ENTRADA' | 'SAIDA'
          valor?: number
          descricao?: string
          metodo_pagamento?: 'PIX' | 'DINHEIRO' | 'CREDITO' | 'DEBITO' | null
          funcionario_id?: string | null
          servico_id?: string | null
          cliente_nome?: string | null
          data_movimentacao?: string
        }
      }
      agendamentos: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          servico_id: string
          funcionario_id: string
          cliente_nome: string
          cliente_telefone: string | null
          data_agendamento: string
          horario: string
          status: 'AGENDADO' | 'CONFIRMADO' | 'REALIZADO' | 'CANCELADO'
          observacoes: string | null
          google_calendar_event_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          servico_id: string
          funcionario_id: string
          cliente_nome: string
          cliente_telefone?: string | null
          data_agendamento: string
          horario: string
          status?: 'AGENDADO' | 'CONFIRMADO' | 'REALIZADO' | 'CANCELADO'
          observacoes?: string | null
          google_calendar_event_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          servico_id?: string
          funcionario_id?: string
          cliente_nome?: string
          cliente_telefone?: string | null
          data_agendamento?: string
          horario?: string
          status?: 'AGENDADO' | 'CONFIRMADO' | 'REALIZADO' | 'CANCELADO'
          observacoes?: string | null
          google_calendar_event_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}