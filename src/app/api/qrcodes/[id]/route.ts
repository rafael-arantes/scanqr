import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
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
