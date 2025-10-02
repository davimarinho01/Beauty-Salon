-- ============================================
-- DADOS ADICIONAIS - AGENDAMENTOS DE EXEMPLO
-- ============================================
-- Execute este script após o schema principal para adicionar agendamentos de exemplo

-- Inserir alguns agendamentos para a semana atual
INSERT INTO agendamentos (servico_id, funcionario_id, cliente_nome, cliente_telefone, data_agendamento, horario, status, observacoes)
SELECT 
    s.id, f.id, 'Carla Santos', '(11) 98888-1111', 
    CURRENT_DATE + INTERVAL '1 day', '09:00:00'::time, 'CONFIRMADO', 
    'Cliente preferencial - corte sempre no mesmo estilo'
FROM funcionarios f, servicos s 
WHERE f.email = 'maria@salao.com' AND s.nome = 'Corte e Escova'

UNION ALL

SELECT 
    s.id, f.id, 'Beatriz Lima', '(11) 97777-2222', 
    CURRENT_DATE + INTERVAL '1 day', '14:00:00'::time, 'AGENDADO', 
    'Primeira vez no salão - explicar procedimentos'
FROM funcionarios f, servicos s 
WHERE f.email = 'ana@salao.com' AND s.nome = 'Manicure e Pedicure'

UNION ALL

SELECT 
    s.id, f.id, 'Fernanda Costa', '(11) 96666-3333', 
    CURRENT_DATE + INTERVAL '2 days', '10:30:00'::time, 'CONFIRMADO', 
    'Pele sensível - usar produtos hipoalergênicos'
FROM funcionarios f, servicos s 
WHERE f.email = 'julia@salao.com' AND s.nome = 'Limpeza de Pele'

UNION ALL

SELECT 
    s.id, f.id, 'Mariana Oliveira', '(11) 95555-4444', 
    CURRENT_DATE + INTERVAL '2 days', '16:00:00'::time, 'AGENDADO', 
    'Quer mudar radicalmente - consultoria de cor'
FROM funcionarios f, servicos s 
WHERE f.email = 'maria@salao.com' AND s.nome = 'Coloração'

UNION ALL

SELECT 
    s.id, f.id, 'Patrícia Alves', '(11) 94444-5555', 
    CURRENT_DATE + INTERVAL '3 days', '11:00:00'::time, 'CONFIRMADO', 
    'Evento importante no fim de semana'
FROM funcionarios f, servicos s 
WHERE f.email = 'ana@salao.com' AND s.nome = 'Alongamento de Unhas'

UNION ALL

SELECT 
    s.id, f.id, 'Roberta Silva', '(11) 93333-6666', 
    CURRENT_DATE + INTERVAL '4 days', '15:30:00'::time, 'AGENDADO', 
    'Grávida - cuidados especiais'
FROM funcionarios f, servicos s 
WHERE f.email = 'julia@salao.com' AND s.nome = 'Limpeza de Pele'

UNION ALL

SELECT 
    s.id, f.id, 'Amanda Santos', '(11) 92222-7777', 
    CURRENT_DATE + INTERVAL '5 days', '09:30:00'::time, 'CONFIRMADO', 
    'Corte para casamento da filha'
FROM funcionarios f, servicos s 
WHERE f.email = 'maria@salao.com' AND s.nome = 'Corte e Escova'

UNION ALL

SELECT 
    s.id, f.id, 'Luciana Pereira', '(11) 91111-8888', 
    CURRENT_DATE + INTERVAL '6 days', '13:00:00'::time, 'AGENDADO', 
    'Cliente fidelizada há 2 anos'
FROM funcionarios f, servicos s 
WHERE f.email = 'ana@salao.com' AND s.nome = 'Manicure e Pedicure';

-- Inserir alguns agendamentos já realizados (semana passada)
INSERT INTO agendamentos (servico_id, funcionario_id, cliente_nome, cliente_telefone, data_agendamento, horario, status, observacoes)
SELECT 
    s.id, f.id, 'Helena Martins', '(11) 90000-9999', 
    CURRENT_DATE - INTERVAL '3 days', '10:00:00'::time, 'REALIZADO', 
    'Ficou muito satisfeita com o resultado'
FROM funcionarios f, servicos s 
WHERE f.email = 'maria@salao.com' AND s.nome = 'Coloração'

UNION ALL

SELECT 
    s.id, f.id, 'Claudia Rocha', '(11) 89999-0000', 
    CURRENT_DATE - INTERVAL '2 days', '14:30:00'::time, 'REALIZADO', 
    'Indicou duas amigas'
FROM funcionarios f, servicos s 
WHERE f.email = 'julia@salao.com' AND s.nome = 'Limpeza de Pele'

UNION ALL

SELECT 
    s.id, f.id, 'Simone Dias', '(11) 88888-1111', 
    CURRENT_DATE - INTERVAL '1 day', '16:30:00'::time, 'CANCELADO', 
    'Cancelou por motivos pessoais - reagendar'
FROM funcionarios f, servicos s 
WHERE f.email = 'ana@salao.com' AND s.nome = 'Alongamento de Unhas';

-- View para estatísticas de agendamentos
CREATE OR REPLACE VIEW vw_estatisticas_agendamentos AS
SELECT 
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN status = 'AGENDADO' THEN 1 END) as agendados,
    COUNT(CASE WHEN status = 'CONFIRMADO' THEN 1 END) as confirmados,
    COUNT(CASE WHEN status = 'REALIZADO' THEN 1 END) as realizados,
    COUNT(CASE WHEN status = 'CANCELADO' THEN 1 END) as cancelados,
    ROUND(
        COUNT(CASE WHEN status = 'REALIZADO' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(CASE WHEN status IN ('AGENDADO', 'CONFIRMADO', 'REALIZADO') THEN 1 END), 0), 
        2
    ) as taxa_comparecimento
FROM agendamentos 
WHERE data_agendamento >= CURRENT_DATE - INTERVAL '30 days';

-- View para agendamentos por funcionário
CREATE OR REPLACE VIEW vw_agendamentos_funcionario AS
SELECT 
    f.id as funcionario_id,
    f.nome || ' ' || f.sobrenome as funcionario_nome,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN a.status = 'REALIZADO' THEN 1 END) as atendimentos_realizados,
    COUNT(CASE WHEN a.data_agendamento >= CURRENT_DATE THEN 1 END) as proximos_agendamentos
FROM funcionarios f
LEFT JOIN agendamentos a ON f.id = a.funcionario_id
WHERE f.ativo = true 
    AND a.data_agendamento >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY f.id, f.nome, f.sobrenome
ORDER BY total_agendamentos DESC;