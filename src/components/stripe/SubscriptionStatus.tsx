'use client';

import type { SubscriptionTier } from '@/lib/subscriptionTiers';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionStatusProps {
  tier: SubscriptionTier;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

export default function SubscriptionStatus({
  tier,
  subscriptionStatus,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: SubscriptionStatusProps) {
  // Se é free, não mostrar nada
  if (tier === 'free') {
    return null;
  }

  // Status visual baseado no estado da subscription
  const getStatusDisplay = () => {
    if (!subscriptionStatus) {
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'Status desconhecido',
        color: 'text-gray-600 bg-gray-100',
      };
    }

    switch (subscriptionStatus) {
      case 'active':
        if (cancelAtPeriodEnd) {
          return {
            icon: <Clock className="w-4 h-4" />,
            text: 'Cancela em',
            color: 'text-orange-600 bg-orange-100 border-orange-200',
          };
        }
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          text: 'Ativa',
          color: 'text-green-600 bg-green-100 border-green-200',
        };

      case 'trialing':
        return {
          icon: <Clock className="w-4 h-4" />,
          text: 'Trial',
          color: 'text-blue-600 bg-blue-100 border-blue-200',
        };

      case 'past_due':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Pagamento pendente',
          color: 'text-red-600 bg-red-100 border-red-200',
        };

      case 'canceled':
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: 'Cancelada',
          color: 'text-gray-600 bg-gray-100 border-gray-200',
        };

      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: subscriptionStatus,
          color: 'text-gray-600 bg-gray-100 border-gray-200',
        };
    }
  };

  const status = getStatusDisplay();

  // Formatar data
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renewalDate = formatDate(currentPeriodEnd);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium">
      <div className={`inline-flex items-center gap-1.5 ${status.color} px-2 py-1 rounded`}>
        {status.icon}
        <span>{status.text}</span>
      </div>

      {renewalDate && subscriptionStatus !== 'canceled' && (
        <span className="text-slate-600">
          {cancelAtPeriodEnd ? 'até' : 'renova em'} {renewalDate}
        </span>
      )}

      {subscriptionStatus === 'past_due' && (
        <Link href="/dashboard" className="text-red-600 hover:underline text-xs">
          Atualizar pagamento
        </Link>
      )}
    </div>
  );
}
