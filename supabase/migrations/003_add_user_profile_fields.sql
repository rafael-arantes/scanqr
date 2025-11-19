-- ========================================
-- MIGRAÇÃO: Adicionar Campos de Perfil do Usuário
-- ========================================
-- Objetivo: Permitir que usuários personalizem nome de exibição e avatar
-- Data: 2025-11-19
-- ========================================

-- Adicionar colunas de personalização à tabela user_profiles
ALTER TABLE public.user_profiles 
    ADD COLUMN IF NOT EXISTS display_name TEXT,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Comentários nas colunas
COMMENT ON COLUMN public.user_profiles.display_name IS 'Nome de exibição do usuário (opcional)';
COMMENT ON COLUMN public.user_profiles.avatar_url IS 'URL do avatar/foto do usuário (opcional)';

-- Atualizar timestamp de updated_at quando houver mudanças
CREATE OR REPLACE FUNCTION public.update_user_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_profile_updated_at();
