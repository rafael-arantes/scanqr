import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

type PageProps = {
  params: {
    shortId: string;
  };
};

export default async function ShortIdPage({ params }: PageProps) {
  const { shortId } = params;
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Busca no banco de dados pelo short_id
  const { data, error } = await supabase.from('qrcodes').select('original_url').eq('short_id', shortId).single();

  if (error || !data) {
    // Se não encontrar, mostra a página de 404 Not Found
    return notFound();
  }

  // Se encontrar, redireciona permanentemente para a URL original
  redirect(data.original_url);
}
