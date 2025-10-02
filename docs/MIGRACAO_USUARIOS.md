# Migração para Sistema de Usuários com Banco de Dados

Este documento explica como migrar do sistema de autenticação mock atual para um sistema real com banco de dados.

## 📋 Pré-requisitos

1. ✅ Projeto Supabase configurado
2. ✅ Biblioteca `bcryptjs` instalada
3. ✅ Acesso ao SQL Editor do Supabase

## 🚀 Passo a Passo da Migração

### 1. Executar SQL no Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Execute o arquivo `sql/users_table.sql`
4. Isso criará:
   - Tabela `users` com todos os campos necessários
   - Usuários padrão (admin e recepção)
   - Políticas de segurança (RLS)
   - Índices para performance

### 2. Atualizar o AuthContext

Substitua a importação no `src/contexts/AuthContext.tsx`:

```typescript
// Substituir esta linha:
import { authService } from "../services/auth";

// Por esta:
import { databaseAuthService as authService } from "../services/databaseAuth";
```

### 3. Testar a Migração

Execute os testes para verificar se tudo está funcionando:

```bash
npm run dev
```

## 🔐 Credenciais Padrão

Após a migração, use estas credenciais:

- **Admin**: `admin@beautysalon.com` / `admin123`
- **Recepção**: `recepcao@beautysalon.com` / `recepcao123`

## 🆕 Novas Funcionalidades Disponíveis

### Gerenciamento de Usuários

- ✅ Criação de novos usuários
- ✅ Edição de dados do usuário
- ✅ Desativação de usuários
- ✅ Alteração de senhas

### Segurança Avançada

- ✅ Senhas hasheadas com bcrypt
- ✅ Bloqueio automático após 5 tentativas
- ✅ Auditoria de login (último acesso)
- ✅ Row Level Security (RLS)

### Exemplo de Uso - Criar Usuário

```typescript
import { databaseAuthService } from "../services/databaseAuth";

// Criar novo usuário (apenas admin)
const novoUsuario = await databaseAuthService.createUser({
  nome: "João",
  sobrenome: "Silva",
  email: "joao@beautysalon.com",
  password: "senha123",
  role: "recepcao",
  telefone: "(11) 99999-9999",
});
```

### Exemplo de Uso - Alterar Senha

```typescript
// Alterar senha do usuário atual
await databaseAuthService.changePassword(userId, "senhaAtual", "novaSenha123");
```

## 🔧 Componentes para Criar

Para usar totalmente o novo sistema, você pode criar:

### 1. Página de Gerenciamento de Usuários

- Lista de usuários
- Formulário de criação/edição
- Controles de ativação/desativação

### 2. Página de Perfil do Usuário

- Editar dados pessoais
- Alterar senha
- Configurações (tema, etc.)

### 3. Funcionalidades Administrativas

- Auditoria de logins
- Relatórios de acesso
- Gestão de permissões

## ⚠️ Considerações de Segurança

1. **Senhas**: Sempre hasheadas com bcrypt (salt rounds: 10)
2. **Bloqueio**: Usuário bloqueado por 30 min após 5 tentativas
3. **RLS**: Políticas de segurança no nível do banco
4. **Tokens**: Validação contínua de tokens ativos

## 📊 Estrutura da Tabela Users

```sql
users:
  - id (UUID, PK)
  - nome (VARCHAR)
  - sobrenome (VARCHAR)
  - email (VARCHAR, UNIQUE)
  - password_hash (TEXT)
  - role (ENUM: admin|recepcao)
  - ativo (BOOLEAN)
  - avatar_url (TEXT)
  - telefone (VARCHAR)
  - ultimo_login (TIMESTAMP)
  - tentativas_login (INTEGER)
  - bloqueado_ate (TIMESTAMP)
  - tema_preferido (VARCHAR)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

## 🔄 Reversão (se necessário)

Para voltar ao sistema mock, simplesmente reverta a importação no AuthContext:

```typescript
// Voltar para:
import { authService } from "../services/auth";
```

## 🎯 Próximos Passos

Após a migração bem-sucedida, considere implementar:

1. **Interface de Usuários**: Página para gerenciar usuários
2. **Perfil do Usuário**: Página para editar dados pessoais
3. **Auditoria**: Logs de acesso e atividades
4. **Recuperação de Senha**: Sistema de reset via email
5. **Autenticação 2FA**: Segunda camada de segurança

---

**✅ Com essa migração, seu sistema terá autenticação de nível profissional!**
