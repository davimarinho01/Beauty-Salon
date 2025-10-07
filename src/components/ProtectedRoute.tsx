import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, Spinner, VStack, Text } from '@chakra-ui/react'
import { useAuth } from '../contexts/AuthContext'
import type { UserRole } from '../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  fallbackPath?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/login'
}) => {
  const { isAuthenticated, isLoading, checkPermission } = useAuth()
  const location = useLocation()

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text color="gray.600">Verificando autenticação...</Text>
        </VStack>
      </Box>
    )
  }

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  // Se há role requerido, verificar permissão
  if (requiredRole && !checkPermission(requiredRole)) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={8}
      >
        <VStack spacing={4} textAlign="center">
          <Text fontSize="6xl">🚫</Text>
          <Text fontSize="2xl" fontWeight="bold" color="red.500">
            Acesso Negado
          </Text>
          <Text color="gray.600">
            Você não tem permissão para acessar esta página.
          </Text>
          <Text fontSize="sm" color="gray.500">
            Role necessário: <strong>{requiredRole}</strong>
          </Text>
        </VStack>
      </Box>
    )
  }

  // Se passou por todas as verificações, renderizar o conteúdo
  return <>{children}</>
}

// Componente para proteger rotas apenas para admin
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  )
}

// Componente para proteger rotas que recepção também pode acessar
export const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
}
