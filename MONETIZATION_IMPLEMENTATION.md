# Infraestrutura de Monetização e Analytics

## 📋 Visão Geral

Esta implementação adiciona a infraestrutura fundamental para o modelo de negócio Freemium:

1. **Sistema de Tiers de Usuário** - Diferenciação entre planos (free, pro, enterprise)
2. **Analytics de Scans** - Contabilização de cada acesso aos QR Codes
3. **UI de Observabilidade** - Visualização de métricas no dashboard

## 🗄️ Alterações no Banco de Dados

### Nova Tabela: `user_profiles`

```sql
- id (UUID) - Referência ao usuário do Supabase Auth
- subscription_tier (TEXT) - Plano atual: 'free', 'pro', ou 'enterprise'
- created_at, updated_at (TIMESTAMP)
```

### Nova Coluna: `qrcodes.scan_count`

```sql
- scan_count (INTEGER) - Contador acumulado de scans/acessos
```

### Automações

- **Trigger**: Cria automaticamente perfil 'free' para novos usuários
- **Função RPC**: `increment_scan_count(p_short_id)` para performance otimizada

## 🚀 Como Aplicar a Migration

### Opção 1: Via Supabase CLI (Recomendado)

```bash
# Navegue até a raiz do projeto
cd /Volumes/Storage/Develop/repos/scanqr

# Execute a migration
supabase db push

# Ou se estiver usando migrations versionadas:
supabase migration up
```

### Opção 2: Via Dashboard do Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Navegue até **SQL Editor**
4. Cole o conteúdo do arquivo `supabase/migrations/001_add_monetization_infrastructure.sql`
5. Execute o script

### Opção 3: Via psql (Avançado)

```bash
psql "postgresql://postgres:[SUA-SENHA]@[SEU-HOST]:5432/postgres" -f supabase/migrations/001_add_monetization_infrastructure.sql
```

## 📊 Funcionalidades Implementadas

### 1. Tracking de Scans (Analytics)

**Como funciona:**

- Cada acesso a `/{shortId}` incrementa automaticamente o contador
- Usa função RPC do Postgres para máxima performance (1 query)
- Funciona para acessos anônimos (não requer autenticação)

**Localização:** `src/app/[shortId]/page.tsx`

```typescript
// Incrementa atomicamente e retorna a URL em uma única operação
const { data: originalUrl } = await supabase.rpc('increment_scan_count', {
  p_short_id: shortId,
});
```

### 2. Dashboard com Métricas

**Exibição:**

- **Desktop**: Coluna "Scans" na tabela
- **Mobile**: Badge destacado nos cards

**Localização:** `src/app/dashboard/QrCodeList.tsx`

### 3. Sistema de Tiers

**Helper criado:** `src/lib/subscriptionTiers.ts`

**Exemplo de uso futuro:**

```typescript
import { canCreateQrCode, getTierLimits } from '@/lib/subscriptionTiers';

// Verificar se usuário pode criar mais QR Codes
const userTier = 'free';
const currentQrCount = 8;

if (!canCreateQrCode(userTier, currentQrCount)) {
  alert('Limite atingido! Faça upgrade para criar mais QR Codes.');
}

// Obter limites do plano
const limits = getTierLimits('pro');
console.log(limits.maxQrCodes); // 100
```

## 🎯 Limites Configurados

| Feature               | Free       | Pro    | Enterprise  |
| --------------------- | ---------- | ------ | ----------- |
| QR Codes              | 10         | 100    | Ilimitado   |
| Scans/mês             | 1.000      | 50.000 | Ilimitado   |
| Domínios Customizados | ❌         | ✅     | ✅          |
| Analytics Avançado    | ❌         | ✅     | ✅          |
| Exportação de Dados   | ❌         | ✅     | ✅          |
| Suporte               | Comunidade | Email  | Prioritário |

## 🔐 Segurança

### Row Level Security (RLS)

