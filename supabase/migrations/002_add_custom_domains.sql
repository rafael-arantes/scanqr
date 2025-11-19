-- ========================================
-- MIGRAÇÃO: Domínios Personalizados
-- ========================================
-- Objetivo: Permitir que usuários Pro/Enterprise usem seus próprios domínios
-- Data: 2025-11-19
-- ========================================

-- 1. CRIAR TABELA DE DOMÍNIOS CUSTOMIZADOS
-- ========================================
CREATE TABLE IF NOT EXISTS public.custom_domains (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    domain TEXT NOT NULL UNIQUE,
    verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_domain_format CHECK (domain ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$')
);

-- Habilitar Row Level Security
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own domains"
    ON public.custom_domains
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own domains"
    ON public.custom_domains
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own domains"
    ON public.custom_domains
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own domains"
    ON public.custom_domains
    FOR DELETE
    USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_custom_domains_user_id 
    ON public.custom_domains(user_id);

CREATE INDEX IF NOT EXISTS idx_custom_domains_domain 
    ON public.custom_domains(domain);

CREATE INDEX IF NOT EXISTS idx_custom_domains_verified 
    ON public.custom_domains(verified) WHERE verified = true;

-- ========================================
-- 2. ADICIONAR COLUNA DE DOMÍNIO PREFERIDO EM QR CODES
-- ========================================
ALTER TABLE public.qrcodes 
    ADD COLUMN IF NOT EXISTS custom_domain_id BIGINT REFERENCES public.custom_domains(id) ON DELETE SET NULL;

-- Índice para queries de QR Codes com domínio customizado
CREATE INDEX IF NOT EXISTS idx_qrcodes_custom_domain 
    ON public.qrcodes(custom_domain_id) WHERE custom_domain_id IS NOT NULL;

-- ========================================
-- 3. FUNÇÃO PARA GERAR TOKEN DE VERIFICAÇÃO
-- ========================================
CREATE OR REPLACE FUNCTION public.generate_verification_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. TRIGGER PARA AUTO-GERAR TOKEN
-- ========================================
CREATE OR REPLACE FUNCTION public.set_verification_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verification_token IS NULL OR NEW.verification_token = '' THEN
        NEW.verification_token := public.generate_verification_token();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_domain_insert_set_token ON public.custom_domains;

CREATE TRIGGER on_domain_insert_set_token
    BEFORE INSERT ON public.custom_domains
    FOR EACH ROW
    EXECUTE FUNCTION public.set_verification_token();

-- ========================================
-- 5. FUNÇÃO PARA RESOLVER URL COM DOMÍNIO CUSTOMIZADO
-- ========================================
-- Retorna a URL completa do QR Code considerando domínio customizado
CREATE OR REPLACE FUNCTION public.get_qrcode_url(p_short_id TEXT, p_default_domain TEXT)
RETURNS TEXT AS $$
DECLARE
    v_custom_domain TEXT;
BEGIN
    -- Buscar domínio customizado verificado associado ao QR Code
    SELECT cd.domain INTO v_custom_domain
    FROM public.qrcodes q
    LEFT JOIN public.custom_domains cd ON q.custom_domain_id = cd.id
    WHERE q.short_id = p_short_id 
      AND cd.verified = true
    LIMIT 1;
    
    -- Se tiver domínio customizado verificado, usar ele
    IF v_custom_domain IS NOT NULL THEN
        RETURN 'https://' || v_custom_domain || '/' || p_short_id;
    ELSE
        -- Caso contrário, usar domínio padrão
        RETURN p_default_domain || '/' || p_short_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 6. VIEW PARA DOMÍNIOS COM ESTATÍSTICAS
-- ========================================
CREATE OR REPLACE VIEW public.custom_domains_stats AS
SELECT 
    cd.id,
    cd.user_id,
    cd.domain,
    cd.verified,
    cd.created_at,
    cd.verified_at,
    COUNT(q.id) as qr_codes_count,
    COALESCE(SUM(q.scan_count), 0) as total_scans
FROM public.custom_domains cd
LEFT JOIN public.qrcodes q ON cd.id = q.custom_domain_id
GROUP BY cd.id, cd.user_id, cd.domain, cd.verified, cd.created_at, cd.verified_at;

-- ========================================
-- 7. FUNÇÃO PARA VALIDAR SE USUÁRIO PODE ADICIONAR DOMÍNIO
-- ========================================
CREATE OR REPLACE FUNCTION public.can_add_custom_domain(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_tier TEXT;
    v_domain_count INTEGER;
BEGIN
    -- Buscar tier do usuário
    SELECT subscription_tier INTO v_tier
    FROM public.user_profiles
    WHERE id = p_user_id;
    
    -- Free users não podem adicionar domínios
    IF v_tier = 'free' THEN
        RETURN FALSE;
    END IF;
    
    -- Contar domínios atuais
    SELECT COUNT(*) INTO v_domain_count
    FROM public.custom_domains
    WHERE user_id = p_user_id;
    
    -- Pro: até 3 domínios
    IF v_tier = 'pro' AND v_domain_count >= 3 THEN
        RETURN FALSE;
    END IF;
    
    -- Enterprise: ilimitado
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ========================================
COMMENT ON TABLE public.custom_domains IS 'Domínios personalizados para usuários Pro/Enterprise';
COMMENT ON COLUMN public.custom_domains.domain IS 'Domínio customizado (ex: qr.empresa.com)';
COMMENT ON COLUMN public.custom_domains.verified IS 'Se o domínio foi verificado via DNS';
COMMENT ON COLUMN public.custom_domains.verification_token IS 'Token para verificação DNS (TXT record)';
COMMENT ON COLUMN public.qrcodes.custom_domain_id IS 'Domínio customizado associado ao QR Code';
COMMENT ON FUNCTION public.get_qrcode_url(TEXT, TEXT) IS 'Resolve URL do QR Code considerando domínio customizado';
COMMENT ON FUNCTION public.can_add_custom_domain(UUID) IS 'Verifica se usuário pode adicionar mais domínios';

-- ========================================
-- 9. DADOS INICIAIS / EXEMPLOS
-- ========================================
-- Nenhum dado inicial necessário
