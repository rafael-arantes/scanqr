/**
 * EXEMPLO: Componente de Status de Plano
 *
 * Este componente exibe visualmente o uso do plano do usuário.
 * Pode ser adicionado ao Dashboard para dar visibilidade sobre limites.
 *
 * Para usar, adicione este componente em: src/app/dashboard/page.tsx
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  getQrCodeLimitMessage,
  getQrCodeUsagePercentage,
  getRemainingQrCodes,
  getTierLimits,
  type SubscriptionTier,
} from '@/lib/subscriptionTiers';
import { AlertCircle, Check, Crown, Zap } from 'lucide-react';
import Link from 'next/link';

interface PlanStatusBannerProps {
  tier: SubscriptionTier;
  qrCodeCount: number;
}

export default function PlanStatusBanner({ tier, qrCodeCount }: PlanStatusBannerProps) {
  const limits = getTierLimits(tier);
  const usagePercent = getQrCodeUsagePercentage(tier, qrCodeCount);
  const remaining = getRemainingQrCodes(tier, qrCodeCount);
  const message = getQrCodeLimitMessage(tier, qrCodeCount);

  // Definir cor baseada no uso
  const getColorClasses = () => {
    if (usagePercent >= 100) return 'bg-red-50 border-red-200 text-red-700';
    if (usagePercent >= 80) return 'bg-orange-50 border-orange-200 text-orange-700';
    if (usagePercent >= 60) return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    return 'bg-blue-50 border-blue-200 text-blue-700';
  };

  const getProgressColor = () => {
    if (usagePercent >= 100) return 'bg-red-500';
    if (usagePercent >= 80) return 'bg-orange-500';
    if (usagePercent >= 60) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getIcon = () => {
    if (tier === 'enterprise') return <Crown className="h-5 w-5" />;
    if (tier === 'pro') return <Zap className="h-5 w-5" />;
    if (usagePercent >= 80) return <AlertCircle className="h-5 w-5" />;
    return <Check className="h-5 w-5" />;
  };

  return (
    <div className={`rounded-lg border p-4 mb-6 ${getColorClasses()}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5">{getIcon()}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                Plano {tier === 'free' ? 'Gratuito' : tier === 'pro' ? 'Pro' : 'Enterprise'}
              </h3>
              {tier !== 'enterprise' && (
                <span className="text-xs opacity-75">
                  {qrCodeCount} / {limits.maxQrCodes} QR Codes
                </span>
              )}
            </div>
            <p className="text-sm mb-3">{message}</p>

            {/* Barra de Progresso */}
            {tier !== 'enterprise' && (
              <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getProgressColor()}`}
                  style={{ width: `${Math.min(100, usagePercent)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Botão de Upgrade */}
        {tier !== 'enterprise' && remaining <= 2 && (
          <Link href="/upgrade">
            <Button size="sm" className="shrink-0">
              {tier === 'free' ? 'Upgrade' : 'Ver Planos'}
            </Button>
          </Link>
        )}
      </div>

      {/* Features do Plano Atual */}
      {tier === 'free' && (
        <div className="mt-4 pt-4 border-t border-current/10">
          <p className="text-xs font-medium mb-2">Desbloqueie com o Plano Pro:</p>
          <ul className="text-xs space-y-1 opacity-90">
            <li>✨ Até 100 QR Codes</li>
            <li>📊 Analytics avançado</li>
            <li>🎨 Domínios customizados</li>
            <li>📥 Exportação de dados</li>
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * EXEMPLO DE USO NO DASHBOARD:
 *
 * Em src/app/dashboard/page.tsx, adicione:
 *
 * 1. Busque o perfil do usuário:
 *
 * const { data: profile } = await supabase
 *   .from('user_profiles')
 *   .select('subscription_tier')
 *   .eq('id', session.user.id)
 *   .single();
 *
 * const tier = profile?.subscription_tier || 'free';
 *
 * 2. Passe os dados para o layout:
 *
 * <DashboardLayout user={session.user}>
 *   <PlanStatusBanner tier={tier} qrCodeCount={qrcodes?.length || 0} />
 *   <h1 className="text-3xl font-bold mb-6">Meus QR Codes</h1>
 *   ...
 * </DashboardLayout>
 */
