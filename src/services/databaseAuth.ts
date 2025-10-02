import bcrypt from 'bcryptjs'
import { supabase } from './supabase'
import type { User, UserRole } from '../types'

// Interface para criação de usuário
interface CreateUserData {
  nome: string
  sobrenome: string
  email: string
  password: string
  role: UserRole
  telefone?: string
  observacoes?: string
}

// Interface para atualização de usuário
interface UpdateUserData {
  nome?: string
  sobrenome?: string
  email?: string
  password?: string
  role?: UserRole
  telefone?: string
  ativo?: boolean
  avatar_url?: string
  tema_preferido?: 'light' | 'dark'
  observacoes?: string
}

class DatabaseAuthService {
  private readonly saltRounds = 10

  /**
   * Fazer login com verificação no banco de dados
   */
  async login(email: string, password: string): Promise<User> {
    try {
      console.log('🔐 Tentando login para:', email);
      console.log('🔑 Senha fornecida:', password);
      
      // Buscar usuário por email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('ativo', true)
        .single()

      if (error || !user) {
        console.log('❌ Usuário não encontrado:', error);
        throw new Error('E-mail ou senha incorretos')
      }

      console.log('👤 Usuário encontrado:', {
        id: user.id,
        email: user.email,
        role: user.role,
        hasHash: !!user.password_hash,
        hashLength: user.password_hash?.length
      });

      // Verificar se o usuário não está bloqueado
      if (user.bloqueado_ate && new Date(user.bloqueado_ate) > new Date()) {
        console.log('🚫 Usuário bloqueado até:', user.bloqueado_ate);
        throw new Error('Usuário temporariamente bloqueado. Tente novamente mais tarde.')
      }

      // Verificar senha
      console.log('🔍 Comparando senha com hash...');
      const senhaCorreta = await bcrypt.compare(password, user.password_hash)
      console.log('✅ Resultado da comparação:', senhaCorreta);
      
      if (!senhaCorreta) {
        // Incrementar tentativas de login
        console.log('❌ Senha incorreta, incrementando tentativas');
        await this.incrementarTentativasLogin(user.id)
        throw new Error('E-mail ou senha incorretos')
      }

      // Login bem-sucedido - resetar tentativas e atualizar último login
      await this.loginBemSucedido(user.id)

      // Remover campos sensíveis antes de retornar
      const { password_hash, tentativas_login, bloqueado_ate, ...userData } = user
      
      // Salvar token no localStorage
      localStorage.setItem('auth_token', user.id)
      localStorage.setItem('user_data', JSON.stringify(userData))

      return userData as User
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  /**
   * Logout do usuário
   */
  async logout(): Promise<void> {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  }

  /**
   * Obter usuário atual do localStorage ou validar no banco
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')

      if (!token || !userData) {
        return null
      }

      // Validar se o usuário ainda existe e está ativo
      const { data: user, error } = await supabase
        .from('users')
        .select('id, ativo')
        .eq('id', token)
        .eq('ativo', true)
        .single()

      if (error || !user) {
        // Token inválido - limpar localStorage
        await this.logout()
        return null
      }

      return JSON.parse(userData) as User
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error)
      await this.logout()
      return null
    }
  }

  /**
   * Criar novo usuário (apenas admin)
   */
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Hash da senha
      const password_hash = await bcrypt.hash(userData.password, this.saltRounds)

      // Inserir usuário no banco
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          nome: userData.nome,
          sobrenome: userData.sobrenome,
          email: userData.email.toLowerCase(),
          password_hash,
          role: userData.role,
          telefone: userData.telefone,
          observacoes: userData.observacoes,
          ativo: true
        })
        .select('id, nome, sobrenome, email, role, ativo, telefone, avatar_url, created_at, updated_at')
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('E-mail já está em uso')
        }
        throw new Error('Erro ao criar usuário: ' + error.message)
      }

      return user as User
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      throw error
    }
  }

  /**
   * Atualizar usuário
   */
  async updateUser(userId: string, userData: UpdateUserData): Promise<User> {
    try {
      const updateData: any = { ...userData }

      // Se está atualizando senha, fazer hash
      if (userData.password) {
        updateData.password_hash = await bcrypt.hash(userData.password, this.saltRounds)
        delete updateData.password
      }

      const { data: user, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select('id, nome, sobrenome, email, role, ativo, telefone, avatar_url, created_at, updated_at')
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new Error('E-mail já está em uso')
        }
        throw new Error('Erro ao atualizar usuário: ' + error.message)
      }

      // Se é o usuário atual, atualizar localStorage
      const currentToken = localStorage.getItem('auth_token')
      if (currentToken === userId) {
        localStorage.setItem('user_data', JSON.stringify(user))
      }

      return user as User
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      throw error
    }
  }

  /**
   * Listar todos os usuários (apenas admin)
   */
  async getUsers(): Promise<User[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, nome, sobrenome, email, role, ativo, telefone, avatar_url, ultimo_login, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error('Erro ao listar usuários: ' + error.message)
      }

      return users as User[]
    } catch (error) {
      console.error('Erro ao listar usuários:', error)
      throw error
    }
  }

  /**
   * Desativar usuário (soft delete)
   */
  async deactivateUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ ativo: false })
        .eq('id', userId)

      if (error) {
        throw new Error('Erro ao desativar usuário: ' + error.message)
      }
    } catch (error) {
      console.error('Erro ao desativar usuário:', error)
      throw error
    }
  }

  /**
   * Alterar senha do usuário
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Verificar senha atual
      const { data: user, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single()

      if (error || !user) {
        throw new Error('Usuário não encontrado')
      }

      const senhaCorreta = await bcrypt.compare(currentPassword, user.password_hash)
      if (!senhaCorreta) {
        throw new Error('Senha atual incorreta')
      }

      // Atualizar com nova senha
      const password_hash = await bcrypt.hash(newPassword, this.saltRounds)
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash })
        .eq('id', userId)

      if (updateError) {
        throw new Error('Erro ao alterar senha: ' + updateError.message)
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      throw error
    }
  }

  /**
   * Incrementar tentativas de login falhado
   */
  private async incrementarTentativasLogin(userId: string): Promise<void> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('tentativas_login')
        .eq('id', userId)
        .single()

      const tentativas = (user?.tentativas_login || 0) + 1
      const updateData: any = { tentativas_login: tentativas }

      // Bloquear após 5 tentativas por 30 minutos
      if (tentativas >= 5) {
        const bloqueadoAte = new Date()
        bloqueadoAte.setMinutes(bloqueadoAte.getMinutes() + 30)
        updateData.bloqueado_ate = bloqueadoAte.toISOString()
      }

      await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
    } catch (error) {
      console.error('Erro ao incrementar tentativas:', error)
    }
  }

  /**
   * Resetar tentativas após login bem-sucedido
   */
  private async loginBemSucedido(userId: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({
          tentativas_login: 0,
          bloqueado_ate: null,
          ultimo_login: new Date().toISOString()
        })
        .eq('id', userId)
    } catch (error) {
      console.error('Erro ao atualizar login bem-sucedido:', error)
    }
  }

  /**
   * Verificar se email já existe
   */
  async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())

      if (excludeUserId) {
        query = query.neq('id', excludeUserId)
      }

      const { data } = await query.single()
      return !!data
    } catch (error) {
      return false
    }
  }
}

export const databaseAuthService = new DatabaseAuthService()