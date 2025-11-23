import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Proteção de staging - permite webhooks da Stripe
  const hostname = req.headers.get('host') || '';
  const isStaging = hostname.includes('staging.scanqr.com.br');
  const isWebhook = req.nextUrl.pathname.startsWith('/api/stripe/webhook');

  // Proteção por senha em staging (exceto webhooks)
  if (isStaging && !isWebhook) {
    const basicAuth = req.headers.get('authorization');
    const stagingPassword = process.env.STAGING_PASSWORD;

    if (stagingPassword && basicAuth !== `Basic ${btoa(`staging:${stagingPassword}`)}`) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Staging Environment"',
        },
      });
    }
  }

  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();

  // Detectar se está acessando via domínio customizado
  const appDomain = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'localhost:3000';

  // Se não for o domínio principal, verificar se é um domínio customizado
  if (hostname !== appDomain && !hostname.includes('localhost')) {
    const pathname = req.nextUrl.pathname;

    // Padrão: /{shortId} ou /[shortId]
    const shortIdMatch = pathname.match(/^\/([a-zA-Z0-9_-]+)$/);

    if (shortIdMatch) {
      const shortId = shortIdMatch[1];

      // Buscar QR code associado a este domínio customizado
      const { data: qrCode } = await supabase
        .from('qrcodes')
        .select(
          `
          id,
          short_id,
          original_url,
          custom_domain_id,
          custom_domains!inner (
            domain,
            verified,
            mode
          )
        `
        )
        .eq('short_id', shortId)
        .eq('custom_domains.domain', hostname)
        .eq('custom_domains.verified', true)
        .eq('custom_domains.mode', 'routing')
        .single();

      if (qrCode) {
        // Incrementar scan_count
        await supabase.rpc('increment_scan_count', { p_short_id: shortId });

        // Redirecionar para URL original
        return NextResponse.redirect(qrCode.original_url);
      } else {
        // Domínio customizado não encontrado ou não está em modo routing
        // Redirecionar para domínio principal
        const mainUrl = new URL(pathname, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
        return NextResponse.redirect(mainUrl);
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
