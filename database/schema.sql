-- ============================================
-- BANCO DE DADOS - BEAUTY SALON DASHBOARD
-- ============================================
-- Execute este script no SQL Editor do Supabase

-- 1. FUNCIONÁRIOS
CREATE TABLE IF NOT EXISTS funcionarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    funcao VARCHAR(100) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    meta_semanal DECIMAL(10,2),
    meta_mensal DECIMAL(10,2),
    comissao_percentual DECIMAL(5,2)
);

-- 2. SERVIÇOS
CREATE TABLE IF NOT EXISTS servicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    nome VARCHAR(200) NOT NULL,
    valor_base DECIMAL(10,2) NOT NULL,
    funcionario_responsavel_id UUID REFERENCES funcionarios(id),
    ativo BOOLEAN DEFAULT true,
    descricao TEXT
);

-- 3. MOVIMENTAÇÕES FINANCEIRAS
CREATE TABLE IF NOT EXISTS movimentacoes_financeiras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT NOT NULL,
    metodo_pagamento VARCHAR(20) CHECK (metodo_pagamento IN ('PIX', 'DINHEIRO', 'CREDITO', 'DEBITO')),
    funcionario_id UUID REFERENCES funcionarios(id),
    servico_id UUID REFERENCES servicos(id),
    cliente_nome VARCHAR(200),
    data_movimentacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. AGENDAMENTOS
CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    servico_id UUID NOT NULL REFERENCES servicos(id),
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id),
    cliente_nome VARCHAR(200) NOT NULL,
    cliente_telefone VARCHAR(20),
    data_agendamento DATE NOT NULL,
    horario TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'AGENDADO' CHECK (status IN ('AGENDADO', 'CONFIRMADO', 'REALIZADO', 'CANCELADO')),
    observacoes TEXT,
    google_calendar_event_id VARCHAR(255)
);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_funcionarios_updated_at BEFORE UPDATE ON funcionarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_movimentacoes_updated_at BEFORE UPDATE ON movimentacoes_financeiras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_funcionarios_ativo ON funcionarios(ativo);
CREATE INDEX IF NOT EXISTS idx_funcionarios_email ON funcionarios(email);
CREATE INDEX IF NOT EXISTS idx_servicos_ativo ON servicos(ativo);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes_financeiras(data_movimentacao);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON movimentacoes_financeiras(tipo);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- ============================================
-- DADOS INICIAIS (SEEDS)
-- ============================================

-- Inserir funcionários exemplo
INSERT INTO funcionarios (nome, sobrenome, telefone, email, funcao, meta_semanal, meta_mensal, comissao_percentual) VALUES
('Maria', 'Silva', '(11) 99999-1111', 'maria@salao.com', 'Cabeleireira', 2000.00, 8000.00, 15.00),
('Ana', 'Santos', '(11) 99999-2222', 'ana@salao.com', 'Manicure', 1500.00, 6000.00, 20.00),
('Julia', 'Costa', '(11) 99999-3333', 'julia@salao.com', 'Esteticista', 2500.00, 10000.00, 12.00)
ON CONFLICT (email) DO NOTHING;

-- Inserir serviços exemplo
INSERT INTO servicos (nome, valor_base, funcionario_responsavel_id, descricao) 
SELECT 
    'Corte e Escova', 80.00, f.id, 'Corte personalizado com escova modeladora'
FROM funcionarios f WHERE f.email = 'maria@salao.com'
UNION ALL
SELECT 
    'Manicure e Pedicure', 45.00, f.id, 'Cuidados completos para unhas'
FROM funcionarios f WHERE f.email = 'ana@salao.com'
UNION ALL
SELECT 
    'Limpeza de Pele', 120.00, f.id, 'Limpeza profunda e hidratação facial'
FROM funcionarios f WHERE f.email = 'julia@salao.com'
UNION ALL
SELECT 
    'Coloração', 150.00, f.id, 'Coloração completa com produtos premium'
