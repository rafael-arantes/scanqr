'use client';

import { trackAuth } from '@/lib/umami';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreateQrCodeDialog from './CreateQrCodeDialog';
import DashboardLayout from './DashboardLayout';
import QrCodeList from './QrCodeList';
import QrCodeSearch from './QrCodeSearch';

type QRCodeType = {
  id: number;
  short_id: string;
  original_url: string;
  name: string | null;
  created_at: string;
  scan_count: number;
  custom_domain_id: number | null;
  custom_domains?: {
    id: number;
    domain: string;
    verified: boolean;
    mode: 'branding' | 'routing';
  } | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [qrcodes, setQrcodes] = useState<QRCodeType[]>([]);
  const [filteredQrcodes, setFilteredQrcodes] = useState<QRCodeType[]>([]);
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [_userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [monthlyScans, setMonthlyScans] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push('/login');
      return;
    }

    setUserId(session.user.id);
    setUserEmail(session.user.email || '');

    // Buscar QR Codes com domínios customizados
    const { data: qrcodesData, error: qrError } = await supabase
      .from('qrcodes')
      .select(
        `
        id, 
        short_id, 
        original_url,
        name,
        created_at, 
        scan_count,
        custom_domain_id,
        custom_domains (
          id,
          domain,
          verified,
          mode
        )
      `
      )
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (qrError) {
      console.error('Erro ao buscar QR Codes:', qrError);
    } else {
      // Transformar o array de custom_domains em objeto único
      const transformedData = (qrcodesData || []).map((qr) => ({
        ...qr,
        custom_domains: Array.isArray(qr.custom_domains) && qr.custom_domains.length > 0 ? qr.custom_domains[0] : null,
      })) as QRCodeType[];
      setQrcodes(transformedData);
      setFilteredQrcodes(transformedData);
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier, display_name, avatar_url, monthly_scans, role, stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    setUserTier(profile?.subscription_tier || 'free');
    setDisplayName(profile?.display_name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || '');
    setAvatarUrl(profile?.avatar_url || session.user.user_metadata?.avatar_url || '');
    setMonthlyScans(profile?.monthly_scans || 0);
    setIsAdmin(profile?.role === 'admin');
    setStripeCustomerId(profile?.stripe_customer_id || null);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    // Track login/dashboard access (simple approach - tracks on every dashboard visit)
    // In production, you might want to track only first visit per session
    const hasTrackedLogin = sessionStorage.getItem('umami_login_tracked');
    if (!hasTrackedLogin) {
      trackAuth('login');
      sessionStorage.setItem('umami_login_tracked', 'true');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQrCodeCreated = () => {
    // Recarrega os dados após criar um novo QR Code
    fetchData();
  };

  const handleSearchChange = ({ searchTerm, dateFrom, dateTo }: { searchTerm: string; dateFrom: string; dateTo: string }) => {
    let filtered = [...qrcodes];

    // Filtro de busca textual (nome, URL destino, short_id)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((qr) => {
        const matchesName = qr.name?.toLowerCase().includes(lowerSearch);
        const matchesUrl = qr.original_url.toLowerCase().includes(lowerSearch);
        const matchesShortId = qr.short_id.toLowerCase().includes(lowerSearch);
        return matchesName || matchesUrl || matchesShortId;
      });
    }

    // Filtro de data (de)
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((qr) => new Date(qr.created_at) >= fromDate);
    }

    // Filtro de data (até)
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((qr) => new Date(qr.created_at) <= toDate);
    }

    setFilteredQrcodes(filtered);
  };

  // Admin users get enterprise-level access
  const effectiveTier: 'free' | 'pro' | 'enterprise' = isAdmin ? 'enterprise' : userTier;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Carregando...</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      user={{
        email: userEmail,
        displayName: displayName,
        avatarUrl: avatarUrl,
      }}
      tier={effectiveTier}
      qrCodeCount={qrcodes.length}
      monthlyScans={monthlyScans}
      isAdmin={isAdmin}
      stripeCustomerId={stripeCustomerId}
      onProfileUpdated={fetchData}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 max-w-full">
        <h1 className="text-3xl font-bold truncate">Meus QR Codes</h1>
        <div className="shrink-0 w-full md:w-auto">
          <CreateQrCodeDialog tier={effectiveTier} currentQrCount={qrcodes.length} onQrCodeCreated={handleQrCodeCreated} />
        </div>
      </div>

      {qrcodes && qrcodes.length > 0 && (
        <div className="mb-6">
          <QrCodeSearch onSearchChange={handleSearchChange} />
        </div>
      )}

      {qrcodes && qrcodes.length > 0 ? (
        filteredQrcodes.length > 0 ? (
          <QrCodeList qrcodes={filteredQrcodes} userTier={effectiveTier} />
        ) : (
          <div className="w-full mt-4 p-8 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-3">Nenhum QR Code encontrado com os filtros aplicados.</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm">Tente ajustar sua busca ou limpar os filtros.</p>
          </div>
        )
      ) : (
        <div className="w-full mt-4 p-8 bg-slate-100 rounded-lg text-center">
          <p className="text-slate-500 mb-3">Você ainda não criou nenhum QR Code.</p>
          <CreateQrCodeDialog tier={effectiveTier} currentQrCount={qrcodes.length} onQrCodeCreated={handleQrCodeCreated} />
          <p className="text-slate-400 text-sm mt-4">
            Ou vá para a{' '}
            <Link href="/" className="underline">
              página inicial
            </Link>
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
