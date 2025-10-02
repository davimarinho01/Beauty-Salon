# 🧪 PLANO DE TESTES - Beauty Salon Dashboard

## 📋 **CENÁRIOS DE TESTE**

### **1. AUTENTICAÇÃO E AUTORIZAÇÃO**

#### **1.1 Login - Casos de Sucesso**

- [ ] **T001**: Login Admin com credenciais corretas

  - **Dados**: `admin@beautysalon.com` / `admin123`
  - **Esperado**: Redirecionamento para Dashboard principal (`/`)
  - **Sidebar**: 9 itens visíveis (todas as funcionalidades)

- [ ] **T002**: Login Recepção com credenciais corretas

  - **Dados**: `recepcao@beautysalon.com` / `recepcao123`
  - **Esperado**: Redirecionamento para Financeiro (`/financeiro`)
  - **Sidebar**: 2 itens visíveis (Financeiro + Agendamento)

- [ ] **T003**: Login automático com botões rápidos
  - **Ação**: Clicar botão "Admin" ou "Recepção"
  - **Esperado**: Preenchimento automático + login direto

#### **1.2 Login - Casos de Erro**

- [ ] **T004**: Email inválido

  - **Dados**: `email-invalido` / `senha123`
  - **Esperado**: Erro "E-mail inválido"

- [ ] **T005**: Senha incorreta

  - **Dados**: `admin@beautysalon.com` / `senhaerrada`
  - **Esperado**: Erro "E-mail ou senha incorretos"

- [ ] **T006**: Email não existente

  - **Dados**: `inexistente@email.com` / `senha123`
  - **Esperado**: Erro "E-mail ou senha incorretos"

- [ ] **T007**: Campos vazios
  - **Dados**: Email ou senha em branco
  - **Esperado**: Validação de campo obrigatório

#### **1.3 Logout**

- [ ] **T008**: Logout do sistema
  - **Ação**: Clicar botão de logout na sidebar
  - **Esperado**: Redirecionamento para `/login`

---

### **2. CONTROLE DE ACESSO POR ROLE**

#### **2.1 Usuário Admin - Acesso Total**

- [ ] **T009**: Acessar todas as páginas como Admin
  - **Páginas**: `/`, `/financeiro`, `/agendamento`, `/servicos`, `/extrato`, `/pagamentos`, `/funcionarios`, `/usuarios`, `/configuracoes`
  - **Esperado**: Acesso liberado para todas

#### **2.2 Usuário Recepção - Acesso Restrito**

- [ ] **T010**: Acessar páginas permitidas como Recepção

  - **Páginas**: `/financeiro`, `/agendamento`
  - **Esperado**: Acesso liberado

- [ ] **T011**: Tentar acessar páginas restritas como Recepção
  - **Páginas**: `/`, `/servicos`, `/extrato`, `/pagamentos`, `/funcionarios`, `/usuarios`, `/configuracoes`
  - **Esperado**: Bloqueio de acesso ou redirecionamento

#### **2.3 Sidebar - Visibilidade por Role**

- [ ] **T012**: Sidebar Admin - Ver todos os itens

  - **Itens Visíveis**: Principal, Financeiro, Agendamento, Serviços, Extrato, Pagamentos, Funcionários, Usuários, Configurações (9 total)

- [ ] **T013**: Sidebar Recepção - Ver apenas itens permitidos
  - **Itens Visíveis**: Financeiro, Agendamento (2 total)
  - **Itens Ocultos**: Principal + 6 outros (deve estar completamente ausente)

---

### **3. NAVEGAÇÃO E ROTAS**

#### **3.1 Rotas Protegidas**

- [ ] **T014**: Acesso direto a páginas sem login

  - **URLs**: Qualquer página exceto `/login`
  - **Esperado**: Redirecionamento automático para `/login`

- [ ] **T015**: Navegação entre páginas permitidas
  - **Ação**: Clicar nos itens da sidebar
  - **Esperado**: Mudança de página sem problemas

#### **3.2 Redirecionamentos**

- [ ] **T016**: Redirecionamento após login Admin

  - **Esperado**: Vai para `/` (Dashboard principal)

- [ ] **T017**: Redirecionamento após login Recepção

  - **Esperado**: Vai para `/financeiro`

- [ ] **T018**: Acesso à rota raiz quando já logado
  - **Cenário**: Acessar `http://localhost:3001/` estando logado
  - **Esperado**: Admin vê Dashboard | Recepção é redirecionado

---

### **4. INTERFACE DO USUÁRIO**

#### **4.1 Tema (Modo Escuro/Claro)**

