-- ============================================
-- CRIAR TABELA: eventos_google
-- ============================================
-- Tabela separada para eventos importados do Google Calendar
-- Permite armazenar eventos genéricos sem conflitar com agendamentos do salão

CREATE TABLE eventos_google (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    google_event_id text UNIQUE NOT NULL,
    titulo text NOT NULL,
    descricao text,
    data_inicio timestamptz NOT NULL,
    data_fim timestamptz,
    local text,
    organizador text,
    participantes text[], -- Array de emails dos participantes
    link_meet text, -- Link da reunião (se houver)
    cor text DEFAULT '#3182CE', -- Cor do evento no calendário
    all_day boolean DEFAULT false, -- Se é evento de dia inteiro
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    synced_at timestamptz DEFAULT now() -- Última sincronização
);

-- Índices para performance
CREATE INDEX idx_eventos_google_google_event_id ON eventos_google(google_event_id);
CREATE INDEX idx_eventos_google_data_inicio ON eventos_google(data_inicio);
CREATE INDEX idx_eventos_google_synced_at ON eventos_google(synced_at);

-- Comentários para documentação
COMMENT ON TABLE eventos_google IS 'Eventos importados do Google Calendar - separados dos agendamentos do salão';
COMMENT ON COLUMN eventos_google.google_event_id IS 'ID único do evento no Google Calendar';
COMMENT ON COLUMN eventos_google.titulo IS 'Título/nome do evento';
COMMENT ON COLUMN eventos_google.descricao IS 'Descrição detalhada do evento';
COMMENT ON COLUMN eventos_google.participantes IS 'Array de emails dos participantes do evento';
COMMENT ON COLUMN eventos_google.synced_at IS 'Timestamp da última sincronização com Google Calendar';

-- Verificar se a tabela foi criada
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'eventos_google' 
ORDER BY ordinal_position;