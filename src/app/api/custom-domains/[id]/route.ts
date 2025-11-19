import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/custom-domains/[id]
 * Remove um domínio customizado
 */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { error } = await supabase.from('custom_domains').delete().eq('id', id).eq('user_id', session.user.id);

  if (error) {
    console.error('Erro ao deletar domínio:', error);
    return NextResponse.json({ error: 'Falha ao remover domínio' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Domínio removido com sucesso' });
}
