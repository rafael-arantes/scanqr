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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Crown, Mail, TrendingUp, User, Zap } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type SubscriptionTier = 'free' | 'pro' | 'enterprise';

type ProfileDialogProps = {
  children?: React.ReactNode;
  onProfileUpdated?: () => void;
};

export default function ProfileDialog({ children, onProfileUpdated }: ProfileDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClientComponentClient();

  // User data
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [userId, setUserId] = useState('');

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      setUserId(session.user.id);
      setEmail(session.user.email || '');

      // Get profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name, avatar_url, subscription_tier')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        // Pré-preencher com dados do Google se não tiver no perfil
        setDisplayName(
          profile.display_name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || ''
        );
        setAvatarUrl(profile.avatar_url || session.user.user_metadata?.avatar_url || '');
        setTier(profile.subscription_tier);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open, loadProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: displayName || null,
          // Avatar URL não é mais editável pelo usuário
          // Mantém o valor atual do Google
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso!',
        variant: 'success',
      });

      // Notificar componente pai para recarregar dados
      if (onProfileUpdated) {
        onProfileUpdated();
      }

      setOpen(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar perfil. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getTierInfo = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return {
          name: 'Free',
          icon: User,
          color: 'text-slate-600 dark:text-slate-400',
          bgColor: 'bg-slate-100 dark:bg-slate-800',
          borderColor: 'border-slate-300 dark:border-slate-600',
        };
      case 'pro':
        return {
          name: 'Pro',
          icon: Zap,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          borderColor: 'border-blue-300 dark:border-blue-600',
        };
      case 'enterprise':
        return {
          name: 'Enterprise',
          icon: Crown,
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900/30',
          borderColor: 'border-purple-300 dark:border-purple-600',
        };
    }
  };

  const tierInfo = getTierInfo(tier);
  const TierIcon = tierInfo.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Meu Perfil</DialogTitle>
          <DialogDescription>Personalize suas informações e configurações da conta.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Tier Badge */}
            <div className={`p-4 rounded-xl border-2 ${tierInfo.bgColor} ${tierInfo.borderColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 ${tierInfo.color}`}>
                    <TierIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Plano Atual</div>
                    <div className={`text-xl font-bold ${tierInfo.color}`}>{tierInfo.name}</div>
                  </div>
                </div>
                {tier === 'free' && (
                  <Link href="/upgrade">
                    <Button
                      size="sm"
                      className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <TrendingUp className="w-4 h-4 mr-1.5" />
                      Upgrade
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input id="email" type="email" value={email} disabled className="pl-10 bg-slate-50 dark:bg-slate-900" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Email não pode ser alterado. Gerenciado pelo Supabase Auth.
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-semibold">
                Nome de Exibição
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Como você gostaria de ser chamado?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10"
                  maxLength={50}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{displayName.length}/50 caracteres</p>
            </div>

            {/* Avatar Preview (somente visualização) */}
            {avatarUrl && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Avatar</Label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 dark:border-slate-600"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <p className="font-medium">Foto da conta Google</p>
                    <p>Atualizada automaticamente quando você faz login</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
