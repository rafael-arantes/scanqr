# 📄 Guia da Página de Upgrade

## 📋 Visão Geral

A página `/upgrade` foi criada para converter usuários gratuitos em pagantes. Ela inclui:

- ✅ Comparativo visual dos 3 planos (Free, Pro, Enterprise)
- ✅ Features destacadas com ícones ✓ e ✗
- ✅ Seção de FAQ para reduzir objeções
- ✅ CTA (Call-to-Action) final para conversão
- ✅ Design responsivo e moderno
- ✅ Preparada para integração futura com Stripe/Paddle

## 🎨 Customizações Recomendadas

### 1. Ajustar Preços

Edite em `src/app/upgrade/page.tsx`:

```typescript
const plans = [
  {
    tier: 'free',
    price: 'R$ 0',
    // ...
  },
  {
    tier: 'pro',
    price: 'R$ 29', // ← AJUSTE AQUI
    priceDetail: 'por mês',
    // ...
  },
  {
    tier: 'enterprise',
    price: 'Custom', // ou 'R$ 299', etc.
    // ...
  },
];
```

### 2. Personalizar Descrições

```typescript
{
  tier: 'pro',
  name: 'Pro',
  description: 'Ideal para negócios', // ← PERSONALIZE
  // ...
}
```

### 3. Alterar Email de Contato Enterprise

```typescript
const handleUpgrade = (tier: SubscriptionTier) => {
  if (tier === 'enterprise') {
    window.location.href = 'mailto:contato@seudominio.com?subject=...'; // ← SEU EMAIL
  }
  // ...
};
```

### 4. Atualizar FAQ

Adicione ou remova perguntas na seção FAQ:

```typescript
<div>
  <h3>Sua pergunta aqui?</h3>
  <p>Sua resposta aqui.</p>
</div>
```

## 💳 Integração com Pagamentos

### Opção 1: Stripe (Recomendado)

#### Passo 1: Instalar dependência

```bash
npm install @stripe/stripe-js stripe
```

#### Passo 2: Criar arquivo de configuração

Crie `src/lib/stripe.ts`:

```typescript
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

#### Passo 3: Criar endpoint de checkout

Crie `src/app/api/create-checkout/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: Request) {
  const { priceId } = await request.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId, // Ex: 'price_xxxxxxxxxxxxx'
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
  });

  return NextResponse.json({ sessionId: session.id });
}
```

#### Passo 4: Atualizar função handleUpgrade

Em `src/app/upgrade/page.tsx`:

```typescript
import { stripePromise } from '@/lib/stripe';

const handleUpgrade = async (tier: SubscriptionTier) => {
  if (tier === 'pro') {
    const stripe = await stripePromise;
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: 'price_xxxxxxxxxxxxx', // Obter no Stripe Dashboard
      }),
    });
    const { sessionId } = await response.json();
    await stripe?.redirectToCheckout({ sessionId });
  }
};
```

#### Passo 5: Configurar Webhooks

Crie `src/app/api/webhooks/stripe/route.ts` para processar eventos:

```typescript
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature')!;
  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Processar evento
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Atualizar tier do usuário no Supabase
    await supabase.from('user_profiles').update({ subscription_tier: 'pro' }).eq('id', session.metadata?.userId);
  }

  return NextResponse.json({ received: true });
}
```

### Opção 2: Paddle

Similar ao Stripe, mas com SDK diferente. Consulte docs: https://paddle.com/docs

## 🎯 Testes

### Teste 1: Navegação

```bash
# Acesse http://localhost:3000/upgrade
# Verifique:
# - Todos os planos são exibidos
# - Features corretas por plano
# - FAQ está legível
```

### Teste 2: Botões CTA

```bash
# Clique em "Começar Agora" no plano Pro
# Deve mostrar alert dizendo que integração está pendente
```

### Teste 3: Fluxo de Gatekeeping

```bash
# 1. Atinja limite Free (10 QR Codes)
# 2. Tente criar mais um
# 3. Clique "OK" no popup
# 4. Deve redirecionar para /upgrade
```

## 📊 Métricas Recomendadas

Track essas métricas para otimizar conversão:

```typescript
// Exemplo com Google Analytics
const trackUpgradeClick = (tier: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'upgrade_click', {
      plan: tier,
      page: '/upgrade',
    });
  }
};

// Adicione na função handleUpgrade
const handleUpgrade = (tier: SubscriptionTier) => {
  trackUpgradeClick(tier); // ← Track
  // ... resto do código
};
```

## 🎨 Design Variations (A/B Testing)

### Variação 1: Destaque no Pro

Adicione pulso animado:

```typescript
<div className={`... ${plan.popular ? 'animate-pulse' : ''}`}>
```

### Variação 2: Badge de Desconto

```typescript
{
  plan.tier === 'pro' && <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">30% OFF no primeiro mês</div>;
}
```

### Variação 3: Depoimentos

Adicione seção antes do FAQ:

```typescript
<section className="container mx-auto px-4 py-16">
  <h2 className="text-3xl font-bold text-center mb-12">O que nossos clientes dizem</h2>
  <div className="grid md:grid-cols-3 gap-8">
    <blockquote className="bg-white p-6 rounded-lg shadow">
      <p className="italic">"Melhor ferramenta de QR Code que já usei!"</p>
      <footer className="mt-4 text-sm text-slate-500">— João Silva, CEO</footer>
    </blockquote>
    {/* Mais depoimentos */}
  </div>
</section>
```

## 🔒 Segurança

### Proteções Implementadas:

1. **Client-Side Only** - Página não expõe chaves sensíveis
2. **Server Validation** - Webhook valida assinatura do Stripe
3. **Supabase RLS** - Apenas o próprio usuário pode atualizar seu tier

### Recomendações:

- Use HTTPS em produção
- Valide webhooks com assinatura
- Nunca exponha `STRIPE_SECRET_KEY` no cliente

## 📝 Variáveis de Ambiente

Adicione ao `.env.local`:

```env
# Stripe (quando integrar)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Ou Paddle
NEXT_PUBLIC_PADDLE_VENDOR_ID=xxxxx
PADDLE_API_KEY=xxxxx
PADDLE_PUBLIC_KEY=xxxxx
```

## 🚀 Deploy

Após integrar pagamentos:

1. Configure webhooks no Stripe Dashboard
2. Aponte webhook URL para: `https://seudominio.com/api/webhooks/stripe`
3. Configure variáveis de ambiente na Vercel
4. Teste com cartão de teste do Stripe

## ✅ Checklist Pré-Launch

- [ ] Preços definidos e corretos
- [ ] Email de contato atualizado
- [ ] FAQ revisada
- [ ] Stripe/Paddle configurado
- [ ] Webhooks testados
- [ ] Variáveis de ambiente em produção
- [ ] Testes de checkout completos
- [ ] Política de reembolso definida
- [ ] Termos de serviço atualizados

## 📞 Próximos Passos

1. **Definir preços finais** - Pesquise concorrentes
2. **Criar conta Stripe/Paddle** - Obtenha as keys
3. **Implementar checkout** - Siga guia acima
4. **Configurar webhooks** - Automatize atualização de tiers
5. **Testar pagamentos** - Use modo test
6. **Ir ao ar!** 🎉

---

**Página criada em:** `src/app/upgrade/page.tsx`  
**Status:** ✅ Funcional (sem integração de pagamento)  
**Próximo passo:** Integrar Stripe ou Paddle
