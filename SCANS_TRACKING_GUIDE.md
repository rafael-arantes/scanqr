# Implementação de Controle de Scans Mensais

## 📋 Visão Geral

Esta implementação adiciona controle de **limite de scans mensais por usuário** (não por QR Code individual), com verificação no backend, exibição visual na sidebar e página de erro quando o limite é atingido.

## 🗄️ Alterações no Banco de Dados

### Migration 006: Monthly Scans Tracking

**Arquivo:** `supabase/migrations/006_add_monthly_scans_tracking.sql`

#### 1. Novas Colunas em `user_profiles`

```sql
ALTER TABLE public.user_profiles
  ADD COLUMN monthly_scans INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN monthly_scans_reset_at TIMESTAMPTZ DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month');
```

- **`monthly_scans`**: Total de scans que TODOS os QR Codes do usuário receberam no mês atual
- **`monthly_scans_reset_at`**: Data em que o contador será automaticamente resetado (primeiro dia do próximo mês)

#### 2. Função `increment_scan_count` Atualizada

A função agora:

1. **Verifica o tier do usuário** e define o limite (free: 1.000, pro: 50.000, enterprise: ilimitado)
2. **Reseta automaticamente o contador** se já passou do mês
3. **Verifica se o limite foi atingido** ANTES de incrementar
4. **Retorna `'SCAN_LIMIT_REACHED'`** se o limite foi atingido
5. **Incrementa tanto `qrcodes.scan_count`** (individual do QR Code) quanto **`user_profiles.monthly_scans`** (total do usuário)

#### 3. Função `check_scan_limit`

Nova função utilitária para verificar status do limite:

```sql
SELECT * FROM check_scan_limit('user-id');
```

Retorna:

- `can_scan`: BOOLEAN - se ainda pode fazer scans
- `current_scans`: INTEGER - scans feitos este mês
- `max_scans`: INTEGER ou NULL - limite do tier
- `reset_at`: TIMESTAMPTZ - quando o contador reseta

#### 4. View `user_scan_stats`

View consolidada com estatísticas completas:

```sql
SELECT * FROM user_scan_stats WHERE user_id = 'xxx';
```

Retorna:

- Tier atual
- Scans mensais e limite
- Porcentagem de uso
- Total de scans all-time (soma de todos os QR Codes)
- Total de QR Codes

#### 5. Função `reset_monthly_scans`

Para execução manual (admin) ou via cron job:

```sql
SELECT reset_monthly_scans(); -- Retorna quantidade de usuários resetados
```

## 🎨 Interface do Usuário

### 1. Sidebar Atualizada

**Arquivo:** `src/app/dashboard/DashboardSidebar.tsx`

Agora mostra **dois cards**:

#### Card 1: QR Codes

- Contador: `5 / 10`
- Barra de progresso colorida (azul → amarelo → laranja → vermelho)
- Mensagem: "5 de 10 QR Codes disponíveis"

#### Card 2: Scans este mês (NOVO)

- Contador: `234 / 1.000`
- Barra de progresso colorida
- Mensagem: "234 de 1.000 scans este mês"
- Atualiza em tempo real conforme QR Codes são acessados

### 2. Página de Erro

**Arquivo:** `src/app/scan-limit-reached/page.tsx`

Exibida quando um usuário atinge o limite de scans mensais:

- Ícone de alerta vermelho
- Mensagem clara explicando o problema
- Orientação para o proprietário fazer upgrade
- Link para criar QR Code grátis (para visitantes)
- Design responsivo e amigável

### 3. Botão de Upgrade Inteligente

O botão "Fazer Upgrade" na sidebar agora destaca quando:

- Uso de QR Codes >= 80%, **OU**
- Uso de Scans >= 80%

## 🔧 Backend e Lógica

### 1. Página de Redirecionamento

**Arquivo:** `src/app/[shortId]/page.tsx`

```typescript
const { data: originalUrl } = await supabase.rpc('increment_scan_count', {
  p_short_id: shortId,
});

// Se retornou a string especial, limite atingido
if (originalUrl === 'SCAN_LIMIT_REACHED') {
  redirect('/scan-limit-reached');
}

// Caso contrário, redireciona normalmente
redirect(originalUrl);
```

### 2. Dashboard

