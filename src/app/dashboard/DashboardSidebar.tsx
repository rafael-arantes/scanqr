import { Button } from '@/components/ui/button';
import {
  getQrCodeLimitMessage,
  getQrCodeUsagePercentage,
  getScansLimitMessage,
  getScansUsagePercentage,
  getTierLimits,
  type SubscriptionTier,
} from '@/lib/subscriptionTiers';
import { Crown, Settings, TrendingUp, User, Zap } from 'lucide-react';
import Link from 'next/link';
import LogoutButton from './LogoutButton';
import ProfileDialog from './ProfileDialog';

// Definimos o tipo de usuário que o componente espera
type UserProps = {
  user: {
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  };
  tier: SubscriptionTier;
  qrCodeCount: number;
  monthlyScans: number;
  onProfileUpdated?: () => void;
};

export default function DashboardSidebar({ user, tier, qrCodeCount, monthlyScans, onProfileUpdated }: UserProps) {
  const limits = getTierLimits(tier);
  const qrUsagePercent = getQrCodeUsagePercentage(tier, qrCodeCount);
  const qrMessage = getQrCodeLimitMessage(tier, qrCodeCount);
  const scansUsagePercent = getScansUsagePercentage(tier, monthlyScans);
  const scansMessage = getScansLimitMessage(tier, monthlyScans);

  // Cores baseadas no uso
  const getProgressColor = (usagePercent: number) => {
    if (usagePercent >= 100) return 'bg-red-500';
    if (usagePercent >= 80) return 'bg-orange-500';
    if (usagePercent >= 60) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getTierIcon = () => {
    if (tier === 'enterprise') return Crown;
    if (tier === 'pro') return Zap;
    return TrendingUp;
  };

  const getTierBadgeColor = () => {
    if (tier === 'enterprise') return 'bg-purple-100 text-purple-700';
    if (tier === 'pro') return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-700';
  };

  const TierIcon = getTierIcon();

  return (
    <aside className="w-full h-full bg-slate-50 p-6 flex flex-col overflow-y-auto">
      <div className="flex-1 space-y-6">
        <h2 className="text-xl font-semibold">Minha Conta</h2>

        {/* Informações do Usuário */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          {user.avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-slate-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`p-2 rounded-full bg-slate-200 text-slate-600 ${user.avatarUrl ? 'hidden' : ''}`}>
            <User size={20} />
          </div>
          <div className="flex-1 min-w-0">
            {user.displayName && <div className="font-medium text-sm text-slate-900 truncate">{user.displayName}</div>}
            <div className={`text-xs text-slate-600 truncate ${user.displayName ? '' : 'text-sm'}`}>{user.email}</div>
          </div>
        </div>

        {/* Informações do Plano */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Plano Atual</span>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getTierBadgeColor()}`}>
              <TierIcon className="h-3.5 w-3.5" />
              {tier === 'free' ? 'Gratuito' : tier === 'pro' ? 'Pro' : 'Enterprise'}
            </div>
          </div>

          {/* Uso de QR Codes */}
          <div className="bg-white rounded-lg p-4 space-y-3 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">QR Codes</span>
              <span className="text-sm font-semibold text-slate-900">
                {qrCodeCount} / {limits.maxQrCodes === 999999 ? '∞' : limits.maxQrCodes}
              </span>
            </div>

            {/* Barra de Progresso */}
            {tier !== 'enterprise' && (
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getProgressColor(qrUsagePercent)}`}
                  style={{ width: `${Math.min(100, qrUsagePercent)}%` }}
                />
              </div>
            )}

            {/* Mensagem de Status */}
            <p className="text-xs text-slate-600">{qrMessage}</p>
          </div>

          {/* Uso de Scans Mensais */}
          <div className="bg-white rounded-lg p-4 space-y-3 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Scans este mês</span>
              <span className="text-sm font-semibold text-slate-900">
                {monthlyScans.toLocaleString('pt-BR')} /{' '}
                {limits.maxScansPerMonth === null ? '∞' : limits.maxScansPerMonth.toLocaleString('pt-BR')}
              </span>
            </div>

            {/* Barra de Progresso */}
            {tier !== 'enterprise' && (
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getProgressColor(scansUsagePercent)}`}
                  style={{ width: `${Math.min(100, scansUsagePercent)}%` }}
                />
              </div>
            )}

            {/* Mensagem de Status */}
            <p className="text-xs text-slate-600">{scansMessage}</p>
          </div>

          {/* Botão de Upgrade */}
          {tier !== 'enterprise' && (
            <Link href="/upgrade" className="block">
              <Button
                className="w-full"
                variant={qrUsagePercent >= 80 || scansUsagePercent >= 80 ? 'default' : 'outline'}
                size="sm"
              >
                {tier === 'free' ? 'Fazer Upgrade' : 'Ver Planos'}
              </Button>
            </Link>
          )}
        </div>

        {/* Links Úteis (Opcional) */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <Link
            href="/dashboard"
            className="block text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md transition-colors"
          >
            📊 Meus QR Codes
          </Link>
          {limits.canCustomizeDomains && (
            <Link
              href="/dashboard/custom-domains"
              className="block text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md transition-colors"
            >
              🌐 Domínios Customizados
            </Link>
          )}
          <Link
            href="/upgrade"
            className="block text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md transition-colors"
          >
            💎 Planos e Preços
          </Link>
          <ProfileDialog onProfileUpdated={onProfileUpdated}>
            <button className="w-full text-left text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações de Perfil
            </button>
          </ProfileDialog>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200">
        <LogoutButton />
      </div>
    </aside>
  );
}
