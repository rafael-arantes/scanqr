import type { SubscriptionTier } from '@/lib/subscriptionTiers';
import { canAddCustomDomain, getCustomDomainLimitMessage } from '@/lib/subscriptionTiers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/custom-domains
 * Lista todos os domínios customizados do usuário
 */
export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Buscar domínios com estatísticas
  const { data: statsData, error: statsError } = await supabase
    .from('custom_domains_stats')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (statsError) {
    console.error('Erro ao buscar domínios:', statsError);
    return NextResponse.json({ error: 'Falha ao buscar domínios' }, { status: 500 });
  }

  // Buscar tokens de verificação (não incluídos na view por segurança)
  const { data: tokensData } = await supabase
    .from('custom_domains')
    .select('id, verification_token')
    .eq('user_id', session.user.id);

  // Combinar estatísticas com tokens
  const domains = (statsData || []).map((domain) => {
    const tokenInfo = tokensData?.find((t) => t.id === domain.id);
    return {
      ...domain,
      verification_token: tokenInfo?.verification_token || '',
    };
  });

  return NextResponse.json({ domains });
}

/**
 * POST /api/custom-domains
 * Adiciona um novo domínio customizado
 */
export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { domain, mode = 'branding' } = await request.json();

  if (!domain || typeof domain !== 'string') {
    return NextResponse.json({ error: 'Domínio inválido' }, { status: 400 });
  }

  // Validar modo
  if (mode !== 'branding' && mode !== 'routing') {
    return NextResponse.json({ error: 'Modo inválido. Use "branding" ou "routing"' }, { status: 400 });
  }

  // Validar formato do domínio
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
  if (!domainRegex.test(domain)) {
    return NextResponse.json(
      { error: 'Formato de domínio inválido. Use apenas letras, números, pontos e hífens.' },
      { status: 400 }
    );
  }

  // Buscar tier do usuário
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', session.user.id)
    .single();

  const userTier: SubscriptionTier = profile?.subscription_tier || 'free';

  // GATEKEEPING: Modo routing apenas para Pro e Enterprise
  if (mode === 'routing' && userTier === 'free') {
    return NextResponse.json(
      {
        error: 'Recurso não disponível',
        message:
          'Modo routing está disponível apenas nos planos Pro e Enterprise. Faça upgrade para usar domínios customizados nas URLs dos seus QR codes.',
        current_plan: userTier,
        upgrade_required: true,
      },
      { status: 403 }
    );
  }

  // Contar domínios existentes
  const { count } = await supabase
    .from('custom_domains')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id);

  const currentCount = count || 0;

  // GATEKEEPING: Verificar se pode adicionar mais domínios
  if (!canAddCustomDomain(userTier, currentCount)) {
    const message = getCustomDomainLimitMessage(userTier, currentCount);
    return NextResponse.json(
      {
        error: 'Limite atingido',
        message,
        current_plan: userTier,
        domain_count: currentCount,
        upgrade_required: userTier === 'free',
      },
      { status: 403 }
    );
  }

  // Inserir domínio
  const { data: newDomain, error } = await supabase
    .from('custom_domains')
    .insert({
      user_id: session.user.id,
      domain: domain.toLowerCase(),
      mode: mode,
    })
    .select()
    .single();

  if (error) {
    // Domínio duplicado
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Este domínio já está em uso' }, { status: 409 });
    }

    console.error('Erro ao inserir domínio:', error);
    return NextResponse.json({ error: 'Falha ao adicionar domínio' }, { status: 500 });
  }

  // Buscar domínio recém-criado com estatísticas
  const { data: domainWithStats } = await supabase.from('custom_domains_stats').select('*').eq('id', newDomain.id).single();

  return NextResponse.json({
    domain: domainWithStats
      ? {
          ...domainWithStats,
          verification_token: newDomain.verification_token, // Adiciona o token que não vem da view
        }
      : {
          ...newDomain,
          qr_codes_count: 0,
          total_scans: 0,
        },
    message: 'Domínio adicionado com sucesso! Configure os registros DNS para verificação.',
  });
}
