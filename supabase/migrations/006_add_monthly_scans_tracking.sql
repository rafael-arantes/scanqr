-- ========================================
-- MIGRAÇÃO: Tracking de Scans Mensais por Usuário
-- ========================================
-- Objetivo: Controlar limite de scans mensais por usuário (não por QR Code)
-- Data: 2025-11-19
-- ========================================

-- 1. ADICIONAR COLUNA DE SCANS MENSAIS NO PERFIL
-- ========================================
ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS monthly_scans INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_scans_reset_at TIMESTAMPTZ DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month');

-- Índice para queries de limite de scans
CREATE INDEX IF NOT EXISTS idx_user_profiles_monthly_scans 
  ON public.user_profiles(monthly_scans);

COMMENT ON COLUMN public.user_profiles.monthly_scans IS 'Total de scans do usuário no mês atual';
COMMENT ON COLUMN public.user_profiles.monthly_scans_reset_at IS 'Data em que o contador mensal será zerado';

-- ========================================
-- 2. FUNÇÃO PARA INCREMENTAR SCANS DO USUÁRIO
-- ========================================
-- Atualiza a função increment_scan_count para também incrementar o contador mensal do usuário
-- E verificar o limite antes de incrementar
CREATE OR REPLACE FUNCTION public.increment_scan_count(p_short_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_original_url TEXT;
  v_user_id UUID;
  v_reset_at TIMESTAMPTZ;
  v_tier TEXT;
  v_monthly_scans INTEGER;
  v_max_scans INTEGER;
BEGIN
  -- Buscar URL, user_id do QR Code
  SELECT original_url, user_id 
  INTO v_original_url, v_user_id
  FROM qrcodes 
  WHERE short_id = p_short_id;
  
  -- Se não encontrou o QR Code, retornar NULL
  IF v_original_url IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Se não tem user_id (QR Code público), apenas incrementar e retornar
  IF v_user_id IS NULL THEN
    UPDATE qrcodes 
    SET scan_count = scan_count + 1
    WHERE short_id = p_short_id;
    RETURN v_original_url;
  END IF;
  
  -- Buscar dados do perfil do usuário
  SELECT subscription_tier, monthly_scans, monthly_scans_reset_at
  INTO v_tier, v_monthly_scans, v_reset_at
  FROM user_profiles
  WHERE id = v_user_id;
  
  -- Definir limite baseado no tier
  CASE v_tier
    WHEN 'free' THEN v_max_scans := 1000;
    WHEN 'pro' THEN v_max_scans := 50000;
    WHEN 'enterprise' THEN v_max_scans := NULL; -- Ilimitado
    ELSE v_max_scans := 0;
  END CASE;
  
  -- Se passou do mês, resetar contador
  IF v_reset_at IS NULL OR NOW() >= v_reset_at THEN
    UPDATE user_profiles
    SET 
      monthly_scans = 0,
      monthly_scans_reset_at = DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
    WHERE id = v_user_id;
    v_monthly_scans := 0;
  END IF;
  
  -- Verificar se atingiu o limite (NULL = ilimitado)
  IF v_max_scans IS NOT NULL AND v_monthly_scans >= v_max_scans THEN
    -- Retornar string especial indicando limite atingido
    RETURN 'SCAN_LIMIT_REACHED';
  END IF;
  
  -- Incrementar scan_count do QR Code
  UPDATE qrcodes 
  SET scan_count = scan_count + 1
  WHERE short_id = p_short_id;
  
  -- Incrementar contador mensal do usuário
  UPDATE user_profiles
  SET monthly_scans = monthly_scans + 1
  WHERE id = v_user_id;
  
  RETURN v_original_url;
END;
$$;

COMMENT ON FUNCTION public.increment_scan_count IS 'Incrementa scan_count do QR Code e monthly_scans do usuário, com verificação de limite e reset automático mensal';

-- ========================================
-- 3. FUNÇÃO PARA VERIFICAR LIMITE DE SCANS
-- ========================================
CREATE OR REPLACE FUNCTION public.check_scan_limit(p_user_id UUID)
RETURNS TABLE(
  can_scan BOOLEAN,
  current_scans INTEGER,
  max_scans INTEGER,
  reset_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier TEXT;
  v_monthly_scans INTEGER;
  v_reset_at TIMESTAMPTZ;
  v_max_scans INTEGER;
  v_can_scan BOOLEAN;
BEGIN
  -- Buscar tier e scans do usuário
  SELECT subscription_tier, monthly_scans, monthly_scans_reset_at
  INTO v_tier, v_monthly_scans, v_reset_at
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- Definir limite baseado no tier
  CASE v_tier
    WHEN 'free' THEN v_max_scans := 1000;
    WHEN 'pro' THEN v_max_scans := 50000;
    WHEN 'enterprise' THEN v_max_scans := NULL; -- Ilimitado
    ELSE v_max_scans := 0;
  END CASE;
  
  -- Verificar se pode fazer scan (NULL = ilimitado)
  v_can_scan := (v_max_scans IS NULL) OR (v_monthly_scans < v_max_scans);
  
  -- Retornar resultado
  RETURN QUERY SELECT 
    v_can_scan,
    v_monthly_scans,
    v_max_scans,
    v_reset_at;
END;
$$;

COMMENT ON FUNCTION public.check_scan_limit IS 'Verifica se o usuário ainda pode fazer scans baseado no limite mensal do tier';

-- ========================================
-- 4. POPULAR DADOS EXISTENTES
-- ========================================
-- Inicializar monthly_scans_reset_at para perfis existentes
UPDATE public.user_profiles
SET monthly_scans_reset_at = DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
WHERE monthly_scans_reset_at IS NULL;

-- ========================================
-- 5. VIEW PARA ESTATÍSTICAS DE SCANS
-- ========================================
CREATE OR REPLACE VIEW public.user_scan_stats AS
SELECT 
  up.id AS user_id,
  up.subscription_tier,
  up.monthly_scans,
  up.monthly_scans_reset_at,
  CASE up.subscription_tier
    WHEN 'free' THEN 1000
    WHEN 'pro' THEN 50000
    WHEN 'enterprise' THEN NULL
  END AS max_scans,
  CASE 
    WHEN up.subscription_tier = 'enterprise' THEN 0
    WHEN up.subscription_tier = 'pro' THEN ROUND((up.monthly_scans::DECIMAL / 50000) * 100, 2)
    ELSE ROUND((up.monthly_scans::DECIMAL / 1000) * 100, 2)
  END AS usage_percentage,
  COALESCE(SUM(q.scan_count), 0) AS total_all_time_scans,
  COUNT(q.id) AS total_qrcodes
FROM public.user_profiles up
LEFT JOIN public.qrcodes q ON q.user_id = up.id
GROUP BY up.id, up.subscription_tier, up.monthly_scans, up.monthly_scans_reset_at;

COMMENT ON VIEW public.user_scan_stats IS 'Estatísticas consolidadas de scans por usuário';

-- ========================================
-- 6. RLS PARA A VIEW
-- ========================================
ALTER VIEW public.user_scan_stats SET (security_invoker = true);

-- ========================================
-- 7. FUNÇÃO PARA RESET MANUAL (ADMIN)
-- ========================================
CREATE OR REPLACE FUNCTION public.reset_monthly_scans()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Resetar apenas usuários que já passaram da data de reset
  UPDATE user_profiles
  SET 
    monthly_scans = 0,
    monthly_scans_reset_at = DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
  WHERE NOW() >= monthly_scans_reset_at;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.reset_monthly_scans IS 'Reseta contadores mensais para usuários que passaram da data de reset';
