import { createClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Helper to track events server-side via Umami API
async function trackServerEvent(eventName: string, eventData?: Record<string, string | number | boolean>) {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const apiEndpoint = process.env.UMAMI_API_ENDPOINT;

  if (!websiteId || !apiEndpoint) {
    return; // Skip if not configured
  }

  try {
    await fetch(`${apiEndpoint}/api/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'event',
        payload: {
          website: websiteId,
          name: eventName,
          data: eventData,
        },
      }),
    });
  } catch (error) {
    // Silently fail - don't block redirects
    console.error('Failed to track event:', error);
  }
}

export default async function ShortIdPage({ params }: { params: Promise<{ shortId: string }> }) {
  // Await nos params para acessar os valores
  const { shortId } = await params;

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // Get QR code info to check for custom domain
  const { data: qrCode } = await supabase
    .from('qrcodes')
    .select('custom_domain_id, user_id, user_profiles(subscription_tier)')
    .eq('short_id', shortId)
    .single();

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

  // Track QR code scan (non-blocking)
  const userProfiles = qrCode?.user_profiles as { subscription_tier?: string } | { subscription_tier?: string }[] | null;
  const tier = Array.isArray(userProfiles) ? userProfiles[0]?.subscription_tier : userProfiles?.subscription_tier;
  
  trackServerEvent('qr-code-scanned', {
    hasCustomDomain: qrCode?.custom_domain_id !== null,
    tier: tier || 'free',
  }).catch(() => {}); // Ignore errors

  // Redireciona para a URL original
  redirect(originalUrl);
}