**Arquivo:** `src/app/dashboard/page.tsx`

Busca `monthly_scans` do perfil:

```typescript
const { data: profile } = await supabase
  .from('user_profiles')
  .select('subscription_tier, display_name, avatar_url, monthly_scans')
  .eq('id', session.user.id)
  .single();

setMonthlyScans(profile?.monthly_scans || 0);
```

### 3. Helpers Utilitários

**Arquivo:** `src/lib/subscriptionTiers.ts`

Novas funções:

```typescript
// Calcula scans restantes (retorna null se ilimitado)
getRemainingScans(tier, currentMonthlyScans): number | null

// Porcentagem de uso (0-100)
getScansUsagePercentage(tier, currentMonthlyScans): number

// Mensagem amigável
getScansLimitMessage(tier, currentMonthlyScans): string
```

## 🎯 Limites Configurados

| Tier       | Scans/Mês |
| ---------- | --------- |
| Free       | 1.000     |
| Pro        | 50.000    |
| Enterprise | Ilimitado |

## 🔄 Fluxo de Funcionamento

### Cenário 1: Usuário Free com 950 scans

1. QR Code é acessado
2. Função `increment_scan_count` verifica:
   - Tier: free → limite 1.000
   - Scans atuais: 950
   - 950 < 1.000 ✅ Pode continuar
3. Incrementa `monthly_scans` para 951
4. Incrementa `scan_count` do QR Code
5. Redireciona para URL original
6. Dashboard atualiza: "951 de 1.000 scans este mês"
7. Barra de progresso: 95% (amarela/laranja)

### Cenário 2: Usuário Free com 1.000 scans

1. QR Code é acessado
2. Função verifica:
   - Tier: free → limite 1.000
   - Scans atuais: 1.000
   - 1.000 >= 1.000 ❌ **Limite atingido**
3. **NÃO incrementa nada**
4. Retorna `'SCAN_LIMIT_REACHED'`
5. Usuário vê página de erro
6. QR Code fica "pausado" até:
   - Usuário fazer upgrade, OU
   - Próximo mês (reset automático)

### Cenário 3: Virada do Mês

1. Dia 1º do mês, usuário com 1.000 scans tenta acessar QR Code
2. Função verifica `monthly_scans_reset_at`:
   - Reset date: 2025-11-01
   - Data atual: 2025-12-01
   - NOW() >= reset_at ✅
3. **Reset automático**:
   ```sql
   UPDATE user_profiles SET
     monthly_scans = 0,
     monthly_scans_reset_at = '2026-01-01'
   ```
4. Incrementa para 1
5. Redireciona normalmente
6. Dashboard: "1 de 1.000 scans este mês"

## 🧪 Testando a Implementação

### 1. Aplicar a Migration

```bash
cd /Volumes/Storage/Develop/repos/scanqr
supabase db push
```

Ou via SQL Editor no Supabase Dashboard.

### 2. Verificar Colunas Criadas

```sql
SELECT
  id,
  subscription_tier,
  monthly_scans,
  monthly_scans_reset_at
FROM user_profiles;
```

### 3. Simular Scans

Acesse vários QR Codes do seu usuário e veja o contador aumentar na sidebar.

### 4. Testar Limite

**Opção A - Via SQL (mais rápido):**

```sql
-- Forçar usuário a ter 999 scans
UPDATE user_profiles
SET monthly_scans = 999
WHERE id = 'seu-user-id';

-- Acessar QR Code 2x
-- 1º acesso: incrementa para 1.000 ✅
-- 2º acesso: limite atingido ❌ → página de erro
```

**Opção B - Via QR Codes reais:**

Criar 1.000 QR Codes e acessar cada um (não recomendado 😅).

### 5. Verificar Estatísticas

```sql
SELECT * FROM user_scan_stats WHERE user_id = 'seu-user-id';
```

### 6. Testar Reset Manual

```sql
-- Forçar reset imediato
UPDATE user_profiles
SET monthly_scans_reset_at = NOW() - INTERVAL '1 day'
WHERE id = 'seu-user-id';

-- Acessar QR Code → deve resetar automaticamente
```

### 7. Verificar View de Estatísticas

