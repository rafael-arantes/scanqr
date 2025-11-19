-- ========================================
-- MIGRAÇÃO: Modo de Routing para Domínios Customizados
-- ========================================
-- Objetivo: Permitir que QR codes usem domínio customizado na URL
-- Data: 2025-11-19
-- ========================================

-- 1. ADICIONAR COLUNA MODE
-- ========================================
-- 'branding': Domínio apenas para organização/analytics (QR usa domínio padrão)
-- 'routing': QR code usa o domínio customizado de verdade (requer CNAME)

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_domains' 
        AND column_name = 'mode'
    ) THEN
        ALTER TABLE public.custom_domains 
            ADD COLUMN mode TEXT DEFAULT 'branding' CHECK (mode IN ('branding', 'routing'));
    END IF;
END $$;

-- Índice para filtrar por modo
CREATE INDEX IF NOT EXISTS idx_custom_domains_mode 
    ON public.custom_domains(mode) 
    WHERE mode = 'routing';

-- ========================================
-- 2. ATUALIZAR VIEW DE ESTATÍSTICAS
-- ========================================
DROP VIEW IF EXISTS public.custom_domains_stats;

CREATE VIEW public.custom_domains_stats AS
SELECT 
    cd.id,
    cd.user_id,
    cd.domain,
    cd.verified,
    cd.mode,
    cd.created_at,
    cd.verified_at,
    COUNT(q.id) as qr_codes_count,
    COALESCE(SUM(q.scan_count), 0) as total_scans
FROM public.custom_domains cd
LEFT JOIN public.qrcodes q ON cd.id = q.custom_domain_id
GROUP BY cd.id, cd.user_id, cd.domain, cd.verified, cd.mode, cd.created_at, cd.verified_at;

-- ========================================
-- 3. COMENTÁRIOS
-- ========================================
COMMENT ON COLUMN public.custom_domains.mode IS 'Modo: branding (apenas metadata) ou routing (QR code usa domínio customizado)';