FROM funcionarios f WHERE f.email = 'maria@salao.com'
UNION ALL
SELECT 
    'Alongamento de Unhas', 90.00, f.id, 'Alongamento em gel com decoração'
FROM funcionarios f WHERE f.email = 'ana@salao.com';

-- Inserir algumas movimentações exemplo dos últimos dias
INSERT INTO movimentacoes_financeiras (tipo, valor, descricao, metodo_pagamento, funcionario_id, servico_id, cliente_nome, data_movimentacao)
SELECT 
    'ENTRADA', 80.00, 'Serviço para Cliente Exemplo', 'PIX', f.id, s.id, 'Maria da Silva',
    NOW() - INTERVAL '1 day'
FROM funcionarios f, servicos s 
WHERE f.email = 'maria@salao.com' AND s.nome = 'Corte e Escova'
UNION ALL
SELECT 
    'ENTRADA', 45.00, 'Serviço para Cliente Exemplo', 'DINHEIRO', f.id, s.id, 'Ana Costa',
    NOW() - INTERVAL '2 days'
FROM funcionarios f, servicos s 
WHERE f.email = 'ana@salao.com' AND s.nome = 'Manicure e Pedicure'
UNION ALL
SELECT 
    'SAIDA', 200.00, 'Compra de materiais: Produtos para cabelo', NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '3 days'
UNION ALL
SELECT 
    'ENTRADA', 120.00, 'Serviço para Cliente Exemplo', 'CREDITO', f.id, s.id, 'Fernanda Lima',
    NOW() - INTERVAL '1 day'
FROM funcionarios f, servicos s 
WHERE f.email = 'julia@salao.com' AND s.nome = 'Limpeza de Pele';

-- ============================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir operações (ajuste conforme necessário)
CREATE POLICY "Allow all operations on funcionarios" ON funcionarios FOR ALL USING (true);
CREATE POLICY "Allow all operations on servicos" ON servicos FOR ALL USING (true);
CREATE POLICY "Allow all operations on movimentacoes" ON movimentacoes_financeiras FOR ALL USING (true);
CREATE POLICY "Allow all operations on agendamentos" ON agendamentos FOR ALL USING (true);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para estatísticas rápidas
CREATE OR REPLACE VIEW vw_estatisticas_dashboard AS
SELECT 
    COALESCE(SUM(CASE WHEN tipo = 'ENTRADA' THEN valor ELSE 0 END), 0) as total_entradas,
    COALESCE(SUM(CASE WHEN tipo = 'SAIDA' THEN valor ELSE 0 END), 0) as total_saidas,
    COALESCE(SUM(CASE WHEN tipo = 'ENTRADA' THEN valor ELSE -valor END), 0) as saldo_total,
    COUNT(CASE WHEN tipo = 'ENTRADA' THEN 1 END) as qtd_entradas,
    COUNT(CASE WHEN tipo = 'SAIDA' THEN 1 END) as qtd_saidas
FROM movimentacoes_financeiras 
WHERE data_movimentacao >= CURRENT_DATE - INTERVAL '30 days';

-- View para ranking de funcionários
CREATE OR REPLACE VIEW vw_performance_funcionarios AS
SELECT 
    f.id,
    f.nome || ' ' || f.sobrenome as nome_completo,
    COUNT(m.id) as servicos_realizados,
    COALESCE(SUM(m.valor), 0) as faturamento_total,
    COALESCE(AVG(m.valor), 0) as ticket_medio
FROM funcionarios f
LEFT JOIN movimentacoes_financeiras m ON f.id = m.funcionario_id 
    AND m.tipo = 'ENTRADA' 
    AND m.data_movimentacao >= CURRENT_DATE - INTERVAL '30 days'
WHERE f.ativo = true
GROUP BY f.id, f.nome, f.sobrenome
ORDER BY faturamento_total DESC;