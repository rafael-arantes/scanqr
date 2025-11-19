# Stripe Local Testing Guide

Este guia explica como testar a integração Stripe localmente usando o Stripe CLI.

## 🚀 Setup Inicial

### 1. Instalar Stripe CLI

**macOS (usando Homebrew):**

```bash
brew install stripe/stripe-cli/stripe
```

**Outras plataformas:**
Baixe em: https://stripe.com/docs/stripe-cli

### 2. Login no Stripe CLI

```bash
stripe login
```

Isso abrirá o navegador para autenticação. Confirme a conexão.

### 3. Verificar instalação

```bash
stripe --version
```

## 🧪 Testando Webhooks Localmente

### Passo 1: Iniciar o servidor Next.js

Em um terminal:

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### Passo 2: Iniciar o webhook forwarding

Em **outro terminal**, execute:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Você verá uma saída similar a:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

### Passo 3: Atualizar .env.local

Copie o `whsec_xxxxxxxxxxxxx` e adicione ao `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**⚠️ IMPORTANTE:** Reinicie o servidor Next.js após atualizar o `.env.local` para carregar o novo secret.

## 💳 Testando o Fluxo de Pagamento

### 1. Acessar a página de upgrade

```
http://localhost:3000/upgrade
```

### 2. Clicar em "Começar Agora" no plano Pro

Você será redirecionado para o Stripe Checkout em **Test Mode**.

### 3. Usar cartão de teste

**Cartão de sucesso:**

- Número: `4242 4242 4242 4242`
- Data: Qualquer data futura (ex: `12/34`)
- CVV: Qualquer 3 dígitos (ex: `123`)
- Nome: Qualquer nome
- CEP: Qualquer código

**Outros cartões de teste:**

- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`
- Insufficient funds: `4000 0000 0000 9995`

Lista completa: https://stripe.com/docs/testing

### 4. Completar o pagamento

Após preencher os dados, clique em "Subscribe" (Assinar).

### 5. Verificar webhooks recebidos

No terminal com `stripe listen`, você verá os eventos sendo recebidos:

```
2025-11-19 10:30:00   --> checkout.session.completed [evt_xxx]
2025-11-19 10:30:01   --> customer.subscription.created [evt_xxx]
2025-11-19 10:30:02   --> invoice.payment_succeeded [evt_xxx]
```

### 6. Confirmar no banco de dados

Verifique se o tier foi atualizado:

**Opção A - Supabase Dashboard:**

1. Acesse: https://supabase.com/dashboard
2. Vá em "Table Editor" → `user_profiles`
3. Verifique que `subscription_tier` = `'pro'`
4. Vá em "Table Editor" → `subscriptions`
5. Verifique que existe um registro com `status = 'active'`

**Opção B - SQL Editor:**

```sql
-- Ver seu perfil
SELECT id, subscription_tier, stripe_customer_id
FROM user_profiles
WHERE id = 'seu-user-id';

-- Ver sua assinatura
SELECT * FROM subscriptions
WHERE user_id = 'seu-user-id';

-- Ver status completo (usando view)
SELECT * FROM subscription_status
WHERE user_id = 'seu-user-id';
```

## 🔄 Testando Cancelamento

### 1. Acessar Customer Portal

No dashboard, clique em "Gerenciar Assinatura" (botão ao lado do tier badge).

### 2. Cancelar assinatura

- Clique em "Cancel plan"
- Confirme o cancelamento
- Escolha cancelar imediatamente ou ao fim do período

### 3. Verificar webhook

No terminal `stripe listen`:

```
--> customer.subscription.updated [evt_xxx]
--> customer.subscription.deleted [evt_xxx]  (se cancelou imediatamente)
```

### 4. Confirmar atualização

Verifique no banco que:

- `subscription_tier` voltou para `'free'` (se cancelou imediatamente)
- Ou `cancel_at_period_end = true` (se cancelar ao fim do período)

## 🎯 Comandos Úteis do Stripe CLI

### Simular eventos manualmente

```bash
# Simular pagamento bem-sucedido
stripe trigger payment_intent.succeeded

# Simular falha de pagamento
stripe trigger invoice.payment_failed

# Simular renovação de assinatura
stripe trigger customer.subscription.updated
```

### Ver logs de eventos

```bash
stripe logs tail
```

### Testar webhooks sem forward

```bash
# Criar um evento de teste
stripe events resend evt_xxxxxx
```

## 🛠️ Troubleshooting

### Webhook não está sendo recebido

1. **Verificar se o Stripe CLI está rodando:**

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. **Verificar se o secret está correto no .env.local:**

   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

3. **Reiniciar o servidor Next.js** após atualizar .env.local

4. **Verificar logs do webhook:**
   - No terminal Next.js, procure por erros
   - No terminal Stripe CLI, veja se o evento foi enviado

### Erro: "No signatures found matching the expected signature"

O `STRIPE_WEBHOOK_SECRET` está incorreto ou desatualizado.

**Solução:**

1. Pare o `stripe listen`
2. Inicie novamente: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Copie o **novo** `whsec_xxxxx`
4. Atualize `.env.local`
5. Reinicie `npm run dev`

### Assinatura criada mas tier não atualizado

Verifique o trigger no banco:

```sql
-- Ver se o trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'on_subscription_change';

-- Executar manualmente a sincronização
SELECT sync_subscription_tier('seu-user-id');
```

### Checkout redireciona mas não completa

1. Verifique se os `STRIPE_PRICE_ID_*` estão corretos no `.env.local`
2. Confirme que os produtos existem no Stripe Dashboard
3. Verifique os logs no terminal Next.js

## 📋 Checklist de Teste Completo

- [ ] Stripe CLI instalado e autenticado
- [ ] `stripe listen` rodando em um terminal
- [ ] `npm run dev` rodando em outro terminal
- [ ] `.env.local` configurado com todas as keys
- [ ] Servidor Next.js reiniciado após atualizar .env.local
- [ ] Upgrade para Pro funciona
- [ ] Webhook `checkout.session.completed` recebido
- [ ] Tier atualizado no banco para `'pro'`
- [ ] Registro criado na tabela `subscriptions`
- [ ] Customer Portal abre corretamente
- [ ] Cancelamento funciona
- [ ] Webhook `subscription.deleted` recebido
- [ ] Tier volta para `'free'` no banco

## 🚀 Próximos Passos (Produção)

Quando estiver pronto para produção:

1. **Configurar webhook endpoint real:**

   - Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://seudominio.com/api/stripe/webhook`
   - Selecionar eventos: checkout.session.completed, customer.subscription._, invoice.payment\__
   - Copiar signing secret para produção

2. **Usar chaves de produção:**

   - Mudar para "Live mode" no Stripe Dashboard
   - Atualizar `.env.production` ou variáveis no Vercel/hosting
   - Usar chaves `pk_live_xxx` e `sk_live_xxx`

3. **Testar em produção:**
   - Usar cartão de teste ainda funciona em modo live (sem cobranças reais)
   - Fazer uma compra de teste com cartão real (e depois cancelar/reembolsar)
   - Monitorar logs de webhook no Stripe Dashboard

## 📚 Recursos

- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Test Cards](https://stripe.com/docs/testing)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
- [Subscription Lifecycle](https://stripe.com/docs/billing/subscriptions/overview)
