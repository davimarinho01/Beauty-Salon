import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import Sidebar from '../../src/components/layout/Sidebar'
import { AuthProvider } from '../../src/contexts/AuthContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'

// Mock do useAuth
const mockUseAuth = {
  isAuthenticated: true,
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  isLoading: false,
}

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock do react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  }
})

// Componente de teste wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>
    <ThemeProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </ThemeProvider>
  </ChakraProvider>
)

describe('🧭 Sidebar - Navegação', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.isAuthenticated = true
  })

  describe('👑 Admin - Acesso Completo', () => {
    beforeEach(() => {
      mockUseAuth.user = {
        id: '1',
        email: 'admin@beautysalon.com',
        nome: 'Admin',
        role: 'admin' as const,
        ativo: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      }
    })

    it('T015: Deve exibir todos os 9 itens de navegação para admin', () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      )

      // Verificar todos os itens que devem aparecer para admin
      expect(screen.getByText('Principal')).toBeInTheDocument()
      expect(screen.getByText('Financeiro')).toBeInTheDocument()
      expect(screen.getByText('Agendamento')).toBeInTheDocument()
      expect(screen.getByText('Clientes')).toBeInTheDocument()
      expect(screen.getByText('Estoque')).toBeInTheDocument()
      expect(screen.getByText('Funcionários')).toBeInTheDocument()
      expect(screen.getByText('Relatórios')).toBeInTheDocument()
      expect(screen.getByText('Promoções')).toBeInTheDocument()
      expect(screen.getByText('Configurações')).toBeInTheDocument()
    })

    it('T016: Deve exibir aba Principal para admin', () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      )

      const principalTab = screen.getByText('Principal')
      expect(principalTab).toBeInTheDocument()
      expect(principalTab.closest('button')).not.toBeDisabled()
    })

    it('T017: Deve navegar para Principal quando clicado (admin)', () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      )

      const principalButton = screen.getByText('Principal').closest('button')
      fireEvent.click(principalButton!)

      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('T018: Deve exibir ícones corretos para admin', () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      )

      // Verificar presença de ícones (usando aria-label ou data-testid)
      const principalIcon = screen.getByText('Principal').closest('button')?.querySelector('svg')
      expect(principalIcon).toBeInTheDocument()
    })
  })

  describe('👥 Recepção - Acesso Limitado', () => {
    beforeEach(() => {
      mockUseAuth.user = {
        id: '2',
        email: 'recepcao@beautysalon.com',
        nome: 'Recepção',
        role: 'reception' as const,
        ativo: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      }
    })

    it('T019: Deve exibir apenas 2 itens para recepção', () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      )

      // Verificar itens que devem aparecer
      expect(screen.getByText('Financeiro')).toBeInTheDocument()
      expect(screen.getByText('Agendamento')).toBeInTheDocument()

      // Verificar que outros itens NÃO aparecem
      expect(screen.queryByText('Principal')).not.toBeInTheDocument()
      expect(screen.queryByText('Clientes')).not.toBeInTheDocument()
      expect(screen.queryByText('Estoque')).not.toBeInTheDocument()
      expect(screen.queryByText('Funcionários')).not.toBeInTheDocument()
      expect(screen.queryByText('Relatórios')).not.toBeInTheDocument()
      expect(screen.queryByText('Promoções')).not.toBeInTheDocument()
      expect(screen.queryByText('Configurações')).not.toBeInTheDocument()
    })

    it('T020: NÃO deve exibir aba Principal para recepção', () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      )

      expect(screen.queryByText('Principal')).not.toBeInTheDocument()
    })

    it('T021: Deve permitir navegação para Financeiro (recepção)', () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      )

      const financeiroButton = screen.getByText('Financeiro').closest('button')
      fireEvent.click(financeiroButton!)

      expect(mockNavigate).toHaveBeenCalledWith('/financeiro')
    })

    it('T022: Deve permitir navegação para Agendamento (recepção)', () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      )

      const agendamentoButton = screen.getByText('Agendamento').closest('button')
      fireEvent.click(agendamentoButton!)

      expect(mockNavigate).toHaveBeenCalledWith('/agendamento')
    })
  })

  describe('🔐 Estados de Autenticação', () => {
    it('T023: Não deve renderizar se usuário não autenticado', () => {
      mockUseAuth.isAuthenticated = false
      mockUseAuth.user = null

      const { container } = render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      )

      expect(container.firstChild).toBeNull()
    })

    it('T024: Não deve renderizar se usuário é null', () => {
      mockUseAuth.isAuthenticated = true
      mockUseAuth.user = null

      const { container } = render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('🎨 Funcionalidade de Logout', () => {
    beforeEach(() => {
      mockUseAuth.user = {
        id: '1',
        email: 'admin@beautysalon.com',
        nome: 'Admin',
        role: 'admin' as const,
        ativo: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      }
    })

    it('T025: Deve exibir botão de logout', () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      )

      expect(screen.getByText('Sair')).toBeInTheDocument()
    })

    it('T026: Deve chamar logout ao clicar em Sair', () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      )

      const logoutButton = screen.getByText('Sair').closest('button')
      fireEvent.click(logoutButton!)

      expect(mockUseAuth.logout).toHaveBeenCalled()
    })
  })

  describe('🔄 Responsividade', () => {
    beforeEach(() => {
      mockUseAuth.user = {
        id: '1',
        email: 'admin@beautysalon.com',
        nome: 'Admin',
        role: 'admin' as const,
        ativo: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      }
    })

    it('T027: Deve aplicar estilos responsivos', () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      )

      const sidebar = screen.getByRole('navigation')
      expect(sidebar).toHaveClass('chakra-container')
    })

    it('T028: Deve exibir informações do usuário', () => {
      render(
        <TestWrapper>
          <Sidebar />
        </TestWrapper>
      )

      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('admin@beautysalon.com')).toBeInTheDocument()
    })
  })
})