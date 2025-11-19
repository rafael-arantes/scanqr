import { canCreateQrCode, getQrCodeLimitMessage, type SubscriptionTier } from '@/lib/subscriptionTiers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { url, custom_domain_id } = await request.json();

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // 1. Verificar se o usuário está logado
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // 2. Buscar tier do usuário
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', session.user.id)
    .single();

  if (profileError) {
    console.error('Erro ao buscar perfil do usuário:', profileError);
  }

  // Fallback para 'free' se não encontrar perfil
  const userTier: SubscriptionTier = profile?.subscription_tier || 'free';

  // 3. Contar QR Codes atuais do usuário
  const { count, error: countError } = await supabase
    .from('qrcodes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id);

  if (countError) {
    console.error('Erro ao contar QR Codes:', countError);
    return NextResponse.json({ error: 'Erro ao verificar limites. Tente novamente.' }, { status: 500 });
  }

  const currentCount = count || 0;

  // 4. GATEKEEPING: Verificar se pode criar mais QR Codes
  if (!canCreateQrCode(userTier, currentCount)) {
    const message = getQrCodeLimitMessage(userTier, currentCount);

    return NextResponse.json(
      {
        error: 'Limite atingido',
        message,
        current_plan: userTier,
        qr_count: currentCount,
        upgrade_required: true,
      },
      { status: 403 }
    );
  }

  // 5. Gerar um ID curto e único
  const shortId = nanoid(8); // Gera um ID com 8 caracteres, ex: "a7B_x9Pq"

  // 5.1. Se custom_domain_id foi fornecido, validar
  if (custom_domain_id) {
    const { data: customDomain, error: domainError } = await supabase
      .from('custom_domains')
      .select('id, verified, user_id')
      .eq('id', custom_domain_id)
      .single();

    if (domainError || !customDomain) {
      return NextResponse.json({ error: 'Domínio customizado não encontrado' }, { status: 404 });
    }

    // Verificar se o domínio pertence ao usuário
    if (customDomain.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Você não tem permissão para usar este domínio' }, { status: 403 });
    }

    // Verificar se o domínio está verificado
    if (!customDomain.verified) {
      return NextResponse.json({ error: 'Este domínio ainda não foi verificado' }, { status: 400 });
    }
  }

  // 6. Inserir no banco de dados
  const { data: _data, error } = await supabase
    .from('qrcodes')
    .insert({
      original_url: url,
      short_id: shortId,
      user_id: session.user.id, // Associa o QR Code ao usuário logado
      custom_domain_id: custom_domain_id || null, // Associa domínio customizado se fornecido
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir no Supabase:', error);
    return NextResponse.json({ error: 'Falha ao encurtar a URL' }, { status: 500 });
  }

  // 7. Retornar a URL encurtada completa com informações de uso
  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${shortId}`;

  return NextResponse.json({
    shortUrl,
    usage: {
      current: currentCount + 1,
      tier: userTier,
      message: getQrCodeLimitMessage(userTier, currentCount + 1),
    },
  });
}
