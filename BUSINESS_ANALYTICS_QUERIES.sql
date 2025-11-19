-- ========================================
-- QUERIES ÚTEIS PARA ANÁLISE DE NEGÓCIO
-- ========================================
-- Copie e cole estas queries no SQL Editor do Supabase
-- para extrair insights do seu negócio SaaS
-- ========================================

-- ========================================
-- 1. MÉTRICAS GERAIS
-- ========================================

-- Total de usuários por plano
SELECT 
  subscription_tier,
  COUNT(*) as total_users,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM user_profiles
GROUP BY subscription_tier
ORDER BY total_users DESC;

-- Total de QR Codes criados
SELECT COUNT(*) as total_qr_codes FROM qrcodes;

-- Total de scans acumulados
SELECT SUM(scan_count) as total_scans FROM qrcodes;

-- Taxa de conversão Free → Paid
SELECT 
  ROUND(
    (SELECT COUNT(*) FROM user_profiles WHERE subscription_tier != 'free') * 100.0 / 
    (SELECT COUNT(*) FROM user_profiles)
  , 2) as conversion_rate_percent;

-- ========================================
-- 2. ANÁLISE DE CRESCIMENTO
-- ========================================

-- Novos usuários por dia (últimos 30 dias)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users,
  subscription_tier
FROM user_profiles
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), subscription_tier
ORDER BY date DESC;

-- Crescimento de QR Codes por semana
SELECT 
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as new_qr_codes,
  SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('week', created_at)) as cumulative_total
FROM qrcodes
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;

-- Evolução de scans ao longo do tempo
SELECT 
  DATE(created_at) as date,
  SUM(scan_count) as total_scans_on_date
FROM qrcodes
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ========================================
-- 3. ANÁLISE DE ENGAJAMENTO
-- ========================================

-- Top 20 QR Codes mais escaneados
SELECT 
  q.short_id,
  q.original_url,
  q.scan_count,
  u.subscription_tier,
  q.created_at
FROM qrcodes q
JOIN user_profiles u ON q.user_id = u.id
ORDER BY q.scan_count DESC
LIMIT 20;

-- QR Codes nunca escaneados
SELECT 
  COUNT(*) as unused_qr_codes,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM qrcodes), 2) as percentage
FROM qrcodes
WHERE scan_count = 0;

-- Média de scans por QR Code
SELECT 
  ROUND(AVG(scan_count), 2) as avg_scans_per_qr,
  ROUND(STDDEV(scan_count), 2) as stddev
FROM qrcodes;

-- Distribuição de scans (quantos QR Codes em cada faixa)
SELECT 
  CASE 
    WHEN scan_count = 0 THEN '0 scans'
    WHEN scan_count BETWEEN 1 AND 10 THEN '1-10 scans'
    WHEN scan_count BETWEEN 11 AND 50 THEN '11-50 scans'
    WHEN scan_count BETWEEN 51 AND 100 THEN '51-100 scans'
    WHEN scan_count BETWEEN 101 AND 500 THEN '101-500 scans'
    ELSE '500+ scans'
  END as scan_range,
  COUNT(*) as qr_count
FROM qrcodes
GROUP BY scan_range
ORDER BY MIN(scan_count);

-- ========================================
-- 4. ANÁLISE POR TIER
-- ========================================

-- Média de QR Codes por usuário, por tier
SELECT 
  u.subscription_tier,
  COUNT(DISTINCT u.id) as total_users,
  COUNT(q.id) as total_qr_codes,
  ROUND(COUNT(q.id)::numeric / NULLIF(COUNT(DISTINCT u.id), 0), 2) as avg_qr_per_user
FROM user_profiles u
LEFT JOIN qrcodes q ON u.id = q.user_id
GROUP BY u.subscription_tier
ORDER BY avg_qr_per_user DESC;

-- Total de scans por tier
SELECT 
  u.subscription_tier,
  SUM(q.scan_count) as total_scans,
  ROUND(AVG(q.scan_count), 2) as avg_scans_per_qr
FROM user_profiles u
LEFT JOIN qrcodes q ON u.id = q.user_id
GROUP BY u.subscription_tier
ORDER BY total_scans DESC NULLS LAST;

-- ========================================
-- 5. ANÁLISE DE LIMITES E OPORTUNIDADES
-- ========================================

