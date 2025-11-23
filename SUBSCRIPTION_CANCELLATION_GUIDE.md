# Cancelamento de Assinatura - ScanQR

## Como Funciona

O ScanQR usa o **Stripe Customer Portal** para gerenciar assinaturas, incluindo cancelamento. Isso oferece:

✅ Interface profissional e segura da Stripe
✅ Múltiplas opções de cancelamento
✅ Gerenciamento de métodos de pagamento
✅ Histórico de faturas
✅ Atualização de informações de cobrança

## Fluxo do Usuário

### 1. **Acessar Gerenciamento**

Na sidebar do dashboard, usuários com assinatura ativa (Pro ou Enterprise) verão:
- Botão **"Gerenciar Assinatura"**
- Ao clicar, são redirecionados para o Stripe Customer Portal

### 2. **Customer Portal**

No portal, o usuário pode:
- ✂️ **Cancelar assinatura** (2 opções):
  - Cancelar imediatamente
  - Cancelar ao final do período atual
- 💳 Atualizar método de pagamento
- 📄 Ver faturas anteriores
- 📧 Atualizar e-mail de cobrança
- 🔄 Reativar assinatura cancelada (se ainda no período pago)

### 3. **Opções de Cancelamento**

#### Opção A: Cancelar ao Final do Período
- Usuário continua com acesso até o fim do período pago
- Não há cobrança no próximo ciclo
- `cancel_at_period_end = true` no banco
- Tier permanece `pro`/`enterprise` até expirar

#### Opção B: Cancelar Imediatamente
- Acesso é removido instantaneamente
- Pode haver reembolso proporcional (configure no Stripe)
- Tier muda para `free` imediatamente

### 4. **Webhook Automático**

Quando o usuário cancela, a Stripe envia webhook:

```
customer.subscription.updated → cancel_at_period_end = true
```

Ou (se cancelar imediatamente):

```
customer.subscription.deleted → status = canceled
```

Nosso webhook (`/api/stripe/webhook`) processa automaticamente:
- Atualiza `subscriptions` table
- Trigger `sync_subscription_tier` atualiza `user_profiles.subscription_tier`

## Configuração do Customer Portal

### 1. Configurar no Stripe Dashboard

1. Acesse: https://dashboard.stripe.com/settings/billing/portal
2. **Customer information**:
   - ✅ Allow customers to edit: Email address
3. **Subscriptions**:
   - ✅ Allow customers to cancel subscriptions
   - Cancelamento imediato: ❌ (recomendado desabilitar)
   - Cancelar ao final do período: ✅ **Habilitado**
4. **Payment methods**:
   - ✅ Allow customers to update payment methods
5. **Invoice history**:
   - ✅ Allow customers to view invoices

### 2. Testes em Desenvolvimento

Para testar cancelamento localmente:

```bash
# Terminal 1: Servidor Next.js
npm run dev

# Terminal 2: Stripe Webhook Listener
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Passo a passo:**
1. Faça upgrade para Pro (com cartão de teste)
2. Clique em "Gerenciar Assinatura"
3. No Customer Portal, clique em "Cancel plan"
4. Escolha "Cancel at end of period"
5. Confirme
6. Verifique webhook recebido no terminal
7. Verifique no banco: `cancel_at_period_end = true`

## Comportamento Esperado

### Antes do Cancelamento
```sql
-- subscriptions table
status: 'active'
cancel_at_period_end: false
current_period_end: '2025-12-23'

-- user_profiles table
subscription_tier: 'pro'
```

### Após Cancelamento (ao final do período)
```sql
-- subscriptions table
status: 'active'  -- Ainda ativo!
cancel_at_period_end: true
canceled_at: '2025-11-23T10:30:00Z'
current_period_end: '2025-12-23'

-- user_profiles table
subscription_tier: 'pro'  -- Ainda Pro até expirar!
```

### Quando o Período Expira
```sql
-- subscriptions table
status: 'canceled'
cancel_at_period_end: true
canceled_at: '2025-11-23T10:30:00Z'
current_period_end: '2025-12-23'

-- user_profiles table
subscription_tier: 'free'  -- Agora downgrade!
```

## UI/UX Recommendations

### Mostrar Status de Cancelamento

Na sidebar, você pode adicionar um badge se `cancel_at_period_end = true`:

```tsx
{tier === 'pro' && cancelAtPeriodEnd && (
  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
    <p className="text-xs text-orange-700">
      ⚠️ Assinatura cancelada
      <br />
      Acesso até {formatDate(currentPeriodEnd)}
    </p>
  </div>
)}
```

### Opção de Reativar

Se o usuário cancelou mas ainda está no período:

```tsx
{cancelAtPeriodEnd && (
  <ManageSubscriptionButton variant="default">
    Reativar Assinatura
  </ManageSubscriptionButton>
)}
```

No Customer Portal, o usuário pode clicar em "Renew subscription".

## Tratamento de Erros

### Erro: "Você ainda não tem uma assinatura ativa"

**Causa**: Usuário é free e clicou em "Gerenciar Assinatura"

**Solução**: Mostrar botão apenas para `tier !== 'free'` (já implementado)

### Erro: "stripe_customer_id" não encontrado

**Causa**: Usuário tem tier pro/enterprise mas não tem customer_id

**Solução**: Migration ou script para criar customer_id:

```typescript
// Criar customer no Stripe
const customer = await stripe.customers.create({
  email: user.email,
  metadata: { userId: user.id }
});

// Salvar no banco
await supabase
  .from('user_profiles')
  .update({ stripe_customer_id: customer.id })
  .eq('id', user.id);
```

## Retenção de Clientes

### Survey de Cancelamento

Configure no Stripe Dashboard → Settings → Billing Portal:

**Cancellation feedback**:
- ✅ Ask for feedback before canceling
- Opções: "Too expensive", "Missing features", "Switching to competitor", etc.

Isso gera insights valiosos sobre por que usuários cancelam.

### Oferecer Desconto (Opcional)

Se quiser oferecer desconto para reter cliente:

1. Crie cupons no Stripe: 20% off, 3 meses grátis, etc.
2. No Customer Portal, usuário vê oferta antes de confirmar cancelamento
3. Configure em: Settings → Billing Portal → Retention offers

## Recursos Úteis

- [Stripe Customer Portal Docs](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Cancellation Best Practices](https://stripe.com/docs/billing/subscriptions/cancel)
- [Retention Strategies](https://stripe.com/guides/increase-subscription-retention)

## Checklist

- [x] Route `/api/stripe/portal` criada
- [x] Componente `ManageSubscriptionButton` criado
- [x] Botão adicionado na sidebar (apenas para tier != free)
- [ ] Configurar Customer Portal no Stripe Dashboard
- [ ] Testar cancelamento em staging
- [ ] Adicionar badge de "Cancelado" se `cancel_at_period_end = true`
- [ ] Configurar feedback survey (opcional)
- [ ] Testar webhook de cancelamento
- [ ] Documentar para usuários (FAQ)
