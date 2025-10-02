import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import Login from '../../src/pages/Login'
import { AuthProvider } from '../../src/contexts/AuthContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'

// Mock do databaseAuthService
const mockLogin = vi.fn()
vi.mock('../../src/services/databaseAuth', () => ({
  databaseAuthService: {
    login: mockLogin,
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}))

// Mock do useAuth
const mockUseAuth = {
  login: mockLogin,
  isAuthenticated: false,
  isLoading: false,
  user: null,
}

vi.mock('../../src/contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../src/contexts/AuthContext')
  return {
    ...actual,
    useAuth: () => mockUseAuth,
  }
})

// Componente de teste wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </ChakraProvider>
)

describe('🔐 Login - Autenticação', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.isAuthenticated = false
    mockUseAuth.user = null
  })

  describe('📱 Interface do Login', () => {
    it('T001: Deve renderizar formulário de login', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      expect(screen.getByText('Beauty Salon')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Digite seu e-mail')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Digite sua senha')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    })

    it('T002: Interface limpa e profissional', () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      // Verificar que não há botões de acesso rápido (removidos para produção)
      expect(screen.queryByRole('button', { name: /admin/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /recepção/i })).not.toBeInTheDocument()
      
      // Verificar que não há credenciais expostas
      expect(screen.queryByText(/admin@beautysalon.com/)).not.toBeInTheDocument()
      expect(screen.queryByText(/recepcao@beautysalon.com/)).not.toBeInTheDocument()
    })
  })

  describe('✅ Validação de Formulário', () => {
    it('T004: Deve validar email obrigatório', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const submitButton = screen.getByRole('button', { name: /entrar/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('E-mail é obrigatório')).toBeInTheDocument()
      })
    })

    it('T005: Deve validar formato do email', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByPlaceholderText('Digite seu e-mail')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      fireEvent.change(emailInput, { target: { value: 'email-invalido' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('E-mail inválido')).toBeInTheDocument()
      })
    })

    it('T006: Deve validar senha obrigatória', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByPlaceholderText('Digite seu e-mail')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      fireEvent.change(emailInput, { target: { value: 'admin@beautysalon.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument()
      })
    })

    it('T007: Deve validar tamanho mínimo da senha', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByPlaceholderText('Digite seu e-mail')
      const passwordInput = screen.getByPlaceholderText('Digite sua senha')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      fireEvent.change(emailInput, { target: { value: 'admin@beautysalon.com' } })
      fireEvent.change(passwordInput, { target: { value: '123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Senha deve ter no mínimo 6 caracteres')).toBeInTheDocument()
      })
    })
  })

  describe('🔄 Funcionalidade de Login', () => {
    it('T008: Deve fazer login com credenciais válidas', async () => {
      const mockUser = {
        id: '1',
        email: 'admin@beautysalon.com',
        nome: 'Admin',
        role: 'admin' as const,
        ativo: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      }

      mockLogin.mockResolvedValueOnce(mockUser)

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByPlaceholderText('Digite seu e-mail')
      const passwordInput = screen.getByPlaceholderText('Digite sua senha')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      fireEvent.change(emailInput, { target: { value: 'admin@beautysalon.com' } })
      fireEvent.change(passwordInput, { target: { value: 'admin123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin@beautysalon.com', 'admin123')
      })
    })

    it('T009: Deve mostrar erro para credenciais inválidas', async () => {
      mockLogin.mockRejectedValueOnce(new Error('E-mail ou senha incorretos'))

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByPlaceholderText('Digite seu e-mail')
      const passwordInput = screen.getByPlaceholderText('Digite sua senha')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      fireEvent.change(emailInput, { target: { value: 'admin@beautysalon.com' } })
      fireEvent.change(passwordInput, { target: { value: 'senhaerrada' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('E-mail ou senha incorretos')).toBeInTheDocument()
      })
    })

    it('T010: Login manual funciona corretamente', async () => {
      const mockUser = {
        id: '1',
        email: 'admin@beautysalon.com',
        nome: 'Admin',
        role: 'admin' as const,
        ativo: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      }

      mockLogin.mockResolvedValueOnce(mockUser)

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByPlaceholderText('Digite seu e-mail')
      const passwordInput = screen.getByPlaceholderText('Digite sua senha')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      fireEvent.change(emailInput, { target: { value: 'admin@beautysalon.com' } })
      fireEvent.change(passwordInput, { target: { value: 'admin123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin@beautysalon.com', 'admin123')
      })
    })

    it('T011: Formulário seguro para produção', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      // Verificar que não há preenchimento automático de credenciais
      const emailInput = screen.getByPlaceholderText('Digite seu e-mail')
      const passwordInput = screen.getByPlaceholderText('Digite sua senha')
      
      expect(emailInput).toHaveValue('')
      expect(passwordInput).toHaveValue('')
      
      // Verificar que não há informações sensíveis expostas
      expect(screen.queryByText(/credenciais de desenvolvimento/i)).not.toBeInTheDocument()
    })
  })

  describe('👁️ Visualização de Senha', () => {
    it('T012: Deve alternar visibilidade da senha', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const passwordInput = screen.getByPlaceholderText('Digite sua senha')
      const toggleButton = screen.getByLabelText(/mostrar senha/i)

      // Inicialmente deve ser tipo password
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Clicar para mostrar
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      // Clicar para ocultar
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('🔄 Loading States', () => {
    it('T013: Deve mostrar loading durante login', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      const emailInput = screen.getByPlaceholderText('Digite seu e-mail')
      const passwordInput = screen.getByPlaceholderText('Digite sua senha')
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      fireEvent.change(emailInput, { target: { value: 'admin@beautysalon.com' } })
      fireEvent.change(passwordInput, { target: { value: 'admin123' } })
      fireEvent.click(submitButton)

      expect(screen.getByText('Entrando...')).toBeInTheDocument()
    })

    it('T014: Interface profissional sem elementos de desenvolvimento', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      )

      // Verificar que elementos de desenvolvimento foram removidos
      expect(screen.queryByText(/acesso rápido/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/desenvolvimento/i)).not.toBeInTheDocument()
      
      // Interface deve ter apenas o essencial
      expect(screen.getByText('Beauty Salon')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Digite seu e-mail')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Digite sua senha')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    })
  })
})