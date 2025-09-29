'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';

type DashboardLayoutProps = {
  user: {
    email?: string;
  };
  children: React.ReactNode;
};

export default function DashboardLayout({ user, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-slate-100 flex">
      {/* Main Content (Esquerda) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Header para Mobile com Menu Hambúrguer */}
        <header className="md:hidden flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Meu Painel</h1>
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 rounded-md hover:bg-slate-200">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[340px] p-0">
              <DashboardSidebar user={user} />
            </SheetContent>
          </Sheet>
        </header>

        {/* Renderiza a lista de QR Codes que vem do page.tsx */}
        {children}
      </main>

      {/* Sidebar para Desktop (Direita) */}
      <div className="hidden md:block md:w-[300px] lg:w-[350px] border-l border-slate-200">
        <DashboardSidebar user={user} />
      </div>
    </div>
  );
}
