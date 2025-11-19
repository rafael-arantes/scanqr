# Implementação do Modo Routing para Domínios Customizados

## Visão Geral

Implementação completa do sistema de dois modos para domínios customizados:

### 🏷️ Modo Branding (Todos os Planos)

- **Uso**: Apenas para organização de QR codes
- **DNS**: Requer apenas registro TXT para verificação
- **URL do QR Code**: Usa domínio padrão da aplicação (`app.com/abc123`)
- **Indicação**: Badge roxo com emoji 🏷️
- **Planos**: Free, Pro, Enterprise

### 🌐 Modo Routing (Pro/Enterprise)

- **Uso**: QR codes usam o domínio customizado
- **DNS**: Requer TXT (verificação) + CNAME (roteamento)
- **URL do QR Code**: Usa domínio customizado (`qr.meudominio.com/abc123`)
- **Indicação**: Badge azul com emoji 🌐
- **Planos**: Apenas Pro e Enterprise
- **Gatekeeping**: Bloqueado no backend e UI para plano Free

## Arquivos Modificados

### 1. Migration 004 - Database Schema

**Arquivo**: `supabase/migrations/004_add_custom_domain_routing.sql`

```sql
ALTER TABLE custom_domains
ADD COLUMN mode TEXT DEFAULT 'branding'
CHECK (mode IN ('branding', 'routing'));
```

- Adiciona coluna `mode` com valores: `'branding'` | `'routing'`
- Valor padrão: `'branding'` (seguro)
- Atualiza view `custom_domains_stats` para incluir `mode`
- Cria índice para filtrar domínios em modo routing

### 2. Middleware - Request Routing

**Arquivo**: `src/middleware.ts`

**Funcionalidade**:

- Detecta hostname da requisição
- Se hostname ≠ domínio da app:
  1. Consulta `custom_domains` com `mode='routing'` e `verified=true`
  2. Faz join com `qrcodes` pelo `short_id` na URL
  3. Incrementa contador de scans via RPC
  4. Redireciona para `original_url`

**Código Principal**:

```typescript
const hostname = req.headers.get('host');
const appDomain = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '');

if (hostname !== appDomain) {
  // Query custom domain with routing mode
  const { data: qrcodeData } = await supabase
    .from('qrcodes')
    .select(
      `
      id, original_url,
      custom_domains!inner(verified, mode)
    `
    )
    .eq('short_id', shortId)
    .eq('custom_domains.verified', true)
    .eq('custom_domains.mode', 'routing')
    .single();

  // Redirect logic...
}
```

### 3. Types - TypeScript Definitions

**Arquivo**: `src/types/customDomains.ts`

```typescript
export type DomainMode = 'branding' | 'routing';

export interface CustomDomain {
  id: number;
  domain: string;
  verified: boolean;
  mode: DomainMode;
  // ...
}
```

### 4. API - Custom Domains Endpoint

**Arquivo**: `src/app/api/custom-domains/route.ts`

**POST Endpoint**:

- Aceita parâmetro `mode` (default: `'branding'`)
- Valida modo antes de inserir
- **Gatekeeping**: Bloqueia modo routing para tier Free
- Retorna erro 403 se usuário Free tentar routing
- Retorna domínio com campo `mode`

```typescript
const { domain, mode = 'branding' } = await req.json();

// Validate mode
if (mode !== 'branding' && mode !== 'routing') {
  return NextResponse.json({ error: 'Modo inválido' }, { status: 400 });
}

// Gatekeeping: Routing apenas para Pro/Enterprise
if (mode === 'routing' && userTier === 'free') {
  return NextResponse.json(
    {
      error: 'Recurso não disponível',
      message: 'Modo routing está disponível apenas nos planos Pro e Enterprise...',
      upgrade_required: true,
    },
    { status: 403 }
  );
}
```

### 5. UI - Custom Domains Management

**Arquivo**: `src/app/dashboard/custom-domains/CustomDomainsClient.tsx`

**Melhorias**:

#### Seletor de Modo no Dialog

```tsx
const isRoutingAllowed = tier === 'pro' || tier === 'enterprise';

<select value={newDomainMode} disabled={!isRoutingAllowed}>
  <option value="branding">🏷️ Branding - Apenas organização (recomendado)</option>
  <option value="routing" disabled={!isRoutingAllowed}>
    🌐 Routing - QR code usa o domínio customizado (Pro/Enterprise)
  </option>
</select>;
```

**Gatekeeping UI**:

