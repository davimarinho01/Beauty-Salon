// Configuração do Google Calendar API
export const GOOGLE_CALENDAR_CONFIG = {
  // Estas credenciais precisam ser configuradas no Google Cloud Console
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  REDIRECT_URI: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback',
  
  // Escopos necessários para o Calendar API
  SCOPES: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ],
  
  // ID do calendário (pode ser 'primary' para o calendário principal)
  CALENDAR_ID: import.meta.env.VITE_GOOGLE_CALENDAR_ID || 'primary',
  
  // Configurações do evento
  EVENT_DEFAULTS: {
    location: 'Salão de Beleza',
    description: 'Agendamento realizado através do sistema do salão',
    colorId: '7', // Rosa
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 dia antes
        { method: 'popup', minutes: 30 }, // 30 min antes
      ],
    },
  }
};

// Verificar se as configurações estão completas
export const isGoogleCalendarConfigured = (): boolean => {
  return !!(
    GOOGLE_CALENDAR_CONFIG.CLIENT_ID &&
    GOOGLE_CALENDAR_CONFIG.CLIENT_SECRET
  );
};