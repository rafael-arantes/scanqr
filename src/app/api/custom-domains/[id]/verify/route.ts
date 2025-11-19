import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import dns from 'dns/promises';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // DNS module requires Node.js runtime

/**
 * POST /api/custom-domains/[id]/verify
 * Verifica se o domínio está configurado corretamente no DNS
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar domínio
    const { data: domain, error: fetchError } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !domain) {
      return NextResponse.json({ error: 'Domínio não encontrado' }, { status: 404 });
    }

    if (domain.verified) {
      return NextResponse.json({ error: 'Domínio já verificado' }, { status: 400 });
    }

    try {
      // Verificar registro TXT para validação
      const txtRecords = await dns.resolveTxt(`_scanqr-verification.${domain.domain}`);
      const flattenedRecords = txtRecords.flat();

      console.log(`[DNS Verification] Domain: ${domain.domain}`);
      console.log(`[DNS Verification] Expected token: ${domain.verification_token}`);
      console.log(`[DNS Verification] Found records:`, flattenedRecords);

      // Verificar se o token está nos registros TXT
      const isValid = flattenedRecords.some((record) => record.includes(domain.verification_token));

      if (!isValid) {
        console.log(`[DNS Verification] FAILED - Token not found in records`);
        return NextResponse.json(
          {
            error: 'Verificação falhou',
            message: 'Token de verificação não encontrado. Verifique se o registro DNS foi configurado corretamente.',
            found_records: flattenedRecords,
            expected_record: {
              type: 'TXT',
              name: `_scanqr-verification.${domain.domain}`,
              value: domain.verification_token,
            },
          },
          { status: 400 }
        );
      }

      console.log(`[DNS Verification] SUCCESS - Token found!`);

      // Marcar domínio como verificado
      const { error: updateError } = await supabase
        .from('custom_domains')
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (updateError) {
        console.error('Erro ao atualizar domínio:', updateError);
        return NextResponse.json({ error: 'Falha ao verificar domínio' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Domínio verificado com sucesso!',
        domain: domain.domain,
      });
    } catch (error) {
      console.error('[DNS Verification] ERROR:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[DNS Verification] Error details:', errorMessage);

      return NextResponse.json(
        {
          error: 'Falha na verificação DNS',
          message: 'Não foi possível verificar os registros DNS. Aguarde a propagação (pode levar até 48h) e tente novamente.',
          details: errorMessage,
          expected_record: domain
            ? {
                type: 'TXT',
                name: `_scanqr-verification.${domain.domain}`,
                value: domain.verification_token,
              }
            : undefined,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    // Catch externo para erros de parsing, auth, etc
    console.error('[API Error] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        message: 'Ocorreu um erro inesperado. Tente novamente.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
