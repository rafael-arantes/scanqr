'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import type { SubscriptionTier } from '@/lib/subscriptionTiers';
import { Menu } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';

type DashboardLayoutProps = {
  user: {
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  };
  tier: SubscriptionTier;
  qrCodeCount: number;
  monthlyScans: number;
  isAdmin?: boolean;
  children: React.ReactNode;
  onProfileUpdated?: () => void;
};

export default function DashboardLayout({
  user,
  tier,
  qrCodeCount,
  monthlyScans,
  isAdmin,
  children,
  onProfileUpdated,
}: DashboardLayoutProps) {
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
              <DashboardSidebar
                user={user}
                tier={tier}
                qrCodeCount={qrCodeCount}
                monthlyScans={monthlyScans}
                isAdmin={isAdmin}
                onProfileUpdated={onProfileUpdated}
              />
            </SheetContent>
          </Sheet>
        </header>

        {/* Renderiza a lista de QR Codes que vem do page.tsx */}
        {children}
      </main>

      {/* Sidebar para Desktop (Direita) */}
      <div className="hidden md:block md:w-[300px] lg:w-[350px] border-l border-slate-200">
        <DashboardSidebar
          user={user}
          tier={tier}
          qrCodeCount={qrCodeCount}
          monthlyScans={monthlyScans}
          isAdmin={isAdmin}
          onProfileUpdated={onProfileUpdated}
        />
      </div>
    </div>
  );
}
