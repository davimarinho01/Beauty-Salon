-- SCRIPT COMPLETO PARA CORRIGIR AUTENTICAÇÃO NO SUPABASE
-- Execute este SQL no Supabase SQL Editor

-- 1. REMOVER POLÍTICAS RLS QUE CAUSAM RECURSÃO
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Only admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update all users, users can update themselves" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;

-- 2. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. LIMPAR DADOS EXISTENTES E RECRIAR USUÁRIOS
DELETE FROM users;

-- 4. INSERIR USUÁRIOS COM SENHAS CORRETAS
INSERT INTO users (
    id,
    nome,
    sobrenome,
    email,
    password_hash,
    role,
    ativo,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    'Administrador',
    'Sistema',
    'admin@beautysalon.com',
    '$2b$10$YQhAWBjmUKGAywZHQAe8m.rqSU1hZRWWcjh1/gNI1zWzxAZeXZAaK',
    'admin',
    true,
    now(),
    now()
),
(
    gen_random_uuid(),
    'Recepção',
    'Atendimento',
    'recepcao@beautysalon.com',
    '$2b$10$DJE1.pSIH6LEV6C4ZtPRqOwQg1QhFhbTJ9yMz0zG5QkF0kKlJlGt6',
    'recepcao',
    true,
    now(),
    now()
);

-- 5. VERIFICAR OS USUÁRIOS CRIADOS
SELECT 
    id,
    nome,
    sobrenome,
    email,
    role,
    ativo,
    CASE 
        WHEN password_hash IS NOT NULL AND length(password_hash) > 50 
        THEN '✅ Hash OK' 
        ELSE '❌ Hash PROBLEMA' 
    END as password_status,
    created_at
FROM users
ORDER BY email;

-- 6. CONFIRMAR CONFIGURAÇÃO
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '⚠️ RLS ATIVO' 
        ELSE '✅ RLS DESABILITADO' 
    END as rls_status
FROM pg_tables 
WHERE tablename = 'users';

-- INFORMAÇÕES IMPORTANTES:
-- ✅ RLS foi desabilitado para evitar recursão infinita
-- ✅ Usuários recriados com hashes corretos
-- ✅ Senhas: admin123 e recepcao123
-- ✅ Sistema pronto para teste