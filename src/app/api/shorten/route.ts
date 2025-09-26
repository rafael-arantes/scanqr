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

  // 2. Gerar um ID curto e único
  const shortId = nanoid(8); // Gera um ID com 8 caracteres, ex: "a7B_x9Pq"

  // 3. Inserir no banco de dados
  const { data, error } = await supabase
    .from('qrcodes')
    .insert({
      original_url: url,
      short_id: shortId,
      user_id: session.user.id, // Associa o QR Code ao usuário logado
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir no Supabase:', error);
    return NextResponse.json({ error: 'Falha ao encurtar a URL' }, { status: 500 });
  }

  // 4. Retornar a URL encurtada completa
  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${shortId}`;

  return NextResponse.json({ shortUrl });
}
