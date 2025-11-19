import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardLayout from '../DashboardLayout';
import CustomDomainsClient from './CustomDomainsClient';

export default async function CustomDomainsPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier, monthly_scans')
    .eq('id', session.user.id)
    .single();

  const userTier = profile?.subscription_tier || 'free';
  const monthlyScans = profile?.monthly_scans || 0;

  // Contar QR Codes para passar para o layout
  const { count } = await supabase.from('qrcodes').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);

  const qrCodeCount = count || 0;

  return (
    <DashboardLayout user={session.user} tier={userTier} qrCodeCount={qrCodeCount} monthlyScans={monthlyScans}>
      <CustomDomainsClient tier={userTier} userId={session.user.id} />
    </DashboardLayout>
  );
}
