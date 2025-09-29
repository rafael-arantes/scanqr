import { createClient } from '@supabase/supabase-js'; // 1. Importe o createClient principal
import { notFound, redirect } from 'next/navigation';

// Este componente roda apenas no servidor, então é seguro usar as chaves secretas aqui.

type PageProps = {
  params: {
    shortId: string;
  };
};

export default async function ShortIdPage({ params }: PageProps) {
  const { shortId } = params;

  // 2. Crie um cliente Supabase privilegiado usando as variáveis de ambiente do servidor.
  // Note que não estamos usando o helper de cookies aqui, pois é um acesso anônimo.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Usando a chave secreta!
  );

  // 3. A busca agora ignora as políticas de RLS e encontrará o link.
  const { data, error } = await supabase.from('qrcodes').select('original_url').eq('short_id', shortId).single();

  if (error || !data) {
    return notFound();
  }

  redirect(data.original_url);
}