- Tabela `user_profiles` protegida por RLS
- Usuários só podem ver/editar seus próprios perfis
- Incremento de scans usa `SECURITY DEFINER` para permitir acesso público

### Service Role Key

- Usado apenas para operações públicas (redirecionamento)
- Não exposto no client-side
- Configurado via variável de ambiente

## 🧪 Testando a Implementação

### 1. Verificar Criação de Perfil

```sql
-- No SQL Editor do Supabase
SELECT * FROM user_profiles;
```

### 2. Testar Incremento de Scans

```bash
# Acesse um QR Code existente várias vezes
curl https://seu-dominio.com/abc12345

# Verifique o contador
SELECT short_id, scan_count FROM qrcodes WHERE short_id = 'abc12345';
```

### 3. Verificar UI

1. Acesse `/dashboard`
2. Verifique se a coluna "Scans" está visível
3. Acesse alguns QR Codes
4. Recarregue o dashboard e veja os números atualizarem

## 📈 Próximos Passos Sugeridos

### 1. Gatekeeping (Verificação de Limites)

```typescript
// Em src/app/api/shorten/route.ts
import { canCreateQrCode } from '@/lib/subscriptionTiers';

// Buscar tier do usuário
const { data: profile } = await supabase.from('user_profiles').select('subscription_tier').eq('id', session.user.id).single();

// Contar QR Codes do usuário
const { count } = await supabase.from('qrcodes').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);

// Verificar limite
if (!canCreateQrCode(profile.subscription_tier, count || 0)) {
  return NextResponse.json({ error: 'Limite de QR Codes atingido. Faça upgrade!' }, { status: 403 });
}
```

### 2. Indicador Visual de Limite

Adicione um badge no dashboard mostrando o uso:

```typescript
import { getQrCodeUsagePercentage, getQrCodeLimitMessage } from '@/lib/subscriptionTiers';

const usagePercent = getQrCodeUsagePercentage(tier, qrcodes.length);
const message = getQrCodeLimitMessage(tier, qrcodes.length);
```

### 3. Analytics por Período

Criar tabela `scan_events` para análise temporal:

```sql
CREATE TABLE scan_events (
  id BIGSERIAL PRIMARY KEY,
  qrcode_id INTEGER REFERENCES qrcodes(id),
  scanned_at TIMESTAMP DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET
);
```

### 4. Página de Upgrade

Criar `/upgrade` com comparativo de planos e integração com Stripe/Paddle.

## 🐛 Troubleshooting

### Scans não estão incrementando

- Verifique se a função `increment_scan_count` foi criada
- Confirme que `SUPABASE_SERVICE_ROLE_KEY` está no `.env.local`
- Verifique logs no Supabase Dashboard > Database > Logs

### Novos usuários não têm perfil

- Verifique se o trigger `on_auth_user_created` está ativo
- Execute manualmente a query de popular perfis existentes
- Teste criando um novo usuário via signup

### RLS bloqueando acesso

- Confirme que as policies estão ativas
- Para debug temporário, desabilite RLS: `ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;`

## 📝 Arquivos Modificados

```
supabase/migrations/001_add_monetization_infrastructure.sql  ← NOVA
src/lib/subscriptionTiers.ts                                 ← NOVA
src/app/[shortId]/page.tsx                                   ← MODIFICADA
src/app/dashboard/page.tsx                                   ← MODIFICADA
src/app/dashboard/QrCodeList.tsx                             ← MODIFICADA
```

## ✅ Checklist de Implementação

