/**
 * Stripe Client Configuration
 *
 * Centraliza a configuração do cliente Stripe para uso no servidor.
 * Funções helper para operações comuns de subscription.
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não encontrada nas variáveis de ambiente');
}

// Inicializar cliente Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
  appInfo: {
    name: 'ScanQR',
    version: '1.0.0',
  },
});

// Price IDs dos planos (configurar depois de criar produtos na Stripe)
export const STRIPE_PRICES = {
  pro: process.env.STRIPE_PRICE_ID_PRO || '',
  enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
} as const;

// Mapear price_id para tier
export function getPriceTier(priceId: string): 'pro' | 'enterprise' | null {
  if (priceId === STRIPE_PRICES.pro) return 'pro';
  if (priceId === STRIPE_PRICES.enterprise) return 'enterprise';
  return null;
}

// Mapear tier para price_id
export function getTierPrice(tier: 'pro' | 'enterprise'): string {
  return STRIPE_PRICES[tier];
}

/**
 * Criar ou buscar Stripe Customer
 */
export async function getOrCreateCustomer(params: {
  userId: string;
  email: string;
  name?: string;
  stripeCustomerId?: string | null;
}): Promise<string> {
  const { userId, email, name, stripeCustomerId } = params;

  // Se já tem customer ID, retornar
  if (stripeCustomerId) {
    try {
      // Verificar se customer ainda existe
      await stripe.customers.retrieve(stripeCustomerId);
      return stripeCustomerId;
    } catch (error) {
      console.error('Customer não encontrado, criando novo:', error);
    }
  }

  // Criar novo customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });

  return customer.id;
}

/**
 * Criar Checkout Session
 */
export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const { customerId, priceId, userId, successUrl, cancelUrl } = params;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  });

  return session;
}

/**
 * Criar Customer Portal Session
 */
export async function createPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const { customerId, returnUrl } = params;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Buscar subscription ativa do customer
 */
export async function getActiveSubscription(customerId: string): Promise<Stripe.Subscription | null> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  });

  return subscriptions.data[0] || null;
}

/**
 * Cancelar subscription (ao fim do período)
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: cancelAtPeriodEnd,
  });
}

/**
 * Verificar webhook signature
 */
export function constructWebhookEvent(payload: string | Buffer, signature: string, webhookSecret: string): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
