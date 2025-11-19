import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ShortIdPage({ params }: { params: Promise<{ shortId: string }> }) {
  // Await nos params para acessar os valores
  const { shortId } = await params;

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // Chama a função do banco que incrementa scan_count atomicamente e retorna a URL
  // Isso garante performance máxima (1 query) e integridade dos dados
  // A função também verifica o limite de scans mensais do usuário
  const { data: originalUrl, error } = await supabase.rpc('increment_scan_count', {
    p_short_id: shortId,
  });

  if (error || !originalUrl) {
    console.error('Erro ao buscar/incrementar QR Code:', error);
    return notFound();
  }

  // Se retornou a string especial, significa que o limite foi atingido
  if (originalUrl === 'SCAN_LIMIT_REACHED') {
    redirect('/scan-limit-reached');
  }

  // Redireciona para a URL original
  redirect(originalUrl);
}