- Select desabilitado para usuários Free
- Opção routing mostra badge "(Pro/Enterprise)"
- Mensagem de alerta exibida ao visualizar modo routing no plano Free
- Backend bloqueia requisições mesmo se UI for manipulada

#### Instruções DNS Condicionais

- **TXT Record**: Sempre exibido (verificação)
- **CNAME Record**: Apenas quando `mode === 'routing'`

```tsx
{
  domain.mode === 'routing' && (
    <div>
      <p>Tipo: CNAME</p>
      <p>Nome: {domain.domain}</p>
      <p>Valor: {NEXT_PUBLIC_APP_URL}</p>
    </div>
  );
}
```

#### Badges Visuais

- 🌐 Azul = Routing mode
- 🏷️ Roxo = Branding mode

### 6. QR Code Creation Dialog

**Arquivo**: `src/app/dashboard/CreateQrCodeDialog.tsx`

- Adiciona campo `mode` ao tipo `CustomDomain`
- Carrega `mode` ao buscar domínios verificados
- Exibe emoji indicador no dropdown (🌐 ou 🏷️)

### 7. QR Code List

**Arquivo**: `src/app/dashboard/QrCodeList.tsx`

**Helper Function**:

```typescript
const getQrCodeUrl = (qrcode: QRCodeType): string => {
  if (qrcode.custom_domains?.verified && qrcode.custom_domains?.mode === 'routing') {
    return `https://${qrcode.custom_domains.domain}/${qrcode.short_id}`;
  }
  return `${appUrl}/${qrcode.short_id}`;
};
```

**Atualizações**:

- URLs exibidas usam domínio customizado em routing mode
- QR codes gerados com URL correta baseada no modo
- Badges coloridos indicam modo (azul/roxo)
- Função `handleCopy` copia URL correta

### 8. Dashboard Page

**Arquivo**: `src/app/dashboard/page.tsx`

- Atualiza query para incluir `mode` do domínio
- Atualiza tipo `QRCodeType` com campo `mode`

## Fluxo de Uso

### Para Usuários - Modo Branding (Simples)

1. Adicionar domínio no dashboard
2. Selecionar "🏷️ Branding" (padrão)
3. Configurar apenas TXT record
4. Verificar domínio
5. Criar QR codes associados (URL usa domínio padrão)

### Para Usuários - Modo Routing (Avançado)

1. Adicionar domínio no dashboard
2. Selecionar "🌐 Routing"
3. Configurar TXT record (verificação)
4. Configurar CNAME record (roteamento)
   - Nome: `qr.meudominio.com`
   - Valor: `seu-app.vercel.app`
5. Verificar domínio
6. Criar QR codes associados
7. **URL do QR**: `https://qr.meudominio.com/abc123`

## Configuração DNS por Provedor

### Cloudflare

```
TXT Record:
  Name: _scanqr-verification.qr.meudominio.com
  Value: [verification_token]

CNAME Record:
  Name: qr.meudominio.com
  Target: seu-app.vercel.app
  Proxy status: DNS only (cloud cinza)
```

### Route 53 (AWS)

```
TXT Record:
  Name: _scanqr-verification.qr.meudominio.com
  Value: "[verification_token]"

CNAME Record:
  Name: qr.meudominio.com
  Value: seu-app.vercel.app
```

### GoDaddy

```
TXT Record:
  Host: _scanqr-verification.qr
  TXT Value: [verification_token]

CNAME Record:
  Host: qr
  Points to: seu-app.vercel.app
```

## Considerações de Segurança

1. **Verificação Obrigatória**: Middleware só aceita domínios verificados
2. **Modo Explícito**: Requer `mode='routing'` no banco
3. **Validação de Entrada**: API valida modo antes de inserir
4. **CNAME Correto**: Domínio deve apontar para app correto

## Próximos Passos

- [ ] Aplicar migration 004 ao banco de dados de produção
- [ ] Testar fluxo completo com domínio real
- [ ] Atualizar documentação de usuário
- [ ] Adicionar exemplos de configuração DNS por provedor
- [ ] Considerar adicionar validação CNAME antes de permitir routing mode

## Notas Técnicas

- **Migração Segura**: Domínios existentes defaultam para `mode='branding'`
- **Backwards Compatible**: Sistema funciona sem aplicar migration (usa apenas branding)
- **Edge Runtime**: Middleware usa Node.js runtime para módulo `dns/promises`
- **Performance**: Índice em `mode='routing'` otimiza queries no middleware
