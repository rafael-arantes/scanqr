import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 1. A assinatura da função foi corrigida para o padrão do Next.js
export async function DELETE(request: Request, context: { params: { id: string } }) {
  // 2. A forma de pegar o 'id' foi ajustada de acordo com o novo parâmetro 'context'
  const { id } = context.params;
  const cookieStore = cookies();
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
