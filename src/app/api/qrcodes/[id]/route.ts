import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type RouteParams = {
  params: {
    id: string;
  };
};

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = params;
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // 1. Verificar se o usuário está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // 2. Tentar deletar o QR Code
  // A mágica está no .match(): ele só deletará se o 'id' BATER e o 'user_id' BATER com o do usuário logado.
  // Isso impede que um usuário delete os QR Codes de outro.
  const { error } = await supabase.from('qrcodes').delete().match({ id: id, user_id: session.user.id });

  if (error) {
    console.error('Erro ao deletar QR Code:', error);
    return NextResponse.json({ error: 'Falha ao deletar o QR Code' }, { status: 500 });
  }

  // 3. Retornar sucesso
  return NextResponse.json({ message: 'QR Code deletado com sucesso' }, { status: 200 });
}
