-- ========================================
-- MIGRAÇÃO: Infraestrutura de Monetização e Analytics
-- ========================================
-- Objetivo: Implementar sistema de tiers de usuário e tracking de scans
-- Data: 2025-11-19
-- ========================================

-- 1. CRIAR TABELA DE PERFIS DE USUÁRIO
-- ========================================
-- Armazena informações de assinatura de cada usuário
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Política: Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Índice para melhorar performance de queries por subscription_tier
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier 
    ON public.user_profiles(subscription_tier);

-- ========================================
-- 2. ADICIONAR COLUNA DE CONTAGEM DE SCANS
-- ========================================
-- Adiciona contador de scans na tabela qrcodes
ALTER TABLE public.qrcodes 
    ADD COLUMN IF NOT EXISTS scan_count INTEGER NOT NULL DEFAULT 0;

-- Índice para otimizar queries que ordenam por scan_count
CREATE INDEX IF NOT EXISTS idx_qrcodes_scan_count 
    ON public.qrcodes(scan_count DESC);

-- Índice composto para queries do dashboard (user_id + created_at)
CREATE INDEX IF NOT EXISTS idx_qrcodes_user_created 
    ON public.qrcodes(user_id, created_at DESC);

-- ========================================
-- 3. FUNÇÃO PARA AUTO-CRIAR PERFIL FREE
-- ========================================
-- Cria automaticamente um perfil 'free' quando um novo usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, subscription_tier)
    VALUES (NEW.id, 'free')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 4. TRIGGER PARA NOVOS USUÁRIOS
-- ========================================
-- Dispara a função sempre que um novo usuário é criado no auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- 5. POPULAR PERFIS PARA USUÁRIOS EXISTENTES
-- ========================================
-- Cria perfis 'free' para todos os usuários que já existem
INSERT INTO public.user_profiles (id, subscription_tier)
SELECT id, 'free'
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.users.id
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 6. FUNÇÃO PARA INCREMENTAR SCAN COUNT
-- ========================================
-- Função otimizada para incrementar atomicamente o contador de scans
-- Retorna a URL original para permitir redirect imediato
CREATE OR REPLACE FUNCTION public.increment_scan_count(p_short_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_original_url TEXT;
BEGIN
    UPDATE public.qrcodes
    SET scan_count = scan_count + 1
    WHERE short_id = p_short_id
    RETURNING original_url INTO v_original_url;
    
    RETURN v_original_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 7. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ========================================
COMMENT ON TABLE public.user_profiles IS 'Perfis de usuário com informações de assinatura para modelo freemium';
COMMENT ON COLUMN public.user_profiles.subscription_tier IS 'Plano atual do usuário: free, pro ou enterprise';
COMMENT ON COLUMN public.qrcodes.scan_count IS 'Contador acumulado de scans/acessos do QR Code';
COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-cria perfil free para novos usuários registrados via Supabase Auth';
COMMENT ON FUNCTION public.increment_scan_count(TEXT) IS 'Incrementa atomicamente scan_count e retorna original_url para performance';
