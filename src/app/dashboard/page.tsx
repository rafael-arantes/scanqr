import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardLayout from './DashboardLayout'; // Importe o novo layout
import QrCodeList from './QrCodeList';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: qrcodes, error } = await supabase
    .from('qrcodes')
    .select('id, short_id, original_url, created_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar QR Codes:', error);
  }

  return (
    <DashboardLayout user={session.user}>
      <h1 className="hidden md:block text-3xl font-bold mb-6">Meus QR Codes</h1>
      {qrcodes && qrcodes.length > 0 ? (
        <QrCodeList qrcodes={qrcodes} />
      ) : (
        <div className="w-full mt-4 p-8 bg-slate-100 rounded-lg text-center">
          <p className="text-slate-500">Você ainda não criou nenhum QR Code.</p>
          <p className="text-slate-400 text-sm mt-2">
            Vá para a{' '}
            <a href="/" className="underline">
              página inicial
            </a>{' '}
            para começar!
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
