-- ========================================
-- Migration 007: Fix subscription tier mapping
-- ========================================
-- Problema: A função sync_subscription_tier() usava LIKE '%pro%' 
-- mas os price IDs da Stripe não contêm essas palavras.
-- Solução: Usar os price IDs reais da Stripe
-- ========================================

CREATE OR REPLACE FUNCTION public.sync_subscription_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Mapear price_id para tier
  -- Atualizar baseado no status da subscription
  IF NEW.status = 'active' OR NEW.status = 'trialing' THEN
    -- Determinar tier baseado no price_id real da Stripe
    UPDATE public.user_profiles
    SET 
      subscription_tier = CASE
        -- Staging/Test Price IDs
        WHEN NEW.stripe_price_id = 'price_1SVzNQCiwNK3GDFUk6vVmbDF' THEN 'pro'
        WHEN NEW.stripe_price_id = 'price_1SVzO4CiwNK3GDFUhxsiM7Ll' THEN 'enterprise'
        -- Production/Live Price IDs
        WHEN NEW.stripe_price_id = 'price_1SVzFXCuJfHFjodnkoZlzg3C' THEN 'pro'
        WHEN NEW.stripe_price_id = 'price_1SVzG6CuJfHFjodnybaYgGOa' THEN 'enterprise'
        ELSE subscription_tier -- Mantém o tier atual se não reconhecer
      END,
      updated_at = now()
    WHERE id = NEW.user_id;
    
    RAISE NOTICE 'Subscription tier updated for user % to % (price_id: %)', 
      NEW.user_id, 
      CASE
        WHEN NEW.stripe_price_id = 'price_1SVzNQCiwNK3GDFUk6vVmbDF' THEN 'pro'
        WHEN NEW.stripe_price_id = 'price_1SVzO4CiwNK3GDFUhxsiM7Ll' THEN 'enterprise'
        WHEN NEW.stripe_price_id = 'price_1SVzFXCuJfHFjodnkoZlzg3C' THEN 'pro'
        WHEN NEW.stripe_price_id = 'price_1SVzG6CuJfHFjodnybaYgGOa' THEN 'enterprise'
        ELSE 'unknown'
      END,
      NEW.stripe_price_id;
      
  ELSIF NEW.status IN ('canceled', 'incomplete_expired', 'unpaid') THEN
    -- Downgrade para free se cancelado/expirado
    UPDATE public.user_profiles
    SET 
      subscription_tier = 'free',
      updated_at = now()
    WHERE id = NEW.user_id;
    
    RAISE NOTICE 'Subscription downgraded to free for user % (status: %)', 
      NEW.user_id, 
      NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.sync_subscription_tier() IS 
  'Sincroniza subscription_tier em user_profiles baseado no status da subscription Stripe. Suporta price IDs de staging e production.';