- [ ] **T019**: Alternar entre modo claro e escuro

  - **Ação**: Clicar no toggle de tema
  - **Esperado**: Mudança visual consistente em todas as páginas

- [ ] **T020**: Persistência do tema
  - **Ação**: Mudar tema, fazer logout e login novamente
  - **Esperado**: Tema escolhido deve ser mantido

#### **4.2 Responsividade**

- [ ] **T021**: Interface em desktop (1920x1080)
- [ ] **T022**: Interface em tablet (768x1024)
- [ ] **T023**: Interface em mobile (375x667)

#### **4.3 Componentes da Sidebar**

- [ ] **T024**: Informações do usuário na sidebar

  - **Exibição**: Nome, role, avatar (se aplicável)

- [ ] **T025**: Estados visuais dos itens da sidebar
  - **Estados**: Normal, hover, ativo (página atual)

---

### **5. FUNCIONALIDADES PRINCIPAIS**

#### **5.1 Dashboard (Apenas Admin)**

- [ ] **T026**: Carregar Dashboard principal
  - **Dados**: Métricas, gráficos, cards de resumo
  - **Performance**: Carregamento em menos de 3 segundos

#### **5.2 Financeiro (Admin + Recepção)**

- [ ] **T027**: Acessar módulo Financeiro
  - **Funcionalidades**: Entradas, saídas, relatórios

#### **5.3 Agendamento (Admin + Recepção)**

- [ ] **T028**: Acessar módulo Agendamento
  - **Funcionalidades**: Calendário, novo agendamento, edição

#### **5.4 Gerenciamento de Usuários (Apenas Admin)**

- [ ] **T029**: Criar novo usuário
- [ ] **T030**: Editar usuário existente
- [ ] **T031**: Desativar usuário
- [ ] **T032**: Listar todos os usuários

---

### **6. SEGURANÇA**

#### **6.1 Proteção de Rotas**

- [ ] **T033**: URLs diretas sem autenticação
- [ ] **T034**: Manipulação de tokens/localStorage
- [ ] **T035**: Tentativa de acesso por usuário deslogado

#### **6.2 Validação de Dados**

- [ ] **T036**: Injection em campos de login
- [ ] **T037**: Caracteres especiais em formulários

---

### **7. PERFORMANCE E QUALIDADE**

#### **7.1 Performance**

- [ ] **T038**: Tempo de carregamento inicial < 5s
- [ ] **T039**: Navegação entre páginas < 1s
- [ ] **T040**: Memory leaks em navegação extensa

#### **7.2 Acessibilidade**

- [ ] **T041**: Navegação por teclado (Tab)
- [ ] **T042**: Contraste de cores adequado
- [ ] **T043**: Screen readers compatibility

---

### **8. INTEGRAÇÃO**

#### **8.1 Banco de Dados (Supabase)**

- [ ] **T044**: Conexão com Supabase
- [ ] **T045**: Consultas e atualizações de dados
- [ ] **T046**: Tratamento de erros de conexão

#### **8.2 Autenticação Database**

- [ ] **T047**: Hash de senhas bcrypt
- [ ] **T048**: Verificação de tentativas de login
- [ ] **T049**: Bloqueio temporário após tentativas

---

## **🚀 COMO EXECUTAR OS TESTES**

### **Preparação:**

1. ✅ Execute o SQL no Supabase (senhas corretas)
2. ✅ Sistema rodando em `http://localhost:3001`
3. ✅ Banco configurado com usuários de teste

### **Dados de Teste:**

```
ADMIN:
- Email: admin@beautysalon.com
- Senha: admin123
- Acesso: Todas as 9 funcionalidades

RECEPÇÃO:
- Email: recepcao@beautysalon.com
- Senha: recepcao123
- Acesso: Apenas Financeiro + Agendamento
```

### **Browsers de Teste:**

- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Edge (Desktop)
- [ ] Safari (Mac - se disponível)
- [ ] Mobile browsers

---

## **📊 RELATÓRIO DE RESULTADOS**

### **Status dos Testes:**

- ✅ **Passou**: Funciona conforme esperado
- ❌ **Falhou**: Não funciona ou tem bug
- ⚠️ **Parcial**: Funciona mas tem problemas menores
- ⏭️ **Pendente**: Ainda não testado

### **Critérios de Aceitação:**

- **95%+ dos testes passando** = Sistema aprovado para produção
- **85-94% dos testes passando** = Correções menores necessárias
- **< 85% dos testes passando** = Revisão maior necessária

---

**Total de Testes: 49 cenários**
**Tempo Estimado: 4-6 horas para execução completa**
