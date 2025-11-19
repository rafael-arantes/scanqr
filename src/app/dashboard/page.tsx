'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreateQrCodeDialog from './CreateQrCodeDialog';
import DashboardLayout from './DashboardLayout';
import QrCodeList from './QrCodeList';

type QRCodeType = {
  id: number;
  short_id: string;
  original_url: string;
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
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [monthlyScans, setMonthlyScans] = useState<number>(0);
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
      setQrcodes(qrcodesData || []);
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier, display_name, avatar_url, monthly_scans')
      .eq('id', session.user.id)
      .single();

    setUserTier(profile?.subscription_tier || 'free');
    setDisplayName(profile?.display_name || '');
    setAvatarUrl(profile?.avatar_url || '');
    setMonthlyScans(profile?.monthly_scans || 0);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQrCodeCreated = () => {
    // Recarrega os dados após criar um novo QR Code
    fetchData();
  };

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
        id: userId,
        email: userEmail,
        displayName: displayName,
        avatarUrl: avatarUrl,
      }}
      tier={userTier}
      qrCodeCount={qrcodes.length}
      monthlyScans={monthlyScans}
      onProfileUpdated={fetchData}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Meus QR Codes</h1>
        <CreateQrCodeDialog tier={userTier} currentQrCount={qrcodes.length} onQrCodeCreated={handleQrCodeCreated} />
      </div>

      {qrcodes && qrcodes.length > 0 ? (
        <QrCodeList qrcodes={qrcodes} userTier={userTier} />
      ) : (
        <div className="w-full mt-4 p-8 bg-slate-100 rounded-lg text-center">
          <p className="text-slate-500 mb-3">Você ainda não criou nenhum QR Code.</p>
          <CreateQrCodeDialog tier={userTier} currentQrCount={qrcodes.length} onQrCodeCreated={handleQrCodeCreated} />
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
