import { createClient } from '@supabase/supabase-js'; // 1. Importe o createClient principal
import { notFound, redirect } from 'next/navigation';

type PageProps = {
  params: {
    shortId: string;
  };
};

export default async function ShortIdPage({ params }: PageProps) {
  const { shortId } = params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Usando a chave secreta!
  );

  const { data, error } = await supabase.from('qrcodes').select('original_url').eq('short_id', shortId).single();

  if (error || !data) {
    return notFound();
  }

  redirect(data.original_url);
}
