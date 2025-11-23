'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { canCreateQrCode, getQrCodeLimitMessage, type SubscriptionTier } from '@/lib/subscriptionTiers';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Globe, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type CustomDomain = {
  id: number;
  domain: string;
  verified: boolean;
  mode: 'branding' | 'routing';
};

type CreateQrCodeDialogProps = {
  tier: SubscriptionTier;
  currentQrCount: number;
  onQrCodeCreated?: () => void;
};

export default function CreateQrCodeDialog({ tier, currentQrCount, onQrCodeCreated }: CreateQrCodeDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customDomains, setCustomDomains] = useState<CustomDomain[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(null);
  const supabase = createClientComponentClient();

  // Verificar se pode criar antes de permitir abrir o modal
  const canCreate = canCreateQrCode(tier, currentQrCount);

  // Carregar domínios customizados verificados quando abrir o modal
  const loadCustomDomains = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('custom_domains')
        .select('id, domain, verified, mode')
        .eq('verified', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCustomDomains(data);
      }
    } catch (error) {
      console.error('Erro ao carregar domínios:', error);
    }
  }, [supabase]);

  useEffect(() => {
    if (open && (tier === 'pro' || tier === 'enterprise')) {
      loadCustomDomains();
    }
  }, [open, tier, loadCustomDomains]);

  const handleCreate = async () => {
    if (!url) {
      toast({
        title: 'URL obrigatória',
        description: 'Por favor, insira uma URL válida',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          custom_domain_id: selectedDomainId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'QR Code criado!',
          description: `URL: ${data.shortUrl}`,
          variant: 'success',
        });
        setUrl(''); // Limpa o input
        setOpen(false); // Fecha o modal
        onQrCodeCreated?.(); // Notifica o componente pai para atualizar a lista
      } else {
        if (response.status === 403 && data.upgrade_required) {
          // Limite atingido
          const upgradeMessage = `${data.message}\n\nDeseja fazer upgrade para criar mais QR Codes?`;
          if (confirm(upgradeMessage)) {
            window.location.href = '/upgrade';
          }
        } else {
          toast({
            title: 'Erro',
            description: data.error || 'Erro ao criar QR Code',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Erro ao criar QR Code:', error);
      toast({
        title: 'Erro',
        description: 'Falha na comunicação com o servidor.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Se tentar abrir mas não pode criar, mostrar mensagem
    if (newOpen && !canCreate) {
      const message = getQrCodeLimitMessage(tier, currentQrCount);
      const upgradeMessage = `${message}\n\nDeseja fazer upgrade agora?`;
      if (confirm(upgradeMessage)) {
        window.location.href = '/upgrade';
      }
      return;
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Criar QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo QR Code</DialogTitle>
          <DialogDescription>
            Insira a URL que você deseja transformar em QR Code. Você poderá editar ou excluir depois.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="url">URL de Destino</Label>
            <Input
              id="url"
              placeholder="https://exemplo.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleCreate();
                }
              }}
              disabled={isLoading}
            />
          </div>

          {/* Seleção de Domínio Customizado */}
          {customDomains.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="custom-domain">Domínio Customizado (Opcional)</Label>
              <select
                id="custom-domain"
                value={selectedDomainId || ''}
                onChange={(e) => setSelectedDomainId(e.target.value ? Number(e.target.value) : null)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="">Usar domínio padrão</option>
                {customDomains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domain} {domain.mode === 'routing' ? '🌐' : '🏷️'}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Globe className="w-3 h-3" />
                <span>
                  {selectedDomainId ? 'QR Code será associado a este domínio' : 'O QR Code usará o domínio padrão do app'}
                </span>
              </div>
            </div>
          )}

          <div className="text-sm text-slate-500">
            <p>✨ Seu QR Code será criado instantaneamente</p>
            <p className="mt-1">
              📊 Uso atual:{' '}
              <strong>
                {currentQrCount} de {tier === 'free' ? '10' : tier === 'pro' ? '100' : '∞'}
              </strong>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={isLoading || !url}>
            {isLoading ? 'Criando...' : 'Criar QR Code'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
