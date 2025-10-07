-- ============================================
-- FIX: Permitir eventos genéricos na tabela agendamentos
-- ============================================
-- Execute este script no SQL Editor do Supabase para permitir
-- que servico_id e funcionario_id sejam NULL para eventos genéricos
-- importados do Google Calendar

-- Remover a constraint NOT NULL de servico_id
ALTER TABLE agendamentos 
ALTER COLUMN servico_id DROP NOT NULL;

-- Remover a constraint NOT NULL de funcionario_id  
ALTER TABLE agendamentos 
ALTER COLUMN funcionario_id DROP NOT NULL;

-- Opcional: Adicionar um comentário para documentar a mudança
COMMENT ON COLUMN agendamentos.servico_id IS 'ID do serviço. Pode ser NULL para eventos genéricos importados do Google Calendar.';
COMMENT ON COLUMN agendamentos.funcionario_id IS 'ID do funcionário. Pode ser NULL para eventos genéricos importados do Google Calendar.';

-- Verificar se as alterações foram aplicadas
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
  AND column_name IN ('servico_id', 'funcionario_id');