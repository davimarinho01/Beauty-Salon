-- Script para atualizar as senhas dos usuários padrão
-- Execute este SQL no Supabase SQL Editor para corrigir as senhas

-- Atualizar senha do admin (admin123)
UPDATE users 
SET password_hash = '$2b$10$YQhAWBjmUKGAywZHQAe8m.rqSU1hZRWWcjh1/gNI1zWzxAZeXZAaK' 
WHERE email = 'admin@beautysalon.com';

-- Atualizar senha da recepção (recepcao123)
UPDATE users 
SET password_hash = '$2b$10$DJE1.pSIH6LEV6C4ZtPRqOwQg1QhFhbTJ9yMz0zG5QkF0kKlJlGt6'
WHERE email = 'recepcao@beautysalon.com';

-- Verificar se as atualizações foram feitas
SELECT email, role, ativo, 
       CASE WHEN password_hash IS NOT NULL THEN 'Hash OK' ELSE 'Hash NULL' END as password_status
FROM users;