-- SCRIPT FINAL PARA CORRIGIR SENHAS NO SUPABASE
-- Execute este SQL no Supabase SQL Editor

-- 1. Atualizar senhas com hashes corretos para admin123 e recepcao123
UPDATE users 
SET password_hash = '$2b$10$FIsk4mp4BbFfAsbXjVyy7uOI8YAt2z7mWIQtDgP6x.UFQ5gPVkDvK',
    tentativas_login = 0,
    bloqueado_ate = null
WHERE email = 'admin@beautysalon.com';

UPDATE users 
SET password_hash = '$2b$10$v0SpDgx0/5e61m3GELAIs.1eLurFJIZC61nIJYsJt8Nnx5H7QfRji',
    tentativas_login = 0,
    bloqueado_ate = null
WHERE email = 'recepcao@beautysalon.com';

-- 2. Verificar as atualizações
SELECT 
    id,
    email,
    role,
    ativo,
    tentativas_login,
    CASE 
        WHEN password_hash IS NOT NULL AND length(password_hash) = 60 
        THEN '✅ Hash OK (60 chars)' 
        ELSE '❌ Hash PROBLEMA' 
    END as password_status,
    created_at
FROM users
ORDER BY email;

-- INFORMAÇÕES IMPORTANTES:
-- ✅ admin@beautysalon.com - Senha: admin123
-- ✅ recepcao@beautysalon.com - Senha: recepcao123
-- ✅ Tentativas de login zeradas
-- ✅ Usuários desbloqueados