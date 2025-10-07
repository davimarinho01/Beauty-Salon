-- Adicionar campo horario_fim à tabela agendamentos
-- Esta coluna permitirá definir a hora de término dos agendamentos

ALTER TABLE agendamentos 
ADD COLUMN horario_fim TIME;

-- Comentário explicativo
COMMENT ON COLUMN agendamentos.horario_fim IS 'Horário de término do agendamento. Opcional para controle de duração.';

-- Verificar se a alteração foi aplicada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
  AND column_name IN ('horario', 'horario_fim')
ORDER BY ordinal_position;