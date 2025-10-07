# 🚀 Guia de Migração - Múltiplos Serviços e Funcionários

## 📋 Pré-requisitos

- Acesso ao painel do Supabase
- Backup do banco de dados (recomendado)
- Sistema funcionando na versão anterior

## 🔧 Passo a Passo

### 1. Fazer Backup (IMPORTANTE!)

```sql
-- No painel do Supabase, vá em Database > Backup
-- Ou exporte os dados principais:
SELECT * FROM agendamentos;
SELECT * FROM servicos;
SELECT * FROM funcionarios;
```

### 2. Aplicar a Migração Principal

```bash
# No painel do Supabase:
# 1. Vá para Database > SQL Editor
# 2. Cole o conteúdo do arquivo migration_complete.sql
# 3. Execute o script
```

### 3. Verificar se Funcionou

```bash
# Execute o arquivo quick_test.sql para verificar (uma query por vez)
# Ou use o test_simple.sql para verificação completa
# Deve mostrar:
# ✅ Tabelas criadas: agendamento_servicos, agendamento_funcionarios
# ⏰ Coluna horario_fim adicionada
# 🎯 Estruturas corretas das tabelas
# 👥 Dados existentes preservados
```

### 4. Testar na Interface

```bash
# 1. Acesse http://localhost:3001
# 2. Vá para Agendamentos
# 3. Clique em "Novo Agendamento"
# 4. Teste os botões "Adicionar Serviço" e "Adicionar Funcionário"
# 5. Crie um agendamento com múltiplos serviços
# 6. Verifique se aparece corretamente no calendário
```

## 🔍 Verificações de Funcionamento

### Interface deve mostrar:

- ✅ Botões "Adicionar Serviço" e "Adicionar Funcionário"
- ✅ Botões de remoção (ícone -)
- ✅ Cálculo automático do valor total
- ✅ Resumo detalhado com todos os serviços
- ✅ Campo de horário de término

### Banco de dados deve ter:

- ✅ Tabela `agendamento_servicos`
- ✅ Tabela `agendamento_funcionarios`
- ✅ Coluna `horario_fim` em `agendamentos`
- ✅ Índices de performance
- ✅ Políticas RLS configuradas

## 🚨 Troubleshooting

### Erro: "table_comment does not exist"

- ✅ **Solução:** Use o arquivo `migration_complete.sql` que corrige este erro

### Erro: "syntax error at or near UNION"

- ✅ **Solução:** Use `quick_test.sql` (uma query por vez) ou `test_simple.sql`

### Erro: "function update_updated_at_column() does not exist"

- ✅ **Solução:** O script verifica se a função existe antes de criar os triggers

### Erro: "relation agendamento_servicos does not exist"

- ✅ **Solução:** Execute primeiro o `migration_complete.sql` e depois teste

### Interface não mostra novos campos

- ✅ **Solução:** Verifique se o servidor React está rodando e recarregue a página

## 📊 Exemplo de Teste

### Criar Agendamento Múltiplo:

```json
{
  "cliente_nome": "Maria Silva",
  "servicos_ids": ["servico-corte-id", "servico-escova-id"],
  "funcionarios_ids": ["funcionario-1-id", "funcionario-2-id"],
  "data_agendamento": "2025-10-08",
  "horario": "14:00",
  "horario_fim": "16:30"
}
```

### Resultado Esperado:

- Agendamento criado na tabela `agendamentos`
- 2 registros na tabela `agendamento_servicos`
- 2 registros na tabela `agendamento_funcionarios`
- Valor total calculado automaticamente
- Visualização no calendário com múltiplos serviços

## ✅ Status Final

Após executar todos os passos, você terá:

- 🎯 Sistema completo de múltiplos serviços
- 👥 Sistema completo de múltiplos funcionários
- ⏰ Controle de horário de término
- 💰 Cálculo automático de valor total
- 📱 Interface totalmente funcional

**🎉 Sistema pronto para uso em produção!**
