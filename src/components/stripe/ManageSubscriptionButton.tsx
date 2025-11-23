'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';
import { useState } from 'react';

interface ManageSubscriptionButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  showIcon?: boolean;
}

export default function ManageSubscriptionButton({
  children,
  className,
  variant = 'outline',
  showIcon = true,
}: ManageSubscriptionButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleManage = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao abrir portal de gerenciamento',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Redirecionar para Customer Portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erro ao abrir portal:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao abrir portal de gerenciamento. Tente novamente.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleManage} disabled={isLoading} className={className} variant={variant}>
      {showIcon && <Settings className="w-4 h-4 mr-2" />}
      {isLoading ? 'Abrindo...' : children || 'Gerenciar Assinatura'}
    </Button>
  );
}
