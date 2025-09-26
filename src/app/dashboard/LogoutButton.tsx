'use client';

import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Atualiza a página para refletir o estado de logout
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Sair
    </Button>
  );
}