-- Usuários Free próximos do limite (8+ QR Codes)
SELECT 
  u.id,
  COUNT(q.id) as qr_count,
  10 - COUNT(q.id) as remaining,
  CASE 
    WHEN COUNT(q.id) >= 10 THEN 'AT_LIMIT'
    WHEN COUNT(q.id) >= 8 THEN 'NEAR_LIMIT'
    ELSE 'SAFE'
  END as status
FROM user_profiles u
LEFT JOIN qrcodes q ON u.id = q.user_id
WHERE u.subscription_tier = 'free'
GROUP BY u.id
HAVING COUNT(q.id) >= 8
ORDER BY qr_count DESC;

-- Usuários que atingiram o limite Free
SELECT 
  u.id,
  u.created_at as user_since,
  COUNT(q.id) as qr_count,
  SUM(q.scan_count) as total_scans
FROM user_profiles u
LEFT JOIN qrcodes q ON u.id = q.user_id
WHERE u.subscription_tier = 'free'
GROUP BY u.id, u.created_at
HAVING COUNT(q.id) >= 10
ORDER BY total_scans DESC;

-- Usuários Free com alto engajamento (bons candidatos para upgrade)
SELECT 
  u.id,
  COUNT(q.id) as qr_count,
  SUM(q.scan_count) as total_scans,
  ROUND(AVG(q.scan_count), 2) as avg_scans_per_qr,
  MAX(q.scan_count) as max_scans_single_qr
FROM user_profiles u
LEFT JOIN qrcodes q ON u.id = q.user_id
WHERE u.subscription_tier = 'free'
GROUP BY u.id
HAVING SUM(q.scan_count) >= 100  -- Muitos scans
ORDER BY total_scans DESC
LIMIT 50;

-- ========================================
-- 6. ANÁLISE DE RETENÇÃO
-- ========================================

-- Usuários ativos (criaram QR Code nos últimos 30 dias)
SELECT 
  u.subscription_tier,
  COUNT(DISTINCT u.id) as active_users
FROM user_profiles u
JOIN qrcodes q ON u.id = q.user_id
WHERE q.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.subscription_tier;

-- Taxa de churned (usuários sem atividade em 90 dias)
SELECT 
  u.subscription_tier,
  COUNT(DISTINCT u.id) as inactive_users
FROM user_profiles u
WHERE u.id NOT IN (
  SELECT DISTINCT user_id 
  FROM qrcodes 
  WHERE created_at >= NOW() - INTERVAL '90 days'
)
AND u.created_at < NOW() - INTERVAL '90 days'
GROUP BY u.subscription_tier;

-- ========================================
-- 7. ANÁLISE TEMPORAL
-- ========================================

-- Atividade por dia da semana
SELECT 
  TO_CHAR(created_at, 'Day') as day_of_week,
  EXTRACT(DOW FROM created_at) as day_num,
  COUNT(*) as qr_codes_created
FROM qrcodes
GROUP BY TO_CHAR(created_at, 'Day'), EXTRACT(DOW FROM created_at)
ORDER BY day_num;

-- Atividade por hora do dia
SELECT 
  EXTRACT(HOUR FROM created_at) as hour,
  COUNT(*) as qr_codes_created
FROM qrcodes
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour;

-- ========================================
-- 8. ANÁLISE DE PODER DE USUÁRIOS (POWER USERS)
-- ========================================

-- Top 10 usuários mais engajados
SELECT 
  u.id,
  u.subscription_tier,
  u.created_at as member_since,
  COUNT(q.id) as qr_codes_created,
  SUM(q.scan_count) as total_scans,
  ROUND(AVG(q.scan_count), 2) as avg_scans_per_qr,
  MAX(q.scan_count) as best_performing_qr
FROM user_profiles u
LEFT JOIN qrcodes q ON u.id = q.user_id
GROUP BY u.id, u.subscription_tier, u.created_at
ORDER BY total_scans DESC
LIMIT 10;

-- Identificar "campeões" (free users que poderiam ser case studies)
SELECT 
  u.id,
  u.created_at as member_since,
  COUNT(q.id) as qr_codes,
  SUM(q.scan_count) as total_scans,
  ROUND(SUM(q.scan_count) / NULLIF(COUNT(q.id), 0), 2) as avg_scans
FROM user_profiles u
JOIN qrcodes q ON u.id = q.user_id
WHERE u.subscription_tier = 'free'
  AND q.created_at >= NOW() - INTERVAL '90 days'
