# 📁 SQL Scripts - Organização

## 📂 Estrutura da Pasta

### 🔧 **Scripts Ativos (Raiz)**

Scripts importantes que podem ser necessários no futuro:

- `migration_complete.sql` - **✅ PRINCIPAL** - Script completo de migração do sistema
- `fix_complete_auth.sql` - Correções de autenticação
- `fix_passwords_final.sql` - Correções finais de senhas
- `fix_rls_policies.sql` - Políticas RLS (Row Level Security)
- `update_passwords.sql` - Atualização de senhas
- `users_table.sql` - Criação da tabela de usuários

### 📚 **Histórico (./historico/)**

Scripts já aplicados e arquivados para referência:

- `add_horario_fim_agendamentos.sql` - ✅ Aplicado - Adição do campo horário_fim
- `create_eventos_google_table.sql` - ✅ Aplicado - Tabela eventos Google Calendar
- `create_multiple_services_tables.sql` - ✅ Aplicado - Tabelas múltiplos serviços
- `fix_agendamentos_nullable.sql` - ✅ Aplicado - Correção campos nullable

## 🚀 **Para Deploy/Instalação**

Use apenas: `migration_complete.sql` - contém todas as migrações necessárias.

## 🧹 **Limpeza Realizada**

Removidos arquivos temporários:

- `test_*.sql` (scripts de teste)
- `quick_test.sql` (teste rápido)
- `check_nullable_columns.sql` (verificação temporária)
