/**
 * EXEMPLO: Implementação de Gatekeeping
 *
 * Este arquivo demonstra como implementar verificação de limites
 * no endpoint de criação de QR Codes.
 *
 * Para usar, copie este código para: src/app/api/shorten/route.ts
 */

import type { SubscriptionTier } from '@/lib/subscriptionTiers';
import { canCreateQrCode, getQrCodeLimitMessage } from '@/lib/subscriptionTiers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { url } = await request.json();

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // 1. Verificar se o usuário está logado
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // ========================================
  // 2. BUSCAR TIER DO USUÁRIO (NOVO)
  // ========================================
  let { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile) {
    console.error('Erro ao buscar perfil do usuário:', profileError);
    // Fallback: assume plano free se não encontrar perfil
    profile = { subscription_tier: 'free' as SubscriptionTier };
  }

  // ========================================
  // 3. CONTAR QR CODES DO USUÁRIO (NOVO)
  // ========================================
  const { count, error: countError } = await supabase
    .from('qrcodes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id);

  if (countError) {
    console.error('Erro ao contar QR Codes:', countError);
    return NextResponse.json({ error: 'Erro ao verificar limites. Tente novamente.' }, { status: 500 });
  }

  const currentCount = count || 0;

  // ========================================
  // 4. VERIFICAR LIMITE (GATEKEEPING) (NOVO)
  // ========================================
  if (!canCreateQrCode(profile.subscription_tier, currentCount)) {
    const message = getQrCodeLimitMessage(profile.subscription_tier, currentCount);

    return NextResponse.json(
      {
        error: 'Limite atingido',
        message,
        current_plan: profile.subscription_tier,
        qr_count: currentCount,
        upgrade_required: true,
      },
      { status: 403 } // 403 Forbidden
    );
  }

  // ========================================
  // 5. CRIAR QR CODE (CÓDIGO ORIGINAL)
  // ========================================
  const shortId = nanoid(8);

  const { data, error } = await supabase
    .from('qrcodes')
    .insert({
      original_url: url,
      short_id: shortId,
      user_id: session.user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir no Supabase:', error);
    return NextResponse.json({ error: 'Falha ao encurtar a URL' }, { status: 500 });
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${shortId}`;

  // ========================================
  // 6. RETORNAR COM INFORMAÇÕES DE USO (NOVO)
  // ========================================
  return NextResponse.json({
    shortUrl,
    // Informações extras para o frontend mostrar
    usage: {
      current: currentCount + 1, // +1 porque acabamos de criar
      tier: profile.subscription_tier,
      message: getQrCodeLimitMessage(profile.subscription_tier, currentCount + 1),
    },
  });
}
