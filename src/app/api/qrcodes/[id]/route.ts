import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { new_url, name, custom_domain_id } = await request.json();

  // Validação simples
  if (!new_url) {
    return NextResponse.json({ error: 'Nova URL é obrigatória' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  // 1. Verificar se o usuário está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // 1.1. Se custom_domain_id foi fornecido, validar
  if (custom_domain_id) {
    const { data: customDomain, error: domainError } = await supabase
      .from('custom_domains')
      .select('id, verified, user_id')
      .eq('id', custom_domain_id)
      .single();

    if (domainError || !customDomain) {
      return NextResponse.json({ error: 'Domínio customizado não encontrado' }, { status: 404 });
    }

    if (customDomain.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Você não tem permissão para usar este domínio' }, { status: 403 });
    }

    if (!customDomain.verified) {
      return NextResponse.json({ error: 'Este domínio ainda não foi verificado' }, { status: 400 });
    }
  }

  // 2. Atualizar o QR Code no banco
  const { data, error } = await supabase
    .from('qrcodes')
    .update({
      original_url: new_url,
      custom_domain_id: custom_domain_id || null,
      ...(name !== undefined && { name: name || null }),
    })
    .match({ id: id, user_id: session.user.id })
    .select(
      `
      id, 
      short_id, 
      original_url,
      name,
      created_at, 
      scan_count,
      custom_domain_id,
      custom_domains (
        id,
        domain,
        verified,
        mode
      )
    `
    )
    .single();

  if (error) {
    console.error('Erro ao atualizar QR Code:', error);
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'QR Code não encontrado ou você não tem permissão' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Falha ao atualizar o QR Code' }, { status: 500 });
  }

  // 3. Retornar sucesso com o dado atualizado
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { error } = await supabase.from('qrcodes').delete().match({ id: id, user_id: session.user.id });

  if (error) {
    console.error('Erro ao deletar QR Code:', error);
    return NextResponse.json({ error: 'Falha ao deletar o QR Code' }, { status: 500 });
  }

  return NextResponse.json({ message: 'QR Code deletado com sucesso' }, { status: 200 });
}
