import type { User, LoginCredentials, UserRole, RolePermissions } from '../types'

// Usuários padrão do sistema (em produção, estes estariam no banco de dados)
const defaultUsers: (User & { password: string })[] = [
  {
    id: 'admin-001',
    nome: 'Administrador',
    sobrenome: 'Sistema',
    email: 'admin@beautysalon.com',
    password: 'admin123',
    role: 'admin',
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'recepcao-001',
    nome: 'Maria',
    sobrenome: 'Recepção',
    email: 'recepcao@beautysalon.com',
    password: 'recepcao123',
    role: 'recepcao',
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
]

// Definição de permissões por role
export const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    dashboard: { view: true, create: true, edit: true, delete: true },
    financeiro: { view: true, create: true, edit: true, delete: true },
    servicos: { view: true, create: true, edit: true, delete: true },
    agendamentos: { view: true, create: true, edit: true, delete: true },
    funcionarios: { view: true, create: true, edit: true, delete: true },
    configuracoes: { view: true, create: true, edit: true, delete: true },
  },
  recepcao: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    financeiro: { view: true, create: false, edit: false, delete: false },
    servicos: { view: true, create: false, edit: false, delete: false },
    agendamentos: { view: true, create: true, edit: true, delete: false },
    funcionarios: { view: true, create: false, edit: false, delete: false },
    configuracoes: { view: false, create: false, edit: false, delete: false },
  }
}

class AuthService {
  private static readonly TOKEN_KEY = 'beauty-salon-auth-token'
  private static readonly USER_KEY = 'beauty-salon-user'

  // Simular login (em produção, seria uma requisição para o backend)
  async login(credentials: LoginCredentials): Promise<User> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = defaultUsers.find(
      u => u.email === credentials.email && u.password === credentials.password
    )

    if (!user || !user.ativo) {
      throw new Error('Credenciais inválidas ou usuário inativo')
    }

    // Remover password do retorno
    const { password, ...userWithoutPassword } = user

    // Simular token JWT
    const token = btoa(JSON.stringify({ 
      userId: user.id, 
      role: user.role, 
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
    }))

    // Salvar no localStorage
    localStorage.setItem(AuthService.TOKEN_KEY, token)
    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(userWithoutPassword))

    // Atualizar último login
    const updatedUser = {
      ...userWithoutPassword,
      ultimo_login: new Date().toISOString()
    }

    localStorage.setItem(AuthService.USER_KEY, JSON.stringify(updatedUser))

    return updatedUser
  }

  async logout(): Promise<void> {
    localStorage.removeItem(AuthService.TOKEN_KEY)
    localStorage.removeItem(AuthService.USER_KEY)
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem(AuthService.TOKEN_KEY)
      const userStr = localStorage.getItem(AuthService.USER_KEY)

      if (!token || !userStr) {
        return null
      }

      // Verificar se o token é válido
      const tokenData = JSON.parse(atob(token))
      if (tokenData.exp < Date.now()) {
        // Token expirado
        await this.logout()
        return null
      }

      const user: User = JSON.parse(userStr)
      
      // Verificar se o usuário ainda está ativo
      const currentUserData = defaultUsers.find(u => u.id === user.id)
      if (!currentUserData || !currentUserData.ativo) {
        await this.logout()
        return null
      }

      return user
    } catch (error) {
      console.error('Erro ao recuperar usuário atual:', error)
      await this.logout()
      return null
    }
  }

  getToken(): string | null {
    return localStorage.getItem(AuthService.TOKEN_KEY)
  }

  isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      const tokenData = JSON.parse(atob(token))
      return tokenData.exp > Date.now()
    } catch {
      return false
    }
  }

  hasPermission(userRole: UserRole, module: keyof RolePermissions, action: keyof RolePermissions['dashboard']): boolean {
    const permissions = rolePermissions[userRole]
    if (!permissions || !permissions[module]) {
      return false
    }
    return permissions[module][action]
  }

  // Função para criar novos usuários (apenas para admin)
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password: string }): Promise<User> {
    // Em produção, isso seria uma requisição para o backend
    const newUser: User & { password: string } = {
      ...userData,
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Adicionar ao array de usuários (em produção, seria salvo no banco)
    defaultUsers.push(newUser)

    const { password, ...userWithoutPassword } = newUser
    return userWithoutPassword
  }

  // Obter todos os usuários (apenas para admin)
  async getAllUsers(): Promise<User[]> {
    return defaultUsers.map(({ password, ...user }) => user)
  }

  // Função utilitária para obter usuários padrão (para demonstração)
  getDefaultCredentials() {
    return {
      admin: {
        email: 'admin@beautysalon.com',
        password: 'admin123'
      },
      recepcao: {
        email: 'recepcao@beautysalon.com',
        password: 'recepcao123'
      }
    }
  }
}

export const authService = new AuthService()
