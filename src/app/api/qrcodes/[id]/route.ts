import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// FORÇA O MODO DINÂMICO (BOA PRÁTICA PARA APIS)
export const dynamic = 'force-dynamic';

// =============================================================
// NOVO MÉTODO PATCH PARA ATUALIZAR O LINK
// =============================================================
export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const cookieStore = cookies();
  const { id } = context.params;
  const { new_url } = await request.json(); // Esperamos receber a nova URL

  // Validação simples
  if (!new_url) {
    return NextResponse.json({ error: 'Nova URL é obrigatória' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // 1. Verificar se o usuário está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // 2. Atualizar o QR Code no banco
  // O .match() garante que o usuário só pode atualizar o SEU PRÓPRIO link
  const { data, error } = await supabase
    .from('qrcodes')
    .update({ original_url: new_url })
    .match({ id: id, user_id: session.user.id }) // A MÁGICA DA SEGURANÇA!
    .select() // Retorna o item atualizado
    .single();

  if (error) {
    console.error('Erro ao atualizar QR Code:', error);
    if (error.code === 'PGRST116') {
      // Erro "PostgREST error 116" significa "não encontrado"
      return NextResponse.json({ error: 'QR Code não encontrado ou você não tem permissão' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Falha ao atualizar o QR Code' }, { status: 500 });
  }

  // 3. Retornar sucesso com o dado atualizado
  return NextResponse.json(data);
}

// =============================================================
// MÉTODO DELETE (QUE VOCÊ JÁ TINHA)
// =============================================================
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const cookieStore = cookies();
  const { id } = context.params;
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

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
