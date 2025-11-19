# Guia de Teste - Sistema de Monetização e Analytics

## 📋 Pré-requisitos

- [ ] Migration SQL aplicada no Supabase
- [ ] Variável `SUPABASE_SERVICE_ROLE_KEY` configurada no `.env.local`
- [ ] Aplicação rodando localmente (`npm run dev`)

## 🧪 Roteiro de Testes

### Teste 1: Verificar Criação da Infraestrutura

**Via Supabase Dashboard > SQL Editor:**

```sql
-- 1. Verificar se a tabela user_profiles existe
SELECT * FROM user_profiles LIMIT 5;

-- 2. Verificar se a coluna scan_count existe
SELECT short_id, original_url, scan_count
FROM qrcodes
LIMIT 5;

-- 3. Verificar se a função RPC foi criada
SELECT proname
FROM pg_proc
WHERE proname = 'increment_scan_count';

-- 4. Verificar triggers
SELECT tgname
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

**Resultado esperado:**

- Tabela `user_profiles` existe e pode ter registros
- Coluna `scan_count` existe em `qrcodes` com valor 0 por padrão
- Função `increment_scan_count` está listada
- Trigger `on_auth_user_created` está ativo

---

### Teste 2: Validar Auto-criação de Perfil Free

**Passo 1:** Criar um novo usuário via signup

```bash
# Acesse http://localhost:3000/login
# Clique em "Criar conta"
# Registre-se com um novo email
```

**Passo 2:** Verificar no banco

```sql
-- Substitua [USER_ID] pelo ID do usuário recém-criado
SELECT id, subscription_tier, created_at
FROM user_profiles
WHERE id = '[USER_ID]';
```

**Resultado esperado:**

- Registro criado automaticamente
- `subscription_tier` = 'free'
- `created_at` próximo ao horário do registro

---

### Teste 3: Validar Tracking de Scans

**Passo 1:** Criar um QR Code

```bash
# Faça login na aplicação
# Acesse http://localhost:3000
# Cole uma URL e gere um QR Code
# Anote o short_id gerado (ex: abc12345)
```

**Passo 2:** Verificar contador inicial

```sql
SELECT short_id, scan_count
FROM qrcodes
WHERE short_id = 'abc12345'; -- Use o ID real
```

**Resultado esperado:** `scan_count = 0`

**Passo 3:** Acessar o QR Code várias vezes

```bash
# Opção 1: Via navegador
# Abra: http://localhost:3000/abc12345 (várias vezes)

# Opção 2: Via curl
for i in (seq 1 5)
    curl -L http://localhost:3000/abc12345
end
```

**Passo 4:** Verificar incremento

```sql
SELECT short_id, scan_count, original_url
FROM qrcodes
WHERE short_id = 'abc12345';
```

**Resultado esperado:** `scan_count` incrementado para 5 (ou número de acessos)

---

### Teste 4: Validar Exibição no Dashboard

**Passo 1:** Acessar dashboard

```bash
# Abra http://localhost:3000/dashboard
```

**Passo 2:** Verificar UI

**Checklist:**

- [ ] Coluna "Scans" está visível na tabela (desktop)
- [ ] Valores de scan_count estão corretos
- [ ] Números estão formatados (ex: "1.234" para 1234)
- [ ] Em mobile, badge de scans está visível nos cards

**Passo 3:** Testar atualização em tempo real

1. Abra o dashboard em uma aba
2. Abra um QR Code em outra aba
3. Recarregue o dashboard
4. Verifique se o contador aumentou

---

### Teste 5: Validar Sistema de Tiers (Helper Functions)

**Criar arquivo de teste:** `test-tiers.ts`

```typescript
import { canCreateQrCode, getTierLimits, getQrCodeLimitMessage, getQrCodeUsagePercentage } from '@/lib/subscriptionTiers';

// Teste 1: Verificar limites
console.log('=== Limites por Tier ===');
console.log('Free:', getTierLimits('free'));
console.log('Pro:', getTierLimits('pro'));
console.log('Enterprise:', getTierLimits('enterprise'));

// Teste 2: Verificar se pode criar
console.log('\n=== Pode Criar QR Code? ===');
console.log('Free com 5 QRs:', canCreateQrCode('free', 5)); // true
console.log('Free com 10 QRs:', canCreateQrCode('free', 10)); // false
console.log('Pro com 99 QRs:', canCreateQrCode('pro', 99)); // true

// Teste 3: Mensagens
console.log('\n=== Mensagens de Limite ===');
console.log('Free 5/10:', getQrCodeLimitMessage('free', 5));
console.log('Free 9/10:', getQrCodeLimitMessage('free', 9));
console.log('Free 10/10:', getQrCodeLimitMessage('free', 10));

