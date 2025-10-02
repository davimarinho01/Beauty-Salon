import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { Financeiro } from './pages/Financeiro'
import { Funcionarios } from './pages/Funcionarios'
import { Servicos } from './pages/Servicos'
import { Agendamento } from './pages/Agendamento'
import { Extrato } from './pages/Extrato'
import { Pagamentos } from './pages/Pagamentos'
import { Configuracoes } from './pages/Configuracoes'
import { GoogleCallback } from './pages/GoogleCallback'
import Login from './pages/Login'
import { UserManagement } from './components/UserManagement'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { AdminRoute, StaffRoute } from './components/ProtectedRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Rota pública de login */}
          <Route path="/login" element={<Login />} />
          
          {/* Rota para callback do Google Calendar - protegida */}
          <Route 
            path="/auth/google/callback" 
            element={
              <StaffRoute>
                <GoogleCallback />
              </StaffRoute>
            } 
          />
          
          {/* Rotas protegidas */}
          <Route path="/" element={
            <StaffRoute>
              <Layout />
            </StaffRoute>
          }>
            {/* Dashboard - APENAS ADMIN */}
            <Route index element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } />
            
            {/* Financeiro - todos os usuários */}
            <Route path="financeiro" element={<Financeiro />} />
            
            {/* Agendamentos - todos os usuários */}
            <Route path="agendamento" element={<Agendamento />} />
            
            {/* === ROTAS APENAS PARA ADMIN === */}
            
            {/* Funcionários - apenas Admin */}
            <Route path="funcionarios" element={
              <AdminRoute>
                <Funcionarios />
              </AdminRoute>
            } />
            
            {/* Serviços - apenas Admin */}
            <Route path="servicos" element={
              <AdminRoute>
                <Servicos />
              </AdminRoute>
            } />
            
            {/* Extrato - apenas Admin */}
            <Route path="extrato" element={
              <AdminRoute>
                <Extrato />
              </AdminRoute>
            } />
            
            {/* Pagamentos - apenas Admin */}
            <Route path="pagamentos" element={
              <AdminRoute>
                <Pagamentos />
              </AdminRoute>
            } />
            
            {/* Gerenciamento de Usuários - apenas Admin */}
            <Route path="usuarios" element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            } />
            
            {/* Configurações - apenas Admin */}
            <Route path="configuracoes" element={
              <AdminRoute>
                <Configuracoes />
              </AdminRoute>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App;