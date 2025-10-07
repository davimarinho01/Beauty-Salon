-- Criação de tabelas para múltiplos serviços e funcionários por agendamento
-- Permite que um agendamento tenha vários serviços (ex: unha + cabelo) e vários funcionários

-- 1. Tabela de relacionamento agendamento-serviços (many-to-many)
CREATE TABLE IF NOT EXISTS agendamento_servicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    valor_aplicado DECIMAL(10,2), -- Valor específico do serviço neste agendamento
    ordem INTEGER DEFAULT 1, -- Ordem dos serviços no agendamento
    UNIQUE(agendamento_id, servico_id) -- Evita duplicação do mesmo serviço
);

-- 2. Tabela de relacionamento agendamento-funcionários (many-to-many)
CREATE TABLE IF NOT EXISTS agendamento_funcionarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    responsavel_principal BOOLEAN DEFAULT FALSE, -- Indica o funcionário principal
    ordem INTEGER DEFAULT 1, -- Ordem dos funcionários no agendamento
    UNIQUE(agendamento_id, funcionario_id) -- Evita duplicação do mesmo funcionário
);

-- 3. Manter compatibilidade: as colunas antigas ficarão como referência ao serviço/funcionário principal
-- Isso garante que agendamentos existentes continuem funcionando

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

-- 6. Triggers para updated_at
CREATE TRIGGER update_agendamento_servicos_updated_at BEFORE UPDATE ON agendamento_servicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agendamento_funcionarios_updated_at BEFORE UPDATE ON agendamento_funcionarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Verificar se as tabelas foram criadas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name IN ('agendamento_servicos', 'agendamento_funcionarios')
  AND table_schema = 'public'
ORDER BY table_name;