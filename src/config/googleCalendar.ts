// Configuração do Google Calendar API

// Detectar ambiente automaticamente
const getRedirectUri = (): string => {
  if (typeof window !== 'undefined') {
    // Se está no browser, usar a URL atual
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('localhost');
    
    if (isLocalhost) {
      return `${window.location.origin}/auth/google/callback`;
    } else {
      // Em produção, usar a URL do Vercel
      return `${window.location.origin}/auth/google/callback`;
    }
  }
  
  // Fallback para desenvolvimento
  return 'http://localhost:3001/auth/google/callback';
};

export const GOOGLE_CALENDAR_CONFIG = {
  // Estas credenciais precisam ser configuradas no Google Cloud Console
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  REDIRECT_URI: getRedirectUri(),
  
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