GROUP BY u.id, u.created_at
HAVING COUNT(q.id) >= 5 AND SUM(q.scan_count) >= 500
ORDER BY total_scans DESC;

-- ========================================
-- 9. ANÁLISE DE RECEITA POTENCIAL (MRR)
-- ========================================

-- MRR atual (assumindo Pro = $9/mês, Enterprise = $49/mês)
SELECT 
  SUM(
    CASE subscription_tier
      WHEN 'pro' THEN 9
      WHEN 'enterprise' THEN 49
      ELSE 0
    END
  ) as current_mrr_usd,
  COUNT(*) FILTER (WHERE subscription_tier = 'pro') as pro_subscribers,
  COUNT(*) FILTER (WHERE subscription_tier = 'enterprise') as enterprise_subscribers
FROM user_profiles;

-- MRR potencial (se todos free users upgradeassem para Pro)
SELECT 
  (SELECT COUNT(*) FROM user_profiles WHERE subscription_tier = 'free') * 9 as potential_additional_mrr_usd;

-- ========================================
-- 10. ANÁLISE DE QUALIDADE DOS QR CODES
-- ========================================

-- URLs mais populares (domínios)
SELECT 
  CASE 
    WHEN original_url LIKE 'https://%' THEN SPLIT_PART(SPLIT_PART(original_url, '://', 2), '/', 1)
    WHEN original_url LIKE 'http://%' THEN SPLIT_PART(SPLIT_PART(original_url, '://', 2), '/', 1)
    ELSE 'unknown'
  END as domain,
  COUNT(*) as qr_count,
  SUM(scan_count) as total_scans
FROM qrcodes
GROUP BY domain
ORDER BY qr_count DESC
LIMIT 20;

-- QR Codes com melhor taxa de conversão (criados recentemente e já com muitos scans)
SELECT 
  short_id,
  original_url,
  scan_count,
  created_at,
  ROUND(scan_count / EXTRACT(EPOCH FROM (NOW() - created_at)) * 86400, 2) as scans_per_day
FROM qrcodes
WHERE created_at >= NOW() - INTERVAL '7 days'
  AND scan_count > 0
ORDER BY scans_per_day DESC
LIMIT 20;

-- ========================================
-- 11. EXPORT PARA DASHBOARD EXTERNO
-- ========================================

-- Snapshot completo para exportar
SELECT 
  DATE_TRUNC('day', NOW()) as snapshot_date,
  (SELECT COUNT(*) FROM user_profiles) as total_users,
  (SELECT COUNT(*) FROM user_profiles WHERE subscription_tier = 'free') as free_users,
  (SELECT COUNT(*) FROM user_profiles WHERE subscription_tier = 'pro') as pro_users,
  (SELECT COUNT(*) FROM user_profiles WHERE subscription_tier = 'enterprise') as enterprise_users,
  (SELECT COUNT(*) FROM qrcodes) as total_qr_codes,
  (SELECT SUM(scan_count) FROM qrcodes) as total_scans,
  (SELECT COUNT(*) FROM qrcodes WHERE scan_count = 0) as unused_qr_codes,
  (SELECT ROUND(AVG(scan_count), 2) FROM qrcodes) as avg_scans_per_qr,
  (SELECT MAX(scan_count) FROM qrcodes) as max_scans_single_qr;

-- ========================================
-- 12. QUERIES DE MANUTENÇÃO
-- ========================================

-- Encontrar usuários órfãos (sem perfil)
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Encontrar perfis órfãos (sem usuário)
SELECT p.id, p.subscription_tier, p.created_at
FROM user_profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- QR Codes de usuários deletados
SELECT q.id, q.short_id, q.created_at, q.scan_count
FROM qrcodes q
LEFT JOIN auth.users u ON q.user_id = u.id
WHERE u.id IS NULL;

-- ========================================
-- DICAS DE USO
-- ========================================

-- Para salvar resultados como CSV:
-- 1. Execute a query no Supabase SQL Editor
-- 2. Clique em "Download as CSV"

-- Para criar views reutilizáveis:
-- CREATE VIEW analytics_daily_summary AS
-- [cole a query aqui]

-- Para agendar exports automáticos:
-- Use Supabase Edge Functions ou cron jobs externos
-- que chamam estas queries via API

-- Para dashboards em tempo real:
-- Conecte Metabase, Grafana ou Power BI ao Supabase
-- usando as credenciais do PostgreSQL