- [x] Migration SQL criada
- [x] Trigger de auto-criação de perfil
- [x] Função RPC para incremento otimizado
- [x] Tracking de scans implementado
- [x] UI atualizada para exibir métricas
- [x] Sistema de tiers documentado
- [x] Helpers utilitários criados
- [x] Migration aplicada no Supabase
- [x] Gatekeeping de limites implementado
- [x] Página de upgrade criada
- [x] Incrementar sidebar de "Minha conta" para mostrar o uso do limite
- [x] Colocar botão de upgrade na sidebar "Minha conta"
- [x] **Implementar funcionalidade de domínios personalizados** ✨
  - [x] Migration 002 criada
  - [x] Tabela custom_domains
  - [x] Verificação DNS via TXT record
  - [x] API endpoints (CRUD + verify)
  - [x] UI de gerenciamento
  - [x] Gatekeeping por tier
  - [x] Documentação completa (ver CUSTOM_DOMAINS_GUIDE.md)
  - [x] **Integração com QR codes** 🔗
    - [x] Seletor de domínio no CreateQrCodeDialog
    - [x] API /api/shorten aceita custom_domain_id
    - [x] Validação de domínio verificado na criação
    - [x] Badge roxo mostrando domínio na listagem (desktop e mobile)
    - [x] Edição de domínio para QR codes existentes
    - [x] API /api/qrcodes/[id] atualizada para domínios
    - [x] Carregamento automático de domínios verificados
    - [x] Query com join para exibir domínios
- [x] **Implementar criação de QR Codes pela página de dashboard** 🎯
  - [x] Componente CreateQrCodeDialog
  - [x] Botão CTA no dashboard
  - [x] Gatekeeping integrado
  - [x] Auto-reload da lista após criação
  - [x] Empty state com CTA
- [x] **Modernizar visual da página inicial** ✨
  - [x] Hero section com gradientes modernos
  - [x] Navegação sticky com backdrop blur
  - [x] Seção de features com 6 cards animados
  - [x] Formulário de criação redesenhado
  - [x] Estatísticas no hero (10+ grátis, 100% analytics, ∞ scans)
  - [x] CTA section e footer completo
  - [x] Design responsivo mobile-first
  - [x] Checkbox de encurtar URL ativado por padrão
  - [x] Header com autenticação condicional
- [x] **Modernizar o visual da listagem no dashboard** 🎨
  - [x] Tabela desktop com gradientes e sombras
  - [x] Cards mobile redesenhados com header destacado
  - [x] Analytics badge com ícone e cores
  - [x] Botões com hover states coloridos
  - [x] Notificação toast ao copiar URL
  - [x] Ícones informativos (ExternalLink, BarChart3)
  - [x] Formatação de datas melhorada
  - [x] Dark mode totalmente suportado
- [x] **Criar modal de Perfil do Usuário** 👤
  - [x] Migration 003 para campos display_name e avatar_url
  - [x] Componente ProfileDialog com formulário
  - [x] Campos: email (read-only), nome, avatar
  - [x] Badge do tier atual com ícone
  - [x] Botão de upgrade para plano Free
  - [x] Preview de avatar com fallback
  - [x] Validação e contador de caracteres
  - [x] Toast notification de sucesso
  - [x] Loading states durante save
  - [x] Integrado na sidebar do dashboard
- [x] Integração com pagamentos (Stripe/Paddle)
- [x] Mostrar limite de scans na sidebar e verificar se o limite está sendo considerado no backend por usuário, não por qrcode
  - [x] Migration 006 criada com tracking mensal de scans
  - [x] Função increment_scan_count atualizada para verificar limite
  - [x] Coluna monthly_scans e monthly_scans_reset_at em user_profiles
  - [x] View user_scan_stats para estatísticas
  - [x] Página de erro quando limite é atingido
  - [x] Sidebar mostrando uso mensal de scans
  - [x] Helpers utilitários para scans (getScansLimitMessage, getScansUsagePercentage, etc)
  - [x] Reset automático mensal
- [ ] Exportação de relatórios gerais - plano pro
- [ ] Melhorias na funcionalidade de domínios personalizados
  - [ ] Analytics por domínio customizado
  - [ ] Redirecionamento via domínio customizado (CNAME)
  - [ ] Filtros na listagem por domínio
  - [ ] Exportar relatórios por domínio