// Teste 4: Porcentagem de uso
console.log('\n=== Porcentagem de Uso ===');
console.log('Free 5/10:', getQrCodeUsagePercentage('free', 5) + '%'); // 50%
console.log('Pro 50/100:', getQrCodeUsagePercentage('pro', 50) + '%'); // 50%
```

**Executar:**

```bash
# Opção 1: Via Node (se configurado para TypeScript)
npx ts-node test-tiers.ts

# Opção 2: Adicionar em uma página Next.js temporária
# e verificar o console do navegador
```

**Resultado esperado:**

- Todos os limites corretos conforme TIER_LIMITS
- Funções retornam valores esperados
- Mensagens amigáveis e corretas

---

### Teste 6: Validar Performance do Tracking

**Objetivo:** Garantir que o tracking não impacta a latência

**Passo 1:** Medir tempo sem tracking (antes da implementação)

```bash
# Se tiver uma versão antiga em outra branch:
git checkout main # ou branch anterior
npm run dev

# Medir tempo
time curl -L http://localhost:3000/abc12345
```

**Passo 2:** Medir tempo com tracking (versão atual)

```bash
git checkout feat/monetization-analytics
npm run dev

# Medir tempo
time curl -L http://localhost:3000/abc12345
```

**Resultado esperado:**

- Diferença < 50ms
- Função RPC é mais rápida que 2 queries separadas

---

### Teste 7: Validar Segurança (RLS)

**Teste A: Usuário só vê próprio perfil**

```sql
-- Como usuário A (obter JWT do browser DevTools > Application > Cookies)
SET request.jwt.claim.sub = '[USER_A_ID]';

SELECT * FROM user_profiles;
-- Deve retornar apenas o perfil do usuário A
```

**Teste B: Incremento funciona sem autenticação**

```bash
# Teste anônimo (sem estar logado)
# Abra janela anônima
# Acesse http://localhost:3000/abc12345
# Deve redirecionar normalmente
```

```sql
-- Verificar que contou
SELECT scan_count FROM qrcodes WHERE short_id = 'abc12345';
-- Deve ter incrementado mesmo sem auth
```

---

## 🐛 Troubleshooting

### Erro: "function increment_scan_count does not exist"

**Solução:**

```sql
-- Recriar a função manualmente
CREATE OR REPLACE FUNCTION public.increment_scan_count(p_short_id TEXT)
RETURNS TEXT AS $$
DECLARE
    v_original_url TEXT;
BEGIN
    UPDATE public.qrcodes
    SET scan_count = scan_count + 1
    WHERE short_id = p_short_id
    RETURNING original_url INTO v_original_url;

    RETURN v_original_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Erro: "relation user_profiles does not exist"

**Solução:** Migration não foi aplicada

```bash
# Verifique se o arquivo existe
ls supabase/migrations/

# Aplique manualmente via SQL Editor
# Cole o conteúdo de 001_add_monetization_infrastructure.sql
```

### Scans não incrementam

**Debug:**

```sql
-- 1. Verificar se RPC está funcionando
SELECT increment_scan_count('abc12345');
-- Deve retornar a original_url

-- 2. Verificar logs do Supabase
-- Dashboard > Database > Logs

-- 3. Verificar variável de ambiente
echo $SUPABASE_SERVICE_ROLE_KEY
```

### UI não mostra scans

**Debug:**

```typescript
// Adicionar log temporário em dashboard/page.tsx
console.log('QR Codes:', qrcodes);
// Verificar se scan_count está no objeto
```

---

## ✅ Checklist Final

Antes de considerar completo:

- [ ] Migration aplicada sem erros
- [ ] Novos usuários recebem perfil 'free' automaticamente
- [ ] Scans incrementam corretamente
- [ ] Dashboard exibe contadores
- [ ] Helpers de tier funcionam
- [ ] Performance aceitável (< 50ms overhead)
- [ ] RLS protegendo dados sensíveis
- [ ] Acesso anônimo funciona (redirecionamento)
- [ ] Tipos TypeScript sem erros
- [ ] Sem warnings no console

---

## 📊 Métricas de Sucesso

**KPIs para monitorar após deploy:**

1. **Latência P95 do redirecionamento** < 200ms
2. **Taxa de erro do tracking** < 0.1%
3. **Tempo de carregamento do dashboard** < 1s
4. **Queries por segundo** no Supabase

**Queries úteis para monitoramento:**

```sql
-- Top 10 QR Codes mais escaneados
SELECT short_id, original_url, scan_count
FROM qrcodes
ORDER BY scan_count DESC
LIMIT 10;

-- Distribuição de usuários por tier
SELECT subscription_tier, COUNT(*)
FROM user_profiles
GROUP BY subscription_tier;

-- Total de scans hoje
SELECT SUM(scan_count) as total_scans
FROM qrcodes
WHERE created_at >= CURRENT_DATE;
```
