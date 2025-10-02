-- Criação da tabela de usuários para o Beauty Salon Dashboard
-- Execute este SQL no Supabase SQL Editor

-- Primeiro, criar o tipo ENUM para roles de usuário
CREATE TYPE user_role AS ENUM ('admin', 'recepcao');

-- Criar a tabela de usuários
CREATE TABLE users (
    -- Campos básicos
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Informações pessoais
    nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Autenticação
    password_hash TEXT NOT NULL, -- Senha será hasheada com bcrypt
    role user_role NOT NULL DEFAULT 'recepcao',
    
    -- Status e configurações
    ativo BOOLEAN DEFAULT true NOT NULL,
    avatar_url TEXT,
    telefone VARCHAR(20),
    
    -- Auditoria
    ultimo_login TIMESTAMP WITH TIME ZONE,
    tentativas_login INTEGER DEFAULT 0,
    bloqueado_ate TIMESTAMP WITH TIME ZONE,
    
    -- Configurações do usuário
    tema_preferido VARCHAR(10) DEFAULT 'light', -- 'light' ou 'dark'
    idioma VARCHAR(5) DEFAULT 'pt-BR',
    
    -- Metadados
    criado_por UUID REFERENCES users(id),
    observacoes TEXT
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_ativo ON users(ativo);
CREATE INDEX idx_users_ultimo_login ON users(ultimo_login);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Importante para segurança
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Administradores podem ver todos os usuários
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Apenas admins podem inserir novos usuários
CREATE POLICY "Only admins can insert users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins podem atualizar qualquer usuário, usuários podem atualizar só eles mesmos
CREATE POLICY "Admins can update all users, users can update themselves" ON users
    FOR UPDATE USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Apenas admins podem deletar usuários (soft delete recomendado)
CREATE POLICY "Only admins can delete users" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Inserir usuário administrador padrão
-- IMPORTANTE: Altere a senha antes de usar em produção!
INSERT INTO users (
    nome, 
    sobrenome, 
    email, 
    password_hash, 
    role, 
    ativo
) VALUES (
    'Administrador',
    'Sistema',
    'admin@beautysalon.com',
    '$2b$10$rBV2kYIhYE9MqNf0sDZLDOu9CTkd1qJGv1l4zCJ4JGYgr.F4nF4zG', -- admin123 hasheado
    'admin',
    true
);

-- Inserir usuário de recepção padrão
INSERT INTO users (
    nome, 
    sobrenome, 
    email, 
    password_hash, 
    role, 
    ativo
) VALUES (
    'Maria',
    'Recepção',
    'recepcao@beautysalon.com',
    '$2b$10$bXEhpXQb3N6JLf.9zLN8L.9hF2kT8XcK5gH3jP7mQ9rS1tV2wX3yZ', -- recepcao123 hasheado
    'recepcao',
    true
);

-- Comentários da estrutura
COMMENT ON TABLE users IS 'Tabela de usuários do sistema Beauty Salon';
COMMENT ON COLUMN users.password_hash IS 'Hash da senha usando bcrypt';
COMMENT ON COLUMN users.role IS 'Nível de acesso: admin (completo) ou recepcao (limitado)';
COMMENT ON COLUMN users.tentativas_login IS 'Contador de tentativas de login falhadas';
COMMENT ON COLUMN users.bloqueado_ate IS 'Data/hora até quando o usuário está bloqueado';
COMMENT ON COLUMN users.tema_preferido IS 'Tema preferido do usuário (light/dark)';