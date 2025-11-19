'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface UpgradeButtonProps {
  tier: 'pro' | 'enterprise';
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
}

export default function UpgradeButton({ tier, children, className, variant = 'default' }: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Erro ao processar upgrade');
        setIsLoading(false);
        return;
      }

      // Redirecionar para Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
      alert('Erro ao processar upgrade. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleUpgrade} disabled={isLoading} className={className} variant={variant}>
      {isLoading ? 'Processando...' : children || `Upgrade para ${tier.toUpperCase()}`}
    </Button>
  );
}
