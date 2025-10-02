-- SCRIPT SIMPLIFICADO PARA TESTE DE LOGIN
-- Execute este SQL no Supabase SQL Editor

-- 1. Atualizar apenas a senha do admin para teste
UPDATE users 
SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    tentativas_login = 0,
    bloqueado_ate = null
WHERE email = 'admin@beautysalon.com';

-- 2. Verificar a atualização
SELECT 
    id,
    email,
    role,
    ativo,
    tentativas_login,
    bloqueado_ate,
    CASE 
        WHEN password_hash IS NOT NULL AND length(password_hash) > 50 
        THEN '✅ Hash OK' 
        ELSE '❌ Hash PROBLEMA' 
    END as password_status
FROM users
WHERE email = 'admin@beautysalon.com';

-- INFORMAÇÕES:
-- ✅ Nova senha: "password" (para teste simples)
-- ✅ Hash: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ✅ Tentativas zeradas
-- ✅ Desbloqueado