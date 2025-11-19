'use client';

import UpgradeButton from '@/components/stripe/UpgradeButton';
import { Button } from '@/components/ui/button';
import { getTierLimits, type SubscriptionTier } from '@/lib/subscriptionTiers';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Check, Crown, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UpgradePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserTier = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setCurrentTier(profile.subscription_tier as SubscriptionTier);
      }
      setIsLoading(false);
    };

    fetchUserTier();
  }, [supabase, router]);

  const plans: Array<{
    tier: SubscriptionTier;
    name: string;
    description: string;
    price: string;
    priceDetail: string;
    popular?: boolean;
    icon: typeof Zap;
    cta: string;
  }> = [
    {
      tier: 'free',
      name: 'Free',
      description: 'Perfeito para testar',
      price: 'R$ 0',
      priceDetail: 'para sempre',
      icon: Check,
      cta: 'Plano Atual',
    },
    {
      tier: 'pro',
      name: 'Pro',
      description: 'Ideal para negócios',
      price: 'R$ 29',
      priceDetail: 'por mês',
      popular: true,
      icon: Zap,
      cta: 'Começar Agora',
    },
    {
      tier: 'enterprise',
      name: 'Enterprise',
      description: 'Para grandes volumes',
      price: 'Custom',
      priceDetail: 'sob consulta',
      icon: Crown,
      cta: 'Falar com Vendas',
    },
  ];

  const handleUpgrade = (tier: SubscriptionTier) => {
    if (tier === 'free') {
      router.push('/dashboard');
      return;
    }

    if (tier === 'enterprise') {
      // Redirecionar para formulário de contato ou email
      window.location.href = 'mailto:vendas@seudominio.com?subject=Interesse no Plano Enterprise';
      return;
    }

    // Para Pro, redirecionar para checkout (Stripe/Paddle será integrado depois)
    alert('Integração com pagamento será implementada em breve!\n\nPor enquanto, este é um preview da página de upgrade.');
    // Futuro: router.push('/checkout?plan=pro');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header com botão de voltar */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            ← Voltar ao Dashboard
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
          Escolha o plano ideal para você
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Comece gratuitamente e faça upgrade quando precisar de mais poder. Sem compromisso, cancele quando quiser.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const limits = getTierLimits(plan.tier);
            const Icon = plan.icon;

            return (
              <div
                key={plan.tier}
                className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 flex flex-col ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {/* Badge "Mais Popular" */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </div>
                )}

                {/* Ícone e Nome */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2 rounded-lg ${plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{plan.name}</h3>
                    <p className="text-sm text-slate-500">{plan.description}</p>
                  </div>
                </div>

                {/* Preço */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900 dark:text-slate-50">{plan.price}</span>
                  </div>
                  <p className="text-slate-500 text-sm">{plan.priceDetail}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-grow">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {limits.maxQrCodes === 999999 ? 'QR Codes ilimitados' : `Até ${limits.maxQrCodes} QR Codes`}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">
                      {limits.maxScansPerMonth === null
                        ? 'Scans ilimitados'
                        : `${limits.maxScansPerMonth.toLocaleString('pt-BR')} scans/mês`}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    {limits.canAccessAnalytics ? (
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
                    )}
                    <span className={limits.canAccessAnalytics ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
                      Analytics avançado
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    {limits.canCustomizeDomains ? (
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
                    )}
                    <span className={limits.canCustomizeDomains ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
                      Domínios customizados
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    {limits.canExportData ? (
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300 shrink-0 mt-0.5" />
                    )}
                    <span className={limits.canExportData ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
                      Exportação de dados
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Suporte {limits.supportLevel}</span>
                  </li>
                </ul>

                {/* CTA Button */}
                {plan.tier === currentTier ? (
                  <Button className="w-full" variant="outline" size="lg" disabled>
                    Plano Atual
                  </Button>
                ) : plan.tier === 'free' && currentTier !== 'free' ? (
                  <Button className="w-full" variant="outline" size="lg" disabled>
                    Fazer Downgrade
                  </Button>
                ) : plan.tier === 'enterprise' ? (
                  <Button
                    onClick={() => handleUpgrade(plan.tier)}
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                ) : plan.tier === 'pro' ? (
                  <UpgradeButton tier="pro" className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    {plan.cta}
                  </UpgradeButton>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 border-t">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-50 mb-12">Perguntas Frequentes</h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Posso mudar de plano a qualquer momento?
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Sim! Você pode fazer upgrade ou downgrade a qualquer momento. Se fizer upgrade, será cobrado proporcionalmente.
              Se fizer downgrade, o crédito será aplicado no próximo ciclo.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              O que acontece se eu atingir o limite de scans?
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Seus QR Codes continuarão funcionando normalmente. Você apenas não conseguirá criar novos até fazer upgrade ou
              esperar o próximo ciclo mensal.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Aceitam quais formas de pagamento?
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Aceitamos cartões de crédito, débito e PIX através do Stripe. Todos os pagamentos são seguros e criptografados.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Posso cancelar minha assinatura a qualquer momento?
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Sim, sem taxas de cancelamento. Você continuará tendo acesso aos recursos do plano até o final do período pago.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-lg mb-8 opacity-90">Crie QR Codes ilimitados e acompanhe suas métricas em tempo real.</p>
          <UpgradeButton tier="pro" variant="default" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8">
            Começar com Pro
          </UpgradeButton>
        </div>
      </section>
    </main>
  );
}
