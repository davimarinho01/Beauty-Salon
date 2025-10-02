# 🗄️ Configuração do Banco de Dados (Supabase)

## 📋 Passo a Passo

### 1. Criar Conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub ou crie uma conta
4. Clique em "New Project"

### 2. Configurar o Projeto

1. **Organization:** Escolha ou crie uma organização
2. **Project Name:** `beauty-salon-dashboard`
3. **Database Password:** Anote essa senha (importante!)
4. **Region:** Escolha a mais próxima (ex: South America)
5. **Pricing Plan:** Free (0$/mês - suficiente para começar)
6. Clique em "Create new project"

⏱️ **Aguarde 2-3 minutos** para o projeto ser criado.

### 3. Obter Credenciais

1. No painel do projeto, vá em **Settings > API**
2. Copie os valores:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **Project API keys > anon public** (chave longa)

### 4. Configurar Variáveis de Ambiente

1. Na pasta do projeto, copie o arquivo `.env.example` para `.env`
2. Substitua os valores:

```bash
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA-CHAVE-ANONIMA-AQUI
```

### 5. Criar as Tabelas

1. No Supabase, vá em **SQL Editor**
2. Copie todo o conteúdo do arquivo `database/schema.sql`
3. Cole no editor e clique em **Run**
4. ✅ Deve aparecer "Success. No rows returned"

### 6. Verificar Instalação

1. Vá em **Table Editor** no Supabase
2. Deve ver as tabelas: `funcionarios`, `servicos`, `movimentacoes_financeiras`, `agendamentos`
3. Cada tabela deve ter alguns dados de exemplo

## 🚨 Problemas Comuns

### "Cannot connect to database"

- ✅ Verifique se as variáveis no `.env` estão corretas
- ✅ Confirme que o projeto no Supabase está ativo
- ✅ Teste a conexão no SQL Editor do Supabase

### "Table doesn't exist"

- ✅ Execute novamente o script `schema.sql`
- ✅ Verifique se todas as tabelas foram criadas

### "Permission denied"

- ✅ As políticas RLS estão configuradas para permitir acesso
- ✅ Verifique se está usando a chave `anon` correta

## 🎯 Funcionalidades Disponíveis

Com o banco configurado, você terá:

- ✅ **Dashboard** com estatísticas reais
- ✅ **Financeiro** para registrar entradas e saídas
- ✅ **Dados de exemplo** para testar o sistema
- ✅ **Backup automático** (Supabase cuida disso)
- ✅ **Interface web** para gerenciar dados

## 📊 Dados de Exemplo

O script cria automaticamente:

- **3 funcionários** (Maria, Ana, Julia)
- **5 serviços** (Corte, Manicure, Limpeza de Pele, etc.)
- **Movimentações financeiras** dos últimos dias
- **Estrutura completa** para o sistema

## 💡 Próximos Passos

Após configurar o banco:

1. Teste o sistema no navegador
2. Registre algumas entradas/saídas
3. Veja as estatísticas atualizando em tempo real
4. Configure as próximas funcionalidades (Serviços, Agendamento)

---

💝 **Supabase Free Tier:** 500MB de banco, 50MB de storage, 50K requisições/mês - mais que suficiente para começar!
