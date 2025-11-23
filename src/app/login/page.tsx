'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Mail, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await supabase.auth.signInWithOtp({
      email,
      options: {
        // URL para onde o usuário será redirecionado após clicar no link
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    setIsLoading(false);
    setSubmitted(true);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    // O loading continua porque a página vai redirecionar
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-blue-500/10 p-8 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verifique seu e-mail</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Enviamos um link mágico de login para
                <br />
                <strong className="text-slate-900 dark:text-white">{email}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>📧 Próximos passos:</strong>
                </p>
                <ul className="mt-2 text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                  <li>Abra seu e-mail</li>
                  <li>Clique no link de acesso</li>
                  <li>Você será redirecionado para o dashboard</li>
                </ul>
              </div>

              <Button onClick={() => setSubmitted(false)} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>

          <p className="text-center mt-6 text-sm text-slate-600 dark:text-slate-400">
            Não recebeu o e-mail? Verifique sua caixa de spam ou{' '}
            <button onClick={() => setSubmitted(false)} className="text-blue-600 hover:underline font-medium">
              tente novamente
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ScanQR
              </span>
            </Link>
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-blue-500/10 p-8 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Bem-vindo de volta</h1>
              <p className="text-slate-600 dark:text-slate-400">Use seu e-mail para entrar ou criar uma conta</p>
            </div>

            {/* Google Sign In */}
            <Button onClick={handleGoogleSignIn} disabled={isLoading} variant="outline" className="w-full h-12 text-base mb-6">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isLoading ? 'Carregando...' : 'Continuar com Google'}
              </span>
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Ou continue com e-mail
                </span>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Endereço de e-mail
                </Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 text-base"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enviaremos um link mágico para fazer login sem senha
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {isLoading ? 'Enviando...' : 'Continuar com E-mail'}
                </span>
              </Button>
            </form>

            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                <strong className="text-slate-900 dark:text-white">🔒 Seguro e sem senha</strong>
                <br />
                Não armazenamos senhas. Acesse com um link único enviado por e-mail.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-8 space-y-3">
            <p className="text-center text-sm font-medium text-slate-700 dark:text-slate-300">
              O que você ganha ao criar uma conta:
            </p>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-lg">📊</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Analytics em tempo real</strong> de todos os seus QR Codes
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-lg">🔗</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>URLs encurtadas</strong> e personalizadas
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-lg">🎨</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Domínios customizados</strong> para sua marca
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center mt-8 text-sm text-slate-600 dark:text-slate-400">
            Ao continuar, você concorda com nossos{' '}
            <Link href="/termos" className="text-blue-600 hover:underline">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link href="/privacidade" className="text-blue-600 hover:underline">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
