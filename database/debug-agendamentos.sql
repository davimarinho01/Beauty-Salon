-- Script para verificar os dados de agendamentos no Supabase
-- Execute no SQL Editor para verificar se os dados foram inseridos corretamente

-- 1. Verificar se existem agendamentos
SELECT COUNT(*) as total_agendamentos FROM agendamentos;

-- 2. Listar todos os agendamentos com detalhes
SELECT 
    a.id,
    a.cliente_nome,
    a.data_agendamento,
    a.horario,
    a.status,
    f.nome || ' ' || f.sobrenome as funcionario,
    s.nome as servico
FROM agendamentos a
LEFT JOIN funcionarios f ON a.funcionario_id = f.id
LEFT JOIN servicos s ON a.servico_id = s.id
ORDER BY a.data_agendamento, a.horario;

-- 3. Verificar agendamentos da semana atual
SELECT 
    a.cliente_nome,
    a.data_agendamento,
    a.horario,
    a.status
FROM agendamentos a
WHERE a.data_agendamento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY a.data_agendamento, a.horario;

-- 4. Verificar formato dos horários
SELECT DISTINCT horario, typeof(horario) as tipo_horario FROM agendamentos;