import { googleAuthService } from './googleAuth';
import { GOOGLE_CALENDAR_CONFIG } from '../config/googleCalendar';
import { Agendamento, EventoGoogle } from '../types';
import { supabase } from './supabase';

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
  colorId?: string;
}

class GoogleCalendarService {
  private readonly baseUrl = 'https://www.googleapis.com/calendar/v3';
  private isImporting = false; // Flag para prevenir importações simultâneas

  // Criar evento no Google Calendar
  async createEvent(
    agendamento: Agendamento, 
    funcionarios: any[], 
    servicos: any[]
  ): Promise<string | null> {
    try {
      const accessToken = await googleAuthService.getValidAccessToken();
      if (!accessToken) {
        console.warn('Usuário não autenticado no Google Calendar');
        return null;
      }

      const event = this.agendamentoToGoogleEvent(agendamento, funcionarios, servicos);
      
      const response = await fetch(
        `${this.baseUrl}/calendars/${GOOGLE_CALENDAR_CONFIG.CALENDAR_ID}/events`,
        {
          method: 'POST',
          headers: googleAuthService.getAuthHeaders(),
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create event: ${response.statusText}`);
      }

      const createdEvent = await response.json();
      console.log(`📧 Evento criado no Google Calendar para ${funcionarios.length} funcionário(s): ${funcionarios.map(f => f.nome).join(', ')}`);
      return createdEvent.id;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      return null;
    }
  }

  // Atualizar evento no Google Calendar
  async updateEvent(
    eventId: string, 
    agendamento: Agendamento, 
    funcionarios: any[], 
    servicos: any[]
  ): Promise<boolean> {
    try {
      const accessToken = await googleAuthService.getValidAccessToken();
      if (!accessToken) {
        console.warn('Usuário não autenticado no Google Calendar');
        return false;
      }

      const event = this.agendamentoToGoogleEvent(agendamento, funcionarios, servicos);
      
      const response = await fetch(
        `${this.baseUrl}/calendars/${GOOGLE_CALENDAR_CONFIG.CALENDAR_ID}/events/${eventId}`,
        {
          method: 'PUT',
          headers: googleAuthService.getAuthHeaders(),
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update event: ${response.statusText}`);
      }

      console.log(`📧 Evento atualizado no Google Calendar para ${funcionarios.length} funcionário(s): ${funcionarios.map(f => f.nome).join(', ')}`);
      return true;
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      return false;
    }
  }

  // Deletar evento do Google Calendar
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const accessToken = await googleAuthService.getValidAccessToken();
      if (!accessToken) {
        console.warn('Usuário não autenticado no Google Calendar');
        return false;
      }

