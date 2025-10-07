-- Script corrigido para criação das tabelas de múltiplos serviços e funcionários
-- Execute este script no seu banco de dados PostgreSQL/Supabase

-- 1. Primeiro, adicionar coluna horario_fim se ainda não existir
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS horario_fim TIME;

-- 2. Tabela de relacionamento agendamento-serviços (many-to-many)
CREATE TABLE IF NOT EXISTS agendamento_servicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    valor_aplicado DECIMAL(10,2), -- Valor específico do serviço neste agendamento
    ordem INTEGER DEFAULT 1, -- Ordem dos serviços no agendamento
    UNIQUE(agendamento_id, servico_id) -- Evita duplicação do mesmo serviço
);

-- 3. Tabela de relacionamento agendamento-funcionários (many-to-many)
CREATE TABLE IF NOT EXISTS agendamento_funcionarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    responsavel_principal BOOLEAN DEFAULT FALSE, -- Indica o funcionário principal
    ordem INTEGER DEFAULT 1, -- Ordem dos funcionários no agendamento
    UNIQUE(agendamento_id, funcionario_id) -- Evita duplicação do mesmo funcionário
);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_agendamento_servicos_agendamento ON agendamento_servicos(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_agendamento_servicos_servico ON agendamento_servicos(servico_id);
CREATE INDEX IF NOT EXISTS idx_agendamento_funcionarios_agendamento ON agendamento_funcionarios(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_agendamento_funcionarios_funcionario ON agendamento_funcionarios(funcionario_id);

-- 5. Comentários explicativos
COMMENT ON TABLE agendamento_servicos IS 'Relacionamento many-to-many entre agendamentos e serviços. Permite múltiplos serviços por agendamento (ex: unha + cabelo).';
COMMENT ON TABLE agendamento_funcionarios IS 'Relacionamento many-to-many entre agendamentos e funcionários. Permite múltiplos funcionários por agendamento.';

COMMENT ON COLUMN agendamento_servicos.valor_aplicado IS 'Valor específico do serviço neste agendamento. Pode diferir do valor_base do serviço.';
COMMENT ON COLUMN agendamento_servicos.ordem IS 'Ordem de execução dos serviços no agendamento.';
COMMENT ON COLUMN agendamento_funcionarios.responsavel_principal IS 'Indica qual funcionário é o responsável principal pelo agendamento.';
COMMENT ON COLUMN agendamento_funcionarios.ordem IS 'Ordem de participação dos funcionários no agendamento.';

-- 6. Triggers para updated_at (se a função já existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER update_agendamento_servicos_updated_at 
        BEFORE UPDATE ON agendamento_servicos 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
        CREATE TRIGGER update_agendamento_funcionarios_updated_at 
        BEFORE UPDATE ON agendamento_funcionarios 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 7. Habilitar RLS se for Supabase
ALTER TABLE agendamento_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamento_funcionarios ENABLE ROW LEVEL SECURITY;

-- 8. Políticas de segurança (Supabase)
CREATE POLICY "Allow all operations on agendamento_servicos" ON agendamento_servicos FOR ALL USING (true);
CREATE POLICY "Allow all operations on agendamento_funcionarios" ON agendamento_funcionarios FOR ALL USING (true);

-- 9. Verificações finais
SELECT 'Tabelas criadas com sucesso!' as status;

SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name IN ('agendamento_servicos', 'agendamento_funcionarios', 'agendamentos')
  AND table_schema = 'public'
ORDER BY table_name;

-- 10. Verificar colunas das novas tabelas
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('agendamento_servicos', 'agendamento_funcionarios')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;