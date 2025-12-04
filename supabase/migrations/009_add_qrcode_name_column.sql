-- ========================================
-- MIGRAÇÃO: Adicionar Coluna de Nome aos QR Codes
-- ========================================
-- Objetivo: Permitir que usuários nomeiem seus QR Codes para melhor organização
-- Data: 2025-12-02
-- ========================================

-- Adicionar coluna 'name' à tabela qrcodes
ALTER TABLE public.qrcodes 
    ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Criar índice para melhorar performance de buscas por nome
CREATE INDEX IF NOT EXISTS idx_qrcodes_name 
    ON public.qrcodes(name);

-- Criar índice composto para busca full-text (nome + user_id)
CREATE INDEX IF NOT EXISTS idx_qrcodes_user_name 
    ON public.qrcodes(user_id, name);

COMMENT ON COLUMN public.qrcodes.name IS 'Nome do QR Code para facilitar organização e busca';
