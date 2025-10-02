import { googleAuthService } from './googleAuth';
import { GOOGLE_CALENDAR_CONFIG } from '../config/googleCalendar';
import { Agendamento } from '../types';

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

  // Criar evento no Google Calendar
  async createEvent(agendamento: Agendamento, funcionario: any, servico: any): Promise<string | null> {
    try {
      const accessToken = await googleAuthService.getValidAccessToken();
      if (!accessToken) {
        console.warn('Usuário não autenticado no Google Calendar');
        return null;
      }

      const event = this.agendamentoToGoogleEvent(agendamento, funcionario, servico);
      
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
      console.log('Evento criado no Google Calendar:', createdEvent.id);
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
    funcionario: any, 
    servico: any
  ): Promise<boolean> {
    try {
      const accessToken = await googleAuthService.getValidAccessToken();
      if (!accessToken) {
        console.warn('Usuário não autenticado no Google Calendar');
        return false;
      }

      const event = this.agendamentoToGoogleEvent(agendamento, funcionario, servico);
      
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

      console.log('Evento atualizado no Google Calendar:', eventId);
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

      console.log('Evento deletado do Google Calendar:', eventId);
      return true;
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      return false;
    }
  }

  // Converter agendamento para evento do Google Calendar
  private agendamentoToGoogleEvent(
    agendamento: Agendamento, 
    funcionario: any, 
    servico: any
  ): GoogleCalendarEvent {
    const startDateTime = `${agendamento.data_agendamento}T${agendamento.horario}`;
    
    // Calcular hora de fim (assumindo 1 hora de duração por padrão)
    const startDate = new Date(startDateTime);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hora
    const endDateTime = endDate.toISOString().slice(0, 19);

    const statusEmoji = {
      'AGENDADO': '📅',
      'CONFIRMADO': '✅', 
      'REALIZADO': '✨',
      'CANCELADO': '❌'
    };

    return {
      summary: `${statusEmoji[agendamento.status]} ${agendamento.cliente_nome} - ${servico.nome}`,
      description: [
        `Cliente: ${agendamento.cliente_nome}`,
        `Telefone: ${agendamento.cliente_telefone}`,
        `Serviço: ${servico.nome}`,
        `Funcionário: ${funcionario.nome}`,
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
      attendees: [
        {
          email: funcionario.email,
          displayName: funcionario.nome,
        }
      ],
      reminders: GOOGLE_CALENDAR_CONFIG.EVENT_DEFAULTS.reminders,
      colorId: this.getColorByStatus(agendamento.status),
    };
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

  // Verificar se está conectado
  isConnected(): boolean {
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

  // Sincronizar todos os agendamentos com o Google Calendar
  async syncAllAgendamentos(): Promise<{ success: number; errors: number; total: number }> {
    if (!this.isConnected()) {
      throw new Error('Google Calendar não está conectado');
    }

    try {
      // Importar o serviço aqui para evitar dependência circular
      const { agendamentoService } = await import('../services/api');
      const agendamentos = await agendamentoService.getAll();
      
      let success = 0;
      let errors = 0;
      const total = agendamentos.length;

      for (const agendamento of agendamentos) {
        try {
          // Se já tem evento no Google Calendar, pular
          if (agendamento.google_calendar_event_id) {
            success++;
            continue;
          }

          // Criar evento no Google Calendar
          const eventId = await this.createEvent(
            agendamento,
            agendamento.funcionario,
            agendamento.servico
          );

          if (eventId) {
            // Atualizar o agendamento com o ID do evento
            await agendamentoService.update(agendamento.id, {
              google_calendar_event_id: eventId
            });
            success++;
          } else {
            errors++;
          }
        } catch (error) {
          console.error(`Erro ao sincronizar agendamento ${agendamento.id}:`, error);
          errors++;
        }
      }

      return { success, errors, total };
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