      const response = await fetch(
        `${this.baseUrl}/calendars/${GOOGLE_CALENDAR_CONFIG.CALENDAR_ID}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: googleAuthService.getAuthHeaders(),
        }
      );

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete event: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      return false;
    }
  }

  // Buscar eventos do Google Calendar
  async listEvents(startDate?: Date, endDate?: Date): Promise<GoogleCalendarEvent[]> {
    try {
      const accessToken = await googleAuthService.getValidAccessToken();
      if (!accessToken) {
        console.warn('Usuário não autenticado no Google Calendar');
        return [];
      }

      // Definir período padrão (próximos 30 dias se não especificado)
      const timeMin = startDate ? startDate.toISOString() : new Date().toISOString();
      const timeMax = endDate ? endDate.toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const params = new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '250'
      });

      const response = await fetch(
        `${this.baseUrl}/calendars/${GOOGLE_CALENDAR_CONFIG.CALENDAR_ID}/events?${params}`,
        {
          method: 'GET',
          headers: googleAuthService.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Token de acesso expirado ou inválido. Fazendo logout...');
          googleAuthService.logout();
          throw new Error('Token expirado. Faça login novamente no Google Calendar.');
        }
        throw new Error(`Failed to fetch events: HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      return [];
    }
  }

  // Importar eventos do Google Calendar para a tabela eventos_google
  async importFromGoogleCalendar(startDate?: Date, endDate?: Date): Promise<{ imported: number; skipped: number; errors: number }> {
    if (!this.isConnected()) {
      throw new Error('Google Calendar não está conectado');
    }

    // Prevenir importações simultâneas
    if (this.isImporting) {
      console.log('Importação já em andamento, aguarde...');
      return { imported: 0, skipped: 0, errors: 0 };
    }

    this.isImporting = true;

    try {
      // Buscar eventos do Google Calendar
      const googleEvents = await this.listEvents(startDate, endDate);
      
      // Buscar eventos já importados E agendamentos com google_calendar_event_id para evitar duplicatas
      const [eventosExistentes, agendamentosComGoogle] = await Promise.all([
        supabase.from('eventos_google').select('google_event_id'),
        supabase.from('agendamentos').select('google_calendar_event_id').not('google_calendar_event_id', 'is', null)
      ]);
      
      const existingEventIds = new Set([
        ...(eventosExistentes.data?.map(e => e.google_event_id) || []),
        ...(agendamentosComGoogle.data?.map(a => a.google_calendar_event_id) || [])
      ]);

      console.log(`Encontrados ${googleEvents.length} eventos no Google Calendar`);
      console.log(`Já existem ${existingEventIds.size} eventos/agendamentos importados`);

      let imported = 0;
      let skipped = 0;
      let errors = 0;

      for (const event of googleEvents) {
        try {
          // Verificação mais robusta de duplicatas
          if (!event.id) {
            console.log('Evento sem ID, pulando...');
            skipped++;
            continue;
          }

          if (existingEventIds.has(event.id)) {
            console.log(`Evento ${event.id} já existe como agendamento ou evento importado, pulando...`);
            skipped++;
            continue;
          }

          // Converter evento do Google para EventoGoogle
          const eventoGoogle = this.googleEventToEventoGoogle(event);
          
          // Pular se não conseguiu converter
          if (!eventoGoogle) {
            skipped++;
            continue;
          }

          // Inserir na tabela eventos_google com tratamento de duplicatas
          const { error } = await supabase
            .from('eventos_google')
            .insert(eventoGoogle);

          if (error) {
            // Se for erro de duplicata, contar como skipped ao invés de erro
            if (error.code === '23505' && error.message.includes('eventos_google_google_event_id_key')) {
              console.log(`Evento ${event.id} já existe, pulando...`);
              skipped++;
            } else {
              console.error(`Erro ao inserir evento ${event.id}:`, error);
              errors++;
            }
          } else {
            imported++;
          }
        } catch (error) {
          console.error(`Erro ao importar evento ${event.id}:`, error);
          errors++;
        }
      }

      return { imported, skipped, errors };
    } catch (error) {
      console.error('Erro na importação:', error);
      throw error;
    } finally {
      this.isImporting = false; // Liberar o flag
    }
  }

  // Sincronizar exclusões do Google Calendar
  async syncDeletionsFromGoogleCalendar(): Promise<{ deletedEventos: number; deletedAgendamentos: number }> {
    if (!this.isConnected()) {
      throw new Error('Google Calendar não está conectado');
    }

    try {
      console.log('🔄 Iniciando sincronização de exclusões...');
      
      // Buscar todos os eventos atuais do Google Calendar
      const googleEvents = await this.listEvents();
      const googleEventIds = new Set(googleEvents.map(event => event.id));
      console.log(`📅 Encontrados ${googleEventIds.size} eventos no Google Calendar`);

      // Buscar eventos importados no sistema
      const { data: eventosGoogle, error: errorEventos } = await supabase
        .from('eventos_google')
        .select('id, google_event_id, titulo');

      if (errorEventos) {
        console.error('Erro ao buscar eventos do Google:', errorEventos);
        return { deletedEventos: 0, deletedAgendamentos: 0 };
      }

      // Buscar agendamentos com google_calendar_event_id
      const { data: agendamentosGoogle, error: errorAgendamentos } = await supabase
        .from('agendamentos')
        .select('id, google_calendar_event_id, cliente_nome')
        .not('google_calendar_event_id', 'is', null);

      if (errorAgendamentos) {
        console.error('Erro ao buscar agendamentos do Google:', errorAgendamentos);
        return { deletedEventos: 0, deletedAgendamentos: 0 };
      }

      let deletedEventos = 0;
      let deletedAgendamentos = 0;

      // Verificar e excluir eventos importados que não existem mais no Google
      if (eventosGoogle && eventosGoogle.length > 0) {
        console.log(`🔍 Verificando ${eventosGoogle.length} eventos importados...`);
        
        for (const evento of eventosGoogle) {
          if (!googleEventIds.has(evento.google_event_id)) {
            console.log(`❌ Excluindo evento importado: "${evento.titulo}" (ID: ${evento.google_event_id})`);
            const { error } = await supabase
              .from('eventos_google')
              .delete()
              .eq('id', evento.id);

            if (!error) {
              deletedEventos++;
            } else {
              console.error('Erro ao excluir evento:', error);
            }
          }
        }
      }

      // Verificar e excluir agendamentos cujos eventos do Google foram excluídos
      if (agendamentosGoogle && agendamentosGoogle.length > 0) {
        console.log(`🔍 Verificando ${agendamentosGoogle.length} agendamentos sincronizados...`);
        
        for (const agendamento of agendamentosGoogle) {
          if (!googleEventIds.has(agendamento.google_calendar_event_id)) {
            console.log(`❌ Excluindo agendamento sincronizado: "${agendamento.cliente_nome}" (Google ID: ${agendamento.google_calendar_event_id})`);
            const { error } = await supabase
              .from('agendamentos')
              .delete()
              .eq('id', agendamento.id);

            if (!error) {
              deletedAgendamentos++;
            } else {
              console.error('Erro ao excluir agendamento:', error);
            }
          }
        }
      }

      console.log(`✅ Sincronização de exclusões concluída: ${deletedEventos} eventos importados e ${deletedAgendamentos} agendamentos excluídos`);
      return { deletedEventos, deletedAgendamentos };

    } catch (error) {
      console.error('❌ Erro na sincronização de exclusões:', error);
      return { deletedEventos: 0, deletedAgendamentos: 0 };
    }
  }

  // Converter evento do Google Calendar para EventoGoogle
  private googleEventToEventoGoogle(event: GoogleCalendarEvent): Omit<EventoGoogle, 'id' | 'created_at' | 'updated_at'> | null {
    try {
      // Verificar se é um evento válido para importação
      if (!event.start?.dateTime || !event.summary || !event.id) {
        return null;
      }

      // Extrair informações do evento
      const startDate = new Date(event.start.dateTime);
      const endDate = event.end?.dateTime ? new Date(event.end.dateTime) : null;
      
      // Extrair participantes (event é do tipo GoogleCalendarEvent)
      const participantes = (event as GoogleCalendarEvent).attendees?.map(a => a.email) || [];
      
      // Verificar se é evento de dia inteiro
      const allDay = !event.start.dateTime.includes('T');

      return {
        google_event_id: event.id,
        titulo: event.summary,
        descricao: event.description || undefined,
        data_inicio: startDate.toISOString(),
        data_fim: endDate?.toISOString() || undefined,
        local: event.location || undefined,
        organizador: (event as GoogleCalendarEvent).attendees?.[0]?.displayName || undefined,
        participantes: participantes.length > 0 ? participantes : undefined,
        link_meet: this.extractMeetLink(event.description),
        cor: event.colorId ? this.getColorFromColorId(event.colorId) : '#3182CE',
        all_day: allDay,
        synced_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro ao converter evento do Google Calendar:', error);
      return null;
    }
  }

  // Extrair link do Google Meet da descrição
  private extractMeetLink(description?: string): string | undefined {
    if (!description) return undefined;
    
    const meetRegex = /https:\/\/meet\.google\.com\/[a-z\-]+/i;
    const match = description.match(meetRegex);
    return match ? match[0] : undefined;
  }

  // Converter colorId do Google para cor hex
  private getColorFromColorId(colorId: string): string {
    const colorMap: Record<string, string> = {
      '1': '#a4bdfc', // Lavanda
      '2': '#7ae7bf', // Sálvia  
      '3': '#dbadff', // Uva
      '4': '#ff887c', // Flamingo
      '5': '#fbd75b', // Banana
      '6': '#ffb878', // Tangerina
      '7': '#46d6db', // Pavão
      '8': '#e1e1e1', // Grafite
      '9': '#5484ed', // Mirtilo
      '10': '#51b749', // Manjericão
      '11': '#dc2127', // Tomate
    };
    return colorMap[colorId] || '#3182CE';
  }

  // Buscar eventos Google armazenados localmente
  async getEventosGoogle(startDate?: Date, endDate?: Date): Promise<EventoGoogle[]> {
    try {
      let query = supabase
        .from('eventos_google')
        .select('*')
        .order('data_inicio', { ascending: true });

      // Aplicar filtros de data se fornecidos
      if (startDate) {
        query = query.gte('data_inicio', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('data_inicio', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar eventos Google:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar eventos Google:', error);
      return [];
    }
  }

  // Deletar evento Google local
  async deleteEventoGoogle(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('eventos_google')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar evento Google:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar evento Google:', error);
      return false;
    }
  }

  // Atualizar evento Google local
  async updateEventoGoogle(id: string, updates: Partial<EventoGoogle>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('eventos_google')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar evento Google:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar evento Google:', error);
      return false;
    }
  }

  // Converter agendamento para evento do Google Calendar
  private agendamentoToGoogleEvent(
    agendamento: Agendamento, 
    funcionarios: any[], 
    servicos: any[]
  ): GoogleCalendarEvent {
    const startDateTime = `${agendamento.data_agendamento}T${agendamento.horario}`;
    
    // Calcular hora de fim baseado no horario_fim ou assumir 1 hora
    let endDateTime: string;
    if (agendamento.horario_fim) {
      endDateTime = `${agendamento.data_agendamento}T${agendamento.horario_fim}`;
    } else {
      const startDate = new Date(startDateTime);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hora
      endDateTime = endDate.toISOString().slice(0, 19);
    }

    const statusEmoji = {
      'AGENDADO': '📅',
      'CONFIRMADO': '✅', 
      'REALIZADO': '✨',
      'CANCELADO': '❌'
    };

    // Criar lista de serviços
    const servicosNomes = servicos.map(s => s.nome).join(', ');

    // Criar descrição detalhada
    const descricaoServicos = servicos.map((servico, index) => 
      `${index + 1}. ${servico.nome} - R$ ${servico.valor_base.toFixed(2)}`
    ).join('\n');
    
    const descricaoFuncionarios = funcionarios.map((funcionario, index) => 
      `${index + 1}. ${funcionario.nome} ${funcionario.sobrenome} - ${funcionario.funcao}`
    ).join('\n');

    const event: GoogleCalendarEvent = {
      summary: `${statusEmoji[agendamento.status]} ${agendamento.cliente_nome} - ${servicosNomes}`,
      description: [
        `Cliente: ${agendamento.cliente_nome}`,
        `Telefone: ${agendamento.cliente_telefone || 'Não informado'}`,
        '',
        `Serviços (${servicos.length}):`,
        descricaoServicos,
        '',
        `Funcionários (${funcionarios.length}):`,
        descricaoFuncionarios,
        '',
        `Status: ${agendamento.status}`,
        agendamento.observacoes ? `Observações: ${agendamento.observacoes}` : '',
        '',
        'Agendamento criado através do Sistema do Salão de Beleza'
      ].filter(Boolean).join('\n'),
      start: {
        dateTime: startDateTime,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'America/Sao_Paulo',
      },
      location: GOOGLE_CALENDAR_CONFIG.EVENT_DEFAULTS.location,
      attendees: funcionarios.map(funcionario => ({
        email: funcionario.email,
        displayName: `${funcionario.nome} ${funcionario.sobrenome}`,
        responseStatus: 'needsAction'
      })),
      reminders: GOOGLE_CALENDAR_CONFIG.EVENT_DEFAULTS.reminders,
      colorId: this.getColorByStatus(agendamento.status),
    };

    // Debug: Verificar attendees que serão enviados
    console.log(`🎯 Google Calendar Event - Attendees: ${event.attendees?.length || 0}`);
    event.attendees?.forEach((attendee: any, index: number) => {
      console.log(`   ${index + 1}. ${attendee.displayName} (${attendee.email})`);
    });

    return event;

    return event;
  }

  // Obter cor baseada no status
  private getColorByStatus(status: string): string {
    const colors = {
      'AGENDADO': '7',    // Azul
      'CONFIRMADO': '10', // Verde
      'REALIZADO': '5',   // Amarelo
      'CANCELADO': '11'   // Vermelho
    };
    return colors[status as keyof typeof colors] || '7';
  }

  // Verificar se está conectado e token é válido
  async isConnected(): Promise<boolean> {
    try {
      const token = await googleAuthService.getValidAccessToken();
      return !!token;
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      return false;
    }
  }

  // Verificar se está conectado (versão síncrona - pode não ser 100% precisa)
  isConnectedSync(): boolean {
    return googleAuthService.isAuthenticated();
  }

  // Obter URL de autenticação
  getAuthUrl(): string {
    return googleAuthService.getAuthUrl();
  }

  // Processar callback de autenticação
  async handleAuthCallback(code: string): Promise<boolean> {
    try {
      await googleAuthService.exchangeCodeForTokens(code);
      return true;
    } catch (error) {
      console.error('Error handling auth callback:', error);
      return false;
    }
  }

  // Desconectar
  disconnect(): void {
    googleAuthService.logout();
  }

  // Sincronizar todos os agendamentos com o Google Calendar (bidirecional)
  async syncAllAgendamentos(): Promise<{ 
    localToGoogle: { success: number; errors: number; total: number };
    googleToLocal: { imported: number; skipped: number; errors: number };
  }> {
    if (!this.isConnected()) {
      throw new Error('Google Calendar não está conectado');
    }

    try {
      // PARTE 1: Sincronizar agendamentos locais para Google Calendar
      const { agendamentoService } = await import('../services/api');
      const agendamentos = await agendamentoService.getAll();
      
      let localSuccess = 0;
      let localErrors = 0;
      const localTotal = agendamentos.length;

      for (const agendamento of agendamentos) {
        try {
          // Se já tem evento no Google Calendar, pular
          if (agendamento.google_calendar_event_id) {
            localSuccess++;
            continue;
          }

          // Criar evento no Google Calendar
          // Preparar funcionários e serviços (usar arrays ou fallback para compatibilidade)
          const funcionarios = agendamento.funcionarios?.length > 0 
            ? agendamento.funcionarios.map((f: any) => f.funcionario)
            : [agendamento.funcionario];
          
          const servicos = agendamento.servicos?.length > 0 
            ? agendamento.servicos.map((s: any) => s.servico)
            : [agendamento.servico];

          const eventId = await this.createEvent(
            agendamento,
            funcionarios,
            servicos
          );

          if (eventId) {
            // Atualizar o agendamento com o ID do evento
            await agendamentoService.update(agendamento.id, {
              google_calendar_event_id: eventId
            });
            localSuccess++;
          } else {
            localErrors++;
          }
        } catch (error) {
          console.error(`Erro ao sincronizar agendamento ${agendamento.id}:`, error);
          localErrors++;
        }
      }

      // PARTE 2: Importar eventos do Google Calendar para o sistema local
      const importResult = await this.importFromGoogleCalendar();

      return {
        localToGoogle: { 
          success: localSuccess, 
          errors: localErrors, 
          total: localTotal 
        },
        googleToLocal: importResult
      };
    } catch (error) {
      console.error('Erro na sincronização:', error);
      throw error;
    }
  }

  // Verificar sincronização (quantos agendamentos estão sincronizados)
  async getSyncStatus(): Promise<{ synced: number; unsynced: number; total: number }> {
    try {
      const { agendamentoService } = await import('../services/api');
      const agendamentos = await agendamentoService.getAll();
      
      const total = agendamentos.length;
      const synced = agendamentos.filter((a: any) => a.google_calendar_event_id).length;
      const unsynced = total - synced;

      return { synced, unsynced, total };
    } catch (error) {
      console.error('Erro ao verificar status de sincronização:', error);
      return { synced: 0, unsynced: 0, total: 0 };
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
