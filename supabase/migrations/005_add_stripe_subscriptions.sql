-- ========================================
-- MIGRAÇÃO: Stripe Subscriptions
-- ========================================
-- Objetivo: Integração com Stripe para gerenciamento de assinaturas
-- Data: 2025-11-19
-- ========================================

-- 1. CRIAR TABELA SUBSCRIPTIONS
-- ========================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stripe IDs
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  
  -- Status da assinatura
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  
  -- Período de cobrança
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Cancelamento
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  
  -- Trial
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Comentários
COMMENT ON TABLE public.subscriptions IS 'Assinaturas Stripe dos usuários';
COMMENT ON COLUMN public.subscriptions.status IS 'Status: active, canceled, incomplete, incomplete_expired, past_due, trialing, unpaid';
COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS 'Se true, cancela ao fim do período atual';

-- ========================================
-- 2. ÍNDICES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
  ON public.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id 
  ON public.subscriptions(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id 
  ON public.subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_status 
  ON public.subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_active 
  ON public.subscriptions(user_id, status)
  WHERE status = 'active';

-- ========================================
-- 3. ADICIONAR STRIPE_CUSTOMER_ID EM USER_PROFILES
-- ========================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE public.user_profiles 
            ADD COLUMN stripe_customer_id TEXT UNIQUE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id 
  ON public.user_profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

COMMENT ON COLUMN public.user_profiles.stripe_customer_id IS 'ID do customer na Stripe';

-- ========================================
-- 4. RLS POLICIES
-- ========================================

-- Habilitar RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Usuários podem ler suas próprias assinaturas
CREATE POLICY "Usuários podem ler suas próprias assinaturas"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Apenas sistema pode inserir/atualizar (via service role)
-- Não criamos policy para INSERT/UPDATE pois webhooks usam service role

-- ========================================
-- 5. FUNÇÃO PARA ATUALIZAR TIER BASEADO NA SUBSCRIPTION
-- ========================================
CREATE OR REPLACE FUNCTION public.sync_subscription_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Mapear price_id para tier
  -- Atualizar baseado no status da subscription
  IF NEW.status = 'active' OR NEW.status = 'trialing' THEN
    -- Determinar tier baseado no price_id
    -- Você precisa substituir pelos seus price IDs reais
    UPDATE public.user_profiles
    SET 
      subscription_tier = CASE
        -- Substitua pelos seus price IDs da Stripe
        WHEN NEW.stripe_price_id LIKE '%pro%' THEN 'pro'
        WHEN NEW.stripe_price_id LIKE '%enterprise%' THEN 'enterprise'
        ELSE subscription_tier -- Mantém o tier atual se não reconhecer
      END,
      updated_at = now()
    WHERE id = NEW.user_id;
  ELSIF NEW.status IN ('canceled', 'incomplete_expired', 'unpaid') THEN
    -- Downgrade para free se cancelado/expirado
    UPDATE public.user_profiles
    SET 
      subscription_tier = 'free',
      updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para sincronizar tier automaticamente
DROP TRIGGER IF EXISTS trigger_sync_subscription_tier ON public.subscriptions;
CREATE TRIGGER trigger_sync_subscription_tier
  AFTER INSERT OR UPDATE OF status, stripe_price_id
  ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_subscription_tier();

COMMENT ON FUNCTION public.sync_subscription_tier() IS 'Sincroniza subscription_tier em user_profiles baseado no status da subscription Stripe';

-- ========================================
-- 6. FUNÇÃO PARA ATUALIZAR UPDATED_AT
-- ========================================
CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trigger_update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscriptions_updated_at();

-- ========================================
-- 7. VIEW PARA SUBSCRIPTION STATUS
-- ========================================
CREATE OR REPLACE VIEW public.subscription_status AS
SELECT 
  s.id,
  s.user_id,
  s.stripe_customer_id,
  s.stripe_subscription_id,
  s.status,
  s.current_period_start,
  s.current_period_end,
  s.cancel_at_period_end,
  s.canceled_at,
  s.trial_end,
  up.subscription_tier,
  -- Flags úteis
  (s.status = 'active' OR s.status = 'trialing') as is_active,
  (s.current_period_end < now()) as is_expired,
  (s.trial_end > now()) as is_in_trial
FROM public.subscriptions s
LEFT JOIN public.user_profiles up ON s.user_id = up.id;

COMMENT ON VIEW public.subscription_status IS 'View consolidada de status de assinaturas com flags úteis';

-- ========================================
-- 8. GRANTS
-- ========================================

-- Authenticated users podem ler suas próprias subscriptions
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.subscription_status TO authenticated;

-- Service role tem acesso total (para webhooks)
GRANT ALL ON public.subscriptions TO service_role;
