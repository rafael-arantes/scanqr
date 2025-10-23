import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ShortIdPage({ params }: { params: Promise<{ shortId: string }> }) {
  // Await nos params para acessar os valores
  const { shortId } = await params;

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data, error } = await supabase.from('qrcodes').select('original_url').eq('short_id', shortId).single();

  if (error || !data) {
    return notFound();
  }

  redirect(data.original_url);
}
