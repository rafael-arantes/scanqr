import { createPortalSession } from '@/lib/stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/portal
 * Cria uma sessão do Customer Portal para gerenciar assinatura
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

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Erro ao buscar perfil:', profileError);
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    if (!profile.stripe_customer_id) {
      return NextResponse.json({ error: 'Você ainda não tem uma assinatura ativa' }, { status: 400 });
    }

    // URL de retorno
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/dashboard`;

    // Criar Portal Session
    const portalSession = await createPortalSession({
      customerId: profile.stripe_customer_id,
      returnUrl,
    });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error: unknown) {
    console.error('Erro ao criar portal session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao abrir portal de gerenciamento';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
