import { constructWebhookEvent } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

// Desabilitar bodyParser para receber raw body
export const dynamic = 'force-dynamic';

// Criar cliente Supabase com service role (bypass RLS)
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * POST /api/stripe/webhook
 * Recebe eventos da Stripe via webhook
 */
export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Assinatura do webhook ausente' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET não configurado');
    return NextResponse.json({ error: 'Webhook não configurado' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    // Verificar assinatura do webhook
    event = constructWebhookEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Erro ao verificar webhook signature:', error);
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 });
  }

  console.log(`[Webhook] Evento recebido: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Webhook] Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[Webhook] Erro ao processar evento ${event.type}:`, error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}

/**
 * Checkout Session Completed
 * Chamado quando usuário completa o checkout
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('[Webhook] Checkout completed:', session.id);

  const userId = session.metadata?.userId;
  const customerId = session.customer as string;

  if (!userId) {
    console.error('userId não encontrado no metadata');
    return;
  }

  // Atualizar stripe_customer_id no perfil
  await supabaseAdmin.from('user_profiles').update({ stripe_customer_id: customerId }).eq('id', userId);

  console.log(`[Webhook] Customer ID ${customerId} vinculado ao usuário ${userId}`);
}

/**
 * Subscription Created/Updated
 * Sincronizar subscription no banco
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('[Webhook] Subscription update:', subscription.id);

  const customerId = subscription.customer as string;
  const userId = subscription.metadata?.userId;

  // Buscar userId pelo customer_id se não estiver no metadata
  let finalUserId = userId;
  if (!finalUserId) {
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    finalUserId = profile?.id;
  }

  if (!finalUserId) {
    console.error('userId não encontrado para subscription:', subscription.id);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const periodStart = (subscription as unknown as { current_period_start?: number }).current_period_start;
  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;

  // Upsert subscription
  const { error } = await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id: finalUserId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    },
    {
      onConflict: 'stripe_subscription_id',
    }
  );

  if (error) {
    console.error('Erro ao salvar subscription:', error);
  } else {
    console.log(`[Webhook] Subscription ${subscription.id} sincronizada para usuário ${finalUserId}`);
  }

  // Trigger sync_subscription_tier irá atualizar o tier automaticamente
}

/**
 * Subscription Deleted
 * Downgrade para Free
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('[Webhook] Subscription deleted:', subscription.id);

  // Atualizar status para canceled
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Erro ao atualizar subscription deletada:', error);
  }

  // Trigger irá fazer downgrade para free automaticamente
}

/**
 * Payment Succeeded
 * Confirmar renovação
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('[Webhook] Payment succeeded:', invoice.id);

  const subscriptionId = (invoice as unknown as { subscription?: string }).subscription;
  if (!subscriptionId) return;

  // Subscription update event irá sincronizar
  console.log(`[Webhook] Pagamento confirmado para subscription ${subscriptionId}`);
}

/**
 * Payment Failed
 * Marcar como past_due
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('[Webhook] Payment failed:', invoice.id);

  const subscriptionId = (invoice as unknown as { subscription?: string }).subscription;
  if (!subscriptionId) return;

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('Erro ao atualizar subscription com pagamento falho:', error);
  }

  // Opcional: enviar email notificando problema no pagamento
}
