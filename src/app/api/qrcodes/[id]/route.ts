import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { new_url } = await request.json();

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

  // 2. Atualizar o QR Code no banco
  const { data, error } = await supabase
    .from('qrcodes')
    .update({ original_url: new_url })
    .match({ id: id, user_id: session.user.id })
    .select()
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
