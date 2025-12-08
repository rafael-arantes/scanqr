'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import type { SubscriptionTier } from '@/lib/subscriptionTiers';
import { Menu } from 'lucide-react';
import Image from 'next/image';
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
  stripeCustomerId?: string | null;
  children: React.ReactNode;
  onProfileUpdated?: () => void;
};

export default function DashboardLayout({
  user,
  tier,
  qrCodeCount,
  monthlyScans,
  isAdmin,
  stripeCustomerId,
  children,
  onProfileUpdated,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-slate-100 flex overflow-hidden">
      {/* Main Content (Esquerda) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
        {/* Header para Mobile com Menu Hambúrguer */}
        <header className="lg:hidden flex items-center justify-between mb-4">
          <Image src="/scan-qr-svg.svg" alt="ScanQR" width={237} height={56} className="h-10 w-auto" priority />
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
                stripeCustomerId={stripeCustomerId}
                onProfileUpdated={onProfileUpdated}
              />
            </SheetContent>
          </Sheet>
        </header>

        {/* Renderiza a lista de QR Codes que vem do page.tsx */}
        {children}
      </main>

      {/* Sidebar para Desktop (Direita) */}
      <div className="hidden lg:block lg:w-[350px] border-l border-slate-200">
        <DashboardSidebar
          user={user}
          tier={tier}
          qrCodeCount={qrCodeCount}
          monthlyScans={monthlyScans}
          isAdmin={isAdmin}
          stripeCustomerId={stripeCustomerId}
          onProfileUpdated={onProfileUpdated}
        />
      </div>
    </div>
  );
}
