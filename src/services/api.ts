import { supabase } from './supabase';
import { googleCalendarService } from './googleCalendar';
import type { 
  Funcionario, 
  Servico, 
  MovimentacaoFinanceira, 
  FormularioEntrada as FormEntrada,
  FormularioSaida as FormSaida,
  EstatisticasDashboard 
} from '../types'

// ===== FUNCIONÁRIOS =====
export const funcionarioService = {
  async getAll(): Promise<Funcionario[]> {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Funcionario | null> {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(funcionario: Omit<Funcionario, 'id' | 'created_at' | 'updated_at'>): Promise<Funcionario> {
    const { data, error } = await supabase
      .from('funcionarios')
      .insert([funcionario])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Funcionario>): Promise<Funcionario> {
    const { data, error } = await supabase
      .from('funcionarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from('funcionarios')
      .update({ ativo: false })
      .eq('id', id)
    
    if (error) throw error
  },

  async getAllForSelect(): Promise<Funcionario[]> {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    
    if (error) throw error
    return data || []
  },

  async getAllWithPerformance(): Promise<any[]> {
    const funcionarios = await this.getAll();
    const movimentacoes = await financeiroService.getMovimentacoes();
    
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());

    return funcionarios.map(funcionario => {
      const vendas = movimentacoes.filter(m => 
        m.funcionario_id === funcionario.id && m.tipo === 'ENTRADA'
      );

      const vendasMes = vendas.filter(v => 
        new Date(v.data_movimentacao) >= inicioMes
      );

      const vendasSemana = vendas.filter(v => 
        new Date(v.data_movimentacao) >= inicioSemana
      );

      const faturamento_mes = vendasMes.reduce((sum, v) => sum + v.valor, 0);
      const faturamento_semana = vendasSemana.reduce((sum, v) => sum + v.valor, 0);
      const meta_mes = funcionario.meta_mensal || 0;
      const meta_semana = funcionario.meta_semanal || 0;

      return {
        ...funcionario,
        vendas_mes: vendasMes.length,
        vendas_semana: vendasSemana.length,
        faturamento_mes,
        faturamento_semana,
        percentual_meta_mes: meta_mes > 0 ? (faturamento_mes / meta_mes) * 100 : 0,
        percentual_meta_semana: meta_semana > 0 ? (faturamento_semana / meta_semana) * 100 : 0,
        comissao_mes: faturamento_mes * (funcionario.comissao_percentual || 0) / 100,
        comissao_semana: faturamento_semana * (funcionario.comissao_percentual || 0) / 100,
      };
    });
  }
}

// ===== SERVIÇOS =====
export const servicoService = {
  async getAll(): Promise<Servico[]> {
    const { data, error } = await supabase
      .from('servicos')
      .select(`
        *,
        funcionario:funcionario_responsavel_id (*)
      `)
      .eq('ativo', true)
      .order('nome')
    
    if (error) throw error
    return data || []
  },

  async create(servico: Omit<Servico, 'id' | 'created_at' | 'updated_at'>): Promise<Servico> {
    const { data, error } = await supabase
      .from('servicos')
      .insert([servico])
      .select(`
        *,
        funcionario:funcionario_responsavel_id (*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Servico>): Promise<Servico> {
    const { data, error } = await supabase
      .from('servicos')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        funcionario:funcionario_responsavel_id (*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  async deactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from('servicos')
      .update({ ativo: false })
      .eq('id', id)
    
    if (error) throw error
  }
}

// ===== MOVIMENTAÇÕES FINANCEIRAS =====
export const financeiroService = {
  async getMovimentacoes(limite?: number): Promise<MovimentacaoFinanceira[]> {
    let query = supabase
      .from('movimentacoes_financeiras')
      .select(`
        *,
        funcionario:funcionario_id (*),
        servico:servico_id (*)
      `)
      .order('data_movimentacao', { ascending: false })
    
    if (limite) {
      query = query.limit(limite)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  },

  async criarEntrada(entrada: FormEntrada): Promise<MovimentacaoFinanceira> {
    const movimentacao = {
      tipo: 'ENTRADA' as const,
      valor: entrada.valor,
      descricao: `Serviço - ${entrada.cliente_nome}`,
      metodo_pagamento: entrada.metodo_pagamento,
      funcionario_id: entrada.funcionario_id || null,
      servico_id: entrada.servico_id || null,
      cliente_nome: entrada.cliente_nome || null,
      data_movimentacao: entrada.data_movimentacao || new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('movimentacoes_financeiras')
      .insert([movimentacao])
      .select(`
        *,
        funcionario:funcionario_id (*),
        servico:servico_id (*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  async criarSaida(saida: FormSaida): Promise<MovimentacaoFinanceira> {
    const movimentacao = {
      tipo: 'SAIDA' as const,
      valor: saida.valor,
      descricao: saida.descricao,
      metodo_pagamento: 'DINHEIRO' as const, // FormSaida não tem metodo_pagamento
      data_movimentacao: saida.data_movimentacao || new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('movimentacoes_financeiras')
      .insert([movimentacao])
      .select(`
        *,
        funcionario:funcionario_id (*),
        servico:servico_id (*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<MovimentacaoFinanceira>): Promise<MovimentacaoFinanceira> {
    const { data, error } = await supabase
      .from('movimentacoes_financeiras')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        funcionario:funcionario_id (*),
        servico:servico_id (*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('movimentacoes_financeiras')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async getEstatisticas(dias: number = 30): Promise<EstatisticasDashboard> {
    const dataInicio = new Date()
    dataInicio.setDate(dataInicio.getDate() - dias)
    
    const { data, error } = await supabase
      .from('movimentacoes_financeiras')
      .select('*')
      .gte('data_movimentacao', dataInicio.toISOString())
    
    if (error) throw error
    
    const movimentacoes = data || []
    const entradas = movimentacoes.filter(m => m.tipo === 'ENTRADA')
    const saidas = movimentacoes.filter(m => m.tipo === 'SAIDA')
    
    const faturamento_total = entradas.reduce((acc, mov) => acc + mov.valor, 0)
    const entradas_total = faturamento_total
    const saidas_total = saidas.reduce((acc, mov) => acc + mov.valor, 0)
    const saldo_liquido = entradas_total - saidas_total
    
    return {
      faturamento_total,
      entradas_total,
      saidas_total,
      saldo_caixa: saldo_liquido,
      variacao_faturamento: 0,
      variacao_entradas: 0,
      variacao_saidas: 0,
      variacao_saldo: 0
    }
  }
}

// ===== AGENDAMENTOS =====
export const agendamentoService = {
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        servico:servico_id (*),
        funcionario:funcionario_id (*)
      `)
      .order('data_agendamento', { ascending: true })
      .order('horario', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async create(agendamento: any): Promise<any> {
    const { data, error } = await supabase
      .from('agendamentos')
      .insert([agendamento])
      .select(`
        *,
        servico:servico_id (*),
        funcionario:funcionario_id (*)
      `)
      .single()
    
    if (error) throw error

    // Tentar criar evento no Google Calendar
    try {
      if (googleCalendarService.isConnected()) {
        const eventId = await googleCalendarService.createEvent(data, data.funcionario, data.servico)
        
        // Atualizar o agendamento com o ID do evento do Google
        if (eventId) {
          await supabase
            .from('agendamentos')
            .update({ google_calendar_event_id: eventId })
            .eq('id', data.id)
        }
      }
    } catch (calendarError) {
      console.warn('Falha ao criar evento no Google Calendar:', calendarError)
      // Não falhar o agendamento por causa do Google Calendar
    }

    return data
  },

  async update(id: string, updates: any): Promise<any> {
    // Buscar dados atuais para comparação
    const { data: agendamentoAtual } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('agendamentos')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        servico:servico_id (*),
        funcionario:funcionario_id (*)
      `)
      .single()
    
    if (error) throw error

    // Tentar atualizar evento no Google Calendar
    try {
      if (googleCalendarService.isConnected() && agendamentoAtual?.google_calendar_event_id) {
        await googleCalendarService.updateEvent(
          agendamentoAtual.google_calendar_event_id, 
          data,
          data.funcionario,
          data.servico
        )
      }
    } catch (calendarError) {
      console.warn('Falha ao atualizar evento no Google Calendar:', calendarError)
      // Não falhar a atualização por causa do Google Calendar
    }

    return data
  },

  async delete(id: string): Promise<void> {
    // Buscar dados do agendamento antes de deletar
    const { data: agendamento, error: fetchError } = await supabase
      .from('agendamentos')
      .select('google_calendar_event_id')
      .eq('id', id)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const { error } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', id)
    
    if (error) throw error

    // Tentar deletar evento do Google Calendar
    try {
      if (googleCalendarService.isConnected() && agendamento?.google_calendar_event_id) {
        await googleCalendarService.deleteEvent(agendamento.google_calendar_event_id);
      }
    } catch (calendarError) {
      console.warn('Falha ao deletar evento do Google Calendar:', calendarError);
      // Não falhar a deleção por causa do Google Calendar
    }
  },

  async updateStatus(id: string, status: string): Promise<any> {
    return this.update(id, { status })
  },

  async getByDate(dataInicio: string, dataFim: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        servico:servico_id (*),
        funcionario:funcionario_id (*)
      `)
      .gte('data_agendamento', dataInicio)
      .lte('data_agendamento', dataFim)
      .order('data_agendamento', { ascending: true })
      .order('horario', { ascending: true })
    
    if (error) throw error
    return data || []
  }
}