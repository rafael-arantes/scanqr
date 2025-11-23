'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface UpgradeButtonProps {
  tier: 'pro' | 'enterprise';
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
}

export default function UpgradeButton({ tier, children, className, variant = 'default' }: UpgradeButtonProps) {
  const { toast } = useToast();
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
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao processar upgrade',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Redirecionar para Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao processar upgrade. Tente novamente.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleUpgrade} disabled={isLoading} className={className} variant={variant}>
      {isLoading ? 'Processando...' : children || `Upgrade para ${tier.toUpperCase()}`}
    </Button>
  );
}
