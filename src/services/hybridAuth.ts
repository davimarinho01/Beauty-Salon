import { supabase } from './supabase'
import { authService } from './auth'
import { databaseAuthService } from './databaseAuth'
import type { User } from '../types'

class HybridAuthService {
  private useDatabaseAuth = false
  private initialized = false

  /**
   * Verificar se a tabela users existe e determinar qual serviço usar
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Tentar fazer uma consulta simples na tabela users
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role')
        .limit(1)

      // Se não deu erro e retornou dados ou array vazio, a tabela existe
      this.useDatabaseAuth = !error && data !== null
      
      if (this.useDatabaseAuth) {
        console.log('✅ Sistema de auth: Database (tabela users encontrada)')
      } else {
        console.log('📝 Sistema de auth: Mock (erro:', error?.message || 'desconhecido', ')')
      }
    } catch (error) {
      console.log('📝 Usando sistema de autenticação mock (erro na conexão:', error, ')')
      this.useDatabaseAuth = false
    } finally {
      this.initialized = true
    }
  }

  /**
   * Login com detecção automática do sistema
   */
  async login(email: string, password: string): Promise<User> {
    await this.initialize()
    
    if (this.useDatabaseAuth) {
      return await databaseAuthService.login(email, password)
    } else {
      return await authService.login({ email, password })
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    if (this.useDatabaseAuth) {
      return await databaseAuthService.logout()
    } else {
      return await authService.logout()
    }
  }

  /**
   * Obter usuário atual
   */
  async getCurrentUser(): Promise<User | null> {
    await this.initialize()
    
    if (this.useDatabaseAuth) {
      return await databaseAuthService.getCurrentUser()
    } else {
      return await authService.getCurrentUser()
    }
  }

  /**
   * Verificar se está usando banco de dados
   */
  async isUsingDatabase(): Promise<boolean> {
    await this.initialize()
    return this.useDatabaseAuth
  }

  /**
   * Obter credenciais padrão (para demonstração)
   */
  getDefaultCredentials() {
    return authService.getDefaultCredentials()
  }

  /**
   * Criar usuário (apenas se usando database)
   */
  async createUser(userData: any): Promise<User> {
    await this.initialize()
    
    if (!this.useDatabaseAuth) {
      throw new Error('Funcionalidade disponível apenas com banco de dados configurado')
    }
    
    return await databaseAuthService.createUser(userData)
  }

  /**
   * Listar usuários (apenas se usando database)
   */
  async getUsers(): Promise<User[]> {
    await this.initialize()
    
    if (!this.useDatabaseAuth) {
      throw new Error('Funcionalidade disponível apenas com banco de dados configurado')
    }
    
    return await databaseAuthService.getUsers()
  }

  /**
   * Atualizar usuário (apenas se usando database)
   */
  async updateUser(userId: string, userData: any): Promise<User> {
    await this.initialize()
    
    if (!this.useDatabaseAuth) {
      throw new Error('Funcionalidade disponível apenas com banco de dados configurado')
    }
    
    return await databaseAuthService.updateUser(userId, userData)
  }

  /**
   * Desativar usuário (apenas se usando database)
   */
  async deactivateUser(userId: string): Promise<void> {
    await this.initialize()
    
    if (!this.useDatabaseAuth) {
      throw new Error('Funcionalidade disponível apenas com banco de dados configurado')
    }
    
    return await databaseAuthService.deactivateUser(userId)
  }
}

export const hybridAuthService = new HybridAuthService()