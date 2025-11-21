import { createCheckoutSession, getOrCreateCustomer, getTierPrice } from '@/lib/stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/checkout
 * Cria uma Stripe Checkout Session para iniciar processo de pagamento
 */
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Parse body
    const { tier } = await request.json();

    // Validar tier
    if (!tier || (tier !== 'pro' && tier !== 'enterprise')) {
      return NextResponse.json({ error: 'Tier inválido. Use "pro" ou "enterprise"' }, { status: 400 });
    }

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, display_name, stripe_customer_id, subscription_tier')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Erro ao buscar perfil:', profileError);
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    // Email vem do auth.users
    const userEmail = session.user.email || '';
    const userName = profile.display_name || userEmail.split('@')[0];

    // Verificar se usuário já tem esse tier ou superior
    if (profile.subscription_tier === tier) {
      return NextResponse.json({ error: `Você já está no plano ${tier.toUpperCase()}` }, { status: 400 });
    }

    if (tier === 'pro' && profile.subscription_tier === 'enterprise') {
      return NextResponse.json({ error: 'Você já tem um plano superior (Enterprise)' }, { status: 400 });
    }

    // Criar ou buscar Stripe Customer
    const customerId = await getOrCreateCustomer({
      userId: session.user.id,
      email: userEmail,
      name: userName,
      stripeCustomerId: profile.stripe_customer_id,
    });

    // Salvar customer_id no perfil se não existia
    if (!profile.stripe_customer_id) {
      await supabase.from('user_profiles').update({ stripe_customer_id: customerId }).eq('id', session.user.id);
    }

    // Obter price_id do tier
    const priceId = getTierPrice(tier);

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID não configurado para este plano. Configure STRIPE_PRICE_ID_PRO ou STRIPE_PRICE_ID_ENTERPRISE' },
        { status: 500 }
      );
    }

    // URLs de sucesso e cancelamento
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/dashboard?checkout=success`;
    const cancelUrl = `${baseUrl}/upgrade?checkout=canceled`;

    // Criar Checkout Session
    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId,
      userId: session.user.id,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: unknown) {
    console.error('Erro ao criar checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao processar checkout';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
