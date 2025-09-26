'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClientComponentClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    await supabase.auth.signInWithOtp({
      email,
      options: {
        // URL para onde o usuário será redirecionado após clicar no link
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center p-8">
        <h1 className="text-2xl font-bold">Verifique seu e-mail</h1>
        <p className="mt-2 text-slate-600">Enviamos um link mágico de login para {email}.</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-8">
      <div className="flex flex-col items-center justify-center gap-6 w-full max-w-sm bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Acessar Painel</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Use seu e-mail para entrar ou se cadastrar.</p>
        </div>
        <form onSubmit={handleSignIn} className="w-full flex flex-col gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              type="email"
              id="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Enviar link mágico
          </Button>
        </form>
      </div>
    </main>
  );
}
