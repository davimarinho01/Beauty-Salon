import { GOOGLE_CALENDAR_CONFIG } from '../config/googleCalendar';

export interface GoogleAuthTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

class GoogleAuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiryDate: number | null = null;

  // Gerar URL de autorização
  getAuthUrl(): string {
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: GOOGLE_CALENDAR_CONFIG.CLIENT_ID,
      redirect_uri: GOOGLE_CALENDAR_CONFIG.REDIRECT_URI,
      scope: GOOGLE_CALENDAR_CONFIG.SCOPES.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  // Trocar código de autorização por tokens
  async exchangeCodeForTokens(code: string): Promise<GoogleAuthTokens> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CALENDAR_CONFIG.CLIENT_ID,
          client_secret: GOOGLE_CALENDAR_CONFIG.CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: GOOGLE_CALENDAR_CONFIG.REDIRECT_URI,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens: GoogleAuthTokens = await response.json();
      
      // Armazenar tokens
      this.setTokens(tokens);
      
      return tokens;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  // Definir tokens
  setTokens(tokens: GoogleAuthTokens): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token || null;
    this.expiryDate = tokens.expiry_date || null;

    // Salvar no localStorage para persistência
    localStorage.setItem('google_access_token', tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem('google_refresh_token', tokens.refresh_token);
    }
    if (tokens.expiry_date) {
      localStorage.setItem('google_token_expiry', tokens.expiry_date.toString());
    }
  }

  // Carregar tokens do localStorage
  loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem('google_access_token');
    this.refreshToken = localStorage.getItem('google_refresh_token');
    const expiryStr = localStorage.getItem('google_token_expiry');
    this.expiryDate = expiryStr ? parseInt(expiryStr) : null;
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    this.loadTokensFromStorage();
    return !!(this.accessToken && (!this.expiryDate || this.expiryDate > Date.now()));
  }

  // Obter token de acesso válido
  async getValidAccessToken(): Promise<string | null> {
    this.loadTokensFromStorage();

    if (!this.accessToken) {
      return null;
    }

    // Se o token não expirou, retornar
    if (!this.expiryDate || this.expiryDate > Date.now()) {
      return this.accessToken;
    }

    // Tentar renovar o token
    if (this.refreshToken) {
      try {
        const newTokens = await this.refreshAccessToken();
        return newTokens.access_token;
      } catch (error) {
        console.error('Error refreshing token:', error);
        this.logout();
        return null;
      }
    }

    return null;
  }

  // Renovar token de acesso
  private async refreshAccessToken(): Promise<GoogleAuthTokens> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CALENDAR_CONFIG.CLIENT_ID,
        client_secret: GOOGLE_CALENDAR_CONFIG.CLIENT_SECRET,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const tokens: GoogleAuthTokens = await response.json();
    
    // Manter o refresh_token se não foi fornecido um novo
    if (!tokens.refresh_token) {
      tokens.refresh_token = this.refreshToken;
    }

    this.setTokens(tokens);
    return tokens;
  }

  // Fazer logout
  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.expiryDate = null;

    // Limpar localStorage
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_token_expiry');
  }

  // Obter headers de autorização
  getAuthHeaders(): { [key: string]: string } {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }
}

export const googleAuthService = new GoogleAuthService();