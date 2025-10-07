import React, { createContext, useContext, useEffect, useState } from 'react'
import { useToast } from '@chakra-ui/react'
import type { AuthContextType, AuthState, UserRole } from '../types'
import { databaseAuthService as authService } from '../services/databaseAuth'

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  })
  const toast = useToast()

  // Verificar se há um usuário logado ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await authService.getCurrentUser()
        if (user) {
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          })
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        })
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const user = await authService.login(email, password)
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      })

      toast({
        title: 'Login realizado com sucesso!',
        description: `Bem-vindo(a), ${user.nome}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      })

      toast({
        title: 'Erro no login',
        description: error instanceof Error ? error.message : 'Credenciais inválidas',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      throw error
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await authService.logout()
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      })

      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  const checkPermission = (requiredRole?: UserRole): boolean => {
    if (!authState.isAuthenticated || !authState.user) {
      return false
    }

    // Admin tem acesso a tudo
    if (authState.user.role === 'admin') {
      return true
    }

    // Se não há role específico requerido, usuário autenticado tem acesso
    if (!requiredRole) {
      return true
    }

    // Verificar se o role do usuário é suficiente
    return authState.user.role === requiredRole
  }

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    checkPermission
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
