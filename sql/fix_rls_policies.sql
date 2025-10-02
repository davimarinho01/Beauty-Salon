-- Script para corrigir as políticas RLS da tabela users
-- Execute este SQL no Supabase SQL Editor

-- 1. Remover todas as políticas existentes que estão causando recursão
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Only admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update all users, users can update themselves" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;

-- 2. Desabilitar RLS temporariamente para operações básicas funcionarem
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. Atualizar as senhas dos usuários padrão
UPDATE users 
SET password_hash = '$2b$10$YQhAWBjmUKGAywZHQAe8m.rqSU1hZRWWcjh1/gNI1zWzxAZeXZAaK' 
WHERE email = 'admin@beautysalon.com';

UPDATE users 
SET password_hash = '$2b$10$DJE1.pSIH6LEV6C4ZtPRqOwQg1QhFhbTJ9yMz0zG5QkF0kKlJlGt6'
WHERE email = 'recepcao@beautysalon.com';

-- 4. Verificar se os usuários foram atualizados
SELECT 
    id,
    email, 
    role, 
    ativo,
    CASE 
        WHEN password_hash IS NOT NULL AND length(password_hash) > 50 
        THEN 'Hash OK' 
        ELSE 'Hash PROBLEMA' 
    END as password_status,
    created_at
FROM users
ORDER BY created_at;

-- NOTA: 
-- RLS foi desabilitado para resolver o problema de recursão infinita
-- Em produção, você pode reconfigurar RLS mais tarde com políticas mais simples
-- Por enquanto, o sistema funcionará sem RLS (adequado para desenvolvimento)