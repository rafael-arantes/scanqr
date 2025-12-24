'use client';

import { Button } from '@/components/ui/button';
import { trackAuth } from '@/lib/umami';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    trackAuth('logout');
    router.push('/login');
    router.refresh();
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Sair
    </Button>
  );
}
