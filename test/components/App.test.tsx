import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import App from '../../src/App'
import { AuthProvider } from '../../src/contexts/AuthContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'

// Mock do useAuth
const mockUseAuth = {
  isAuthenticated: false,
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  isLoading: false,
}

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock dos componentes para evitar erros de renderização
vi.mock('../../src/pages/Login', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}))

vi.mock('../../src/pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}))

vi.mock('../../src/pages/Financeiro', () => ({
  default: () => <div data-testid="financeiro-page">Financeiro Page</div>,
}))

vi.mock('../../src/pages/Agendamento', () => ({
  default: () => <div data-testid="agendamento-page">Agendamento Page</div>,
}))

vi.mock('../../src/pages/Clientes', () => ({
  default: () => <div data-testid="clientes-page">Clientes Page</div>,
}))

vi.mock('../../src/pages/Estoque', () => ({
  default: () => <div data-testid="estoque-page">Estoque Page</div>,
}))

vi.mock('../../src/pages/Funcionarios', () => ({
  default: () => <div data-testid="funcionarios-page">Funcionários Page</div>,
}))

vi.mock('../../src/pages/Relatorios', () => ({
  default: () => <div data-testid="relatorios-page">Relatórios Page</div>,
}))

vi.mock('../../src/pages/Promocoes', () => ({
  default: () => <div data-testid="promocoes-page">Promoções Page</div>,
}))

vi.mock('../../src/pages/Configuracoes', () => ({
  default: () => <div data-testid="configuracoes-page">Configurações Page</div>,
}))

// Componente de teste wrapper
const TestWrapper = ({ children, route = '/' }: { children: React.ReactNode; route?: string }) => (
  <ChakraProvider>
    <ThemeProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          {children}
        </MemoryRouter>
      </AuthProvider>
    </ThemeProvider>
  </ChakraProvider>
)

describe('🛡️ App - Controle de Acesso', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.isAuthenticated = false
    mockUseAuth.user = null
    mockUseAuth.isLoading = false
  })

  describe('🚫 Usuário Não Autenticado', () => {
    it('T029: Deve redirecionar para login se não autenticado', async () => {
      render(
        <TestWrapper route="/">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })
    })

    it('T030: Deve redirecionar para login ao acessar rota protegida', async () => {
      render(
        <TestWrapper route="/financeiro">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })
    })

    it('T031: Deve redirecionar para login ao acessar dashboard (admin only)', async () => {
      render(
        <TestWrapper route="/dashboard">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })
    })
  })

  describe('👑 Admin - Acesso Completo', () => {
    beforeEach(() => {
      mockUseAuth.isAuthenticated = true
      // Type assertion para contornar o tipo null
      (mockUseAuth as any).user = {
        id: '1',
        email: 'admin@beautysalon.com',
        nome: 'Admin',
        role: 'admin' as const,
        ativo: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      }
    })

    it('T032: Deve permitir acesso ao Dashboard (admin only)', async () => {
      render(
        <TestWrapper route="/">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
      })
    })

    it('T033: Deve permitir acesso ao Financeiro', async () => {
      render(
        <TestWrapper route="/financeiro">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('financeiro-page')).toBeInTheDocument()
      })
    })

    it('T034: Deve permitir acesso ao Agendamento', async () => {
      render(
        <TestWrapper route="/agendamento">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('agendamento-page')).toBeInTheDocument()
      })
    })

    it('T035: Deve permitir acesso aos Clientes', async () => {
      render(
        <TestWrapper route="/clientes">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('clientes-page')).toBeInTheDocument()
      })
    })

    it('T036: Deve permitir acesso ao Estoque', async () => {
      render(
        <TestWrapper route="/estoque">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('estoque-page')).toBeInTheDocument()
      })
    })

    it('T037: Deve permitir acesso aos Funcionários', async () => {
      render(
        <TestWrapper route="/funcionarios">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('funcionarios-page')).toBeInTheDocument()
      })
    })

    it('T038: Deve permitir acesso aos Relatórios', async () => {
      render(
        <TestWrapper route="/relatorios">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('relatorios-page')).toBeInTheDocument()
      })
    })

    it('T039: Deve permitir acesso às Promoções', async () => {
      render(
        <TestWrapper route="/promocoes">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('promocoes-page')).toBeInTheDocument()
      })
    })

    it('T040: Deve permitir acesso às Configurações', async () => {
      render(
        <TestWrapper route="/configuracoes">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('configuracoes-page')).toBeInTheDocument()
      })
    })
  })

  describe('👥 Recepção - Acesso Limitado', () => {
    beforeEach(() => {
      mockUseAuth.isAuthenticated = true
      // Type assertion para contornar o tipo null
      (mockUseAuth as any).user = {
        id: '2',
        email: 'recepcao@beautysalon.com',
        nome: 'Recepção',
        role: 'reception' as const,
        ativo: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      }
    })

    it('T041: NÃO deve permitir acesso ao Dashboard', async () => {
      render(
        <TestWrapper route="/">
          <App />
        </TestWrapper>
      )

      // Deve redirecionar para uma página permitida ou mostrar erro
      await waitFor(() => {
        expect(screen.queryByTestId('dashboard-page')).not.toBeInTheDocument()
      })
    })

    it('T042: Deve permitir acesso ao Financeiro', async () => {
      render(
        <TestWrapper route="/financeiro">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('financeiro-page')).toBeInTheDocument()
      })
    })

    it('T043: Deve permitir acesso ao Agendamento', async () => {
      render(
        <TestWrapper route="/agendamento">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('agendamento-page')).toBeInTheDocument()
      })
    })

    it('T044: NÃO deve permitir acesso aos Clientes', async () => {
      render(
        <TestWrapper route="/clientes">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('clientes-page')).not.toBeInTheDocument()
      })
    })

    it('T045: NÃO deve permitir acesso ao Estoque', async () => {
      render(
        <TestWrapper route="/estoque">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('estoque-page')).not.toBeInTheDocument()
      })
    })

    it('T046: NÃO deve permitir acesso aos Funcionários', async () => {
      render(
        <TestWrapper route="/funcionarios">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('funcionarios-page')).not.toBeInTheDocument()
      })
    })

    it('T047: NÃO deve permitir acesso aos Relatórios', async () => {
      render(
        <TestWrapper route="/relatorios">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('relatorios-page')).not.toBeInTheDocument()
      })
    })

    it('T048: NÃO deve permitir acesso às Promoções', async () => {
      render(
        <TestWrapper route="/promocoes">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('promocoes-page')).not.toBeInTheDocument()
      })
    })

    it('T049: NÃO deve permitir acesso às Configurações', async () => {
      render(
        <TestWrapper route="/configuracoes">
          <App />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('configuracoes-page')).not.toBeInTheDocument()
      })
    })
  })

  describe('⏳ Loading States', () => {
    it('T050: Deve mostrar loading durante carregamento da autenticação', async () => {
      mockUseAuth.isLoading = true

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // O comportamento durante loading deve ser definido no App
      // Por enquanto, vamos verificar que não mostra o login nem outras páginas
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
    })
  })
})