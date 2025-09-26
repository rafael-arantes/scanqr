import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import QrCodeList from './QrCodeList';

// Componente de Logout (precisa ser um Client Component)
import LogoutButton from './LogoutButton';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se não houver sessão, redireciona para a página de login
  if (!session) {
    redirect('/login');
  }

  const { data: qrcodes, error } = await supabase
    .from('qrcodes')
    .select('id, short_id, original_url, created_at') // Seleciona as colunas que queremos
    .eq('user_id', session.user.id) // Filtra pelo ID do usuário logado
    .order('created_at', { ascending: false }); // Ordena pelos mais recentes primeiro

  if (error) {
    console.error('Erro ao buscar QR Codes:', error);
    // Você pode adicionar uma mensagem de erro na UI aqui se quiser
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8">
      <div className="flex flex-col items-center justify-center gap-6 w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center w-full">
          <div className="flex justify-between items-center w-full mb-6">
            <h1 className="text-2xl font-bold">Meu Painel</h1>
            <LogoutButton />
          </div>

          <p className="text-slate-600">
            Olá, <span className="font-bold">{session.user.email}</span>!
          </p>
          <p className="text-slate-500 mt-2">Aqui você poderá gerenciar seus QR Codes.</p>
        </div>

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
      </div>
    </main>
  );
}