```sql
SELECT
  subscription_tier,
  monthly_scans,
  max_scans,
  usage_percentage,
  total_all_time_scans,
  total_qrcodes
FROM user_scan_stats
WHERE user_id = 'seu-user-id';
```

## 🔐 Segurança

- ✅ **SECURITY DEFINER**: Função roda com permissões elevadas (permite acesso público aos QR Codes)
- ✅ **Validação no backend**: Limite verificado no Postgres, não no JavaScript (impossível burlar)
- ✅ **Atomic operations**: Increment é atômico (não tem race condition)
- ✅ **RLS na view**: `user_scan_stats` respeita políticas de segurança

## 📊 Queries Úteis

### Ver uso de todos os usuários

```sql
SELECT
  up.id,
  up.subscription_tier,
  up.monthly_scans,
  CASE up.subscription_tier
    WHEN 'free' THEN 1000
    WHEN 'pro' THEN 50000
    ELSE NULL
  END AS max_scans,
  up.monthly_scans_reset_at
FROM user_profiles up
ORDER BY up.monthly_scans DESC;
```

### Usuários próximos do limite

```sql
SELECT * FROM user_scan_stats
WHERE usage_percentage >= 80
ORDER BY usage_percentage DESC;
```

### Top usuários por scans

```sql
SELECT
  user_id,
  subscription_tier,
  total_all_time_scans
FROM user_scan_stats
ORDER BY total_all_time_scans DESC
LIMIT 10;
```

## 🚨 Troubleshooting

### Scans mensais não estão incrementando

1. Verificar se a migration 006 foi aplicada:

   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'user_profiles'
   AND column_name IN ('monthly_scans', 'monthly_scans_reset_at');
   ```

2. Verificar se a função foi atualizada:

   ```sql
   SELECT routine_name, routine_definition
   FROM information_schema.routines
   WHERE routine_name = 'increment_scan_count';
   ```

3. Verificar logs do Supabase para erros

### Limite não está sendo respeitado

1. Verificar se `SUPABASE_SERVICE_ROLE_KEY` está configurada
2. Confirmar que a página `[shortId]` está usando a função RPC
3. Testar manualmente no SQL Editor:
   ```sql
   SELECT increment_scan_count('abc123');
   ```

### Contador não reseta no início do mês

Execute manualmente:

```sql
SELECT reset_monthly_scans();
```

Ou configure um cron job para executar diariamente:

```sql
-- Via Supabase Edge Functions ou cron job externo
```

## 📝 Arquivos Modificados/Criados

```
✨ NOVOS:
supabase/migrations/006_add_monthly_scans_tracking.sql
src/app/scan-limit-reached/page.tsx
SCANS_TRACKING_GUIDE.md (este arquivo)

🔧 MODIFICADOS:
src/lib/subscriptionTiers.ts
src/app/dashboard/page.tsx
src/app/dashboard/DashboardLayout.tsx
src/app/dashboard/DashboardSidebar.tsx
src/app/[shortId]/page.tsx
MONETIZATION_IMPLEMENTATION.md
```

## ✅ Checklist Completo

- [x] Migration 006 criada
- [x] Colunas `monthly_scans` e `monthly_scans_reset_at` adicionadas
- [x] Função `increment_scan_count` atualizada com verificação de limite
- [x] Função `check_scan_limit` criada
- [x] View `user_scan_stats` criada
- [x] Função `reset_monthly_scans` criada
- [x] Helpers utilitários para scans (3 novas funções)
- [x] Dashboard busca `monthly_scans` do perfil
- [x] Sidebar exibe card de scans mensais com barra de progresso
- [x] Página de erro `/scan-limit-reached` criada
- [x] Redirecionamento trata limite atingido
- [x] Botão de upgrade destaca quando scans >= 80%
- [x] Reset automático mensal implementado
- [x] Documentação completa
- [x] Queries úteis para monitoramento

## 🎉 Resultado

Agora o sistema:

- ✅ Controla scans **por usuário**, não por QR Code
- ✅ Respeita limites de tier (1k free, 50k pro, ∞ enterprise)
- ✅ Mostra uso em tempo real na sidebar
- ✅ Bloqueia scans quando limite é atingido
- ✅ Reseta automaticamente todo mês
- ✅ Tem página de erro amigável
- ✅ Incentiva upgrade quando uso está alto
