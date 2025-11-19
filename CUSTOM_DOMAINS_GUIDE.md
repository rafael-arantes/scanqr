# 🌐 Guia de Domínios Customizados

## 📋 Visão Geral

A funcionalidade de domínios customizados permite que usuários Pro e Enterprise usem seus próprios domínios (ex: qr.suaempresa.com) para gerar links de QR Codes, ao invés do domínio padrão do app.

### Benefícios:

- ✅ **Branding personalizado** - Use seu próprio domínio
- ✅ **Confiança do usuário** - Links com sua marca são mais confiáveis
- ✅ **Rastreamento separado** - Estatísticas por domínio
- ✅ **SEO** - Mantenha tráfego no seu domínio

## 🎯 Limites por Plano

| Plano          | Domínios Customizados |
| -------------- | --------------------- |
| **Free**       | 0 (não disponível)    |
| **Pro**        | Até 3 domínios        |
| **Enterprise** | Ilimitado             |

## 🗄️ Estrutura de Dados

### Tabela `custom_domains`

```sql
id BIGINT - ID do domínio
user_id UUID - Dono do domínio
domain TEXT - Domínio (ex: qr.empresa.com)
verified BOOLEAN - Se foi verificado via DNS
verification_token TEXT - Token para verificação
created_at TIMESTAMP - Data de criação
verified_at TIMESTAMP - Data de verificação
```

### Coluna em `qrcodes`

```sql
custom_domain_id BIGINT - Domínio customizado associado (opcional)
```

## 🚀 Como Usar

### 1. Adicionar Domínio (UI)

1. Acesse Dashboard > Domínios Customizados
2. Clique em "Adicionar Domínio"
3. Digite seu domínio (ex: `qr.suaempresa.com`)
4. Clique em "Adicionar"

### 2. Configurar DNS

Após adicionar, você receberá instruções para configurar um registro TXT:

```
Tipo: TXT
Nome: _scanqr-verification.qr.suaempresa.com
Valor: [token gerado automaticamente]
TTL: 3600 (ou padrão)
```

**Exemplos por provedor:**

#### Cloudflare

1. Dashboard > DNS > Add record
2. Type: TXT
3. Name: `_scanqr-verification.qr`
4. Content: [cole o token]
5. Save

#### GoDaddy

1. DNS Management > Add
2. Type: TXT
3. Host: `_scanqr-verification.qr`
4. TXT Value: [cole o token]
5. Save

#### AWS Route 53

1. Hosted zones > sua zona
2. Create record
3. Record type: TXT
4. Record name: `_scanqr-verification.qr`
5. Value: [cole o token]
6. Create records

#### Namecheap

1. Advanced DNS
2. Add New Record
3. Type: TXT Record
4. Host: `_scanqr-verification.qr`
5. Value: [cole o token]
6. Save

### 3. Verificar Domínio

1. Aguarde propagação DNS (geralmente 15 minutos, pode levar até 48h)
2. Clique em "Verificar DNS" no domínio
3. Sistema valida automaticamente o registro TXT
4. Se verificado com sucesso, o domínio fica disponível para uso

### 4. Usar Domínio em QR Codes

Após verificação, você pode associar domínios aos seus QR codes:

#### Ao Criar Novo QR Code

1. No dashboard, clique em "Criar QR Code"
2. Insira a URL de destino
3. No campo "Domínio Customizado (Opcional)", selecione um domínio verificado
4. Clique em "Criar QR Code"
5. O QR code será associado ao domínio (visível com badge roxo na listagem)

#### Editar QR Code Existente

1. Na lista de QR codes, clique no botão "Editar" (ícone de lápis)
2. Altere a URL de destino se necessário
3. No campo "Domínio", selecione um domínio verificado ou "Domínio padrão"
4. Clique em "Salvar Alterações"

**Nota importante:** Os QR codes sempre usam o domínio padrão do app (ex: app.com/abc123) fisicamente. A associação com domínio customizado serve para:

- Branding e organização visual
- Estatísticas e analytics por domínio
- Rastreamento de origem
- Futuras funcionalidades (redirecionamentos, etc)

### 5. Visualizar QR Codes com Domínios

QR codes associados a domínios customizados mostram um badge roxo com ícone:

**Desktop (Tabela):**

```
Short ID: abc123
Domain: app.com
[🔍 qr.suaempresa.com]  ← Badge roxo
```

**Mobile (Cards):**

```
Link Encurtado: abc123
[🔍 qr.suaempresa.com]  ← Badge roxo abaixo do link
```

2. Volte à página de Domínios Customizados
3. Clique em "Verificar" no domínio
4. Se configurado corretamente, será marcado como ✅ Verificado

### 4. Usar Domínio em QR Codes

**Opção A: Via API** (futuro)

```typescript
POST /api/shorten
{
  "url": "https://example.com",
  "custom_domain_id": 123
}
```

**Opção B: Padrão para todos**
O primeiro domínio verificado será usado automaticamente (implementação futura).

## 🔍 Verificação de DNS

### Como funciona:

1. Sistema busca registro TXT em `_scanqr-verification.[seu-domínio]`
2. Compara o valor com o token armazenado
3. Se coincidirem, marca domínio como verificado

### Testar manualmente:

```bash
# Linux/Mac
dig TXT _scanqr-verification.qr.suaempresa.com

# Windows
nslookup -type=TXT _scanqr-verification.qr.suaempresa.com

# Online
https://dnschecker.org
```

### Troubleshooting DNS:

**Problema:** "Token não encontrado"

**Causas comuns:**

1. DNS não propagou ainda (aguarde 15min-48h)
2. Registro TXT incorreto (verifique espaços, copie exatamente)
3. Subdomínio errado (deve ser `_scanqr-verification.SEU-DOMINIO`)
4. Cache DNS (limpe: `ipconfig /flushdns` no Windows ou `sudo dscacheutil -flushcache` no Mac)

**Solução:**

1. Verifique se o registro está correto no painel DNS
2. Use ferramenta online de verificação DNS
3. Aguarde mais tempo para propagação
4. Tente novamente após 1 hora

## 📊 API Endpoints

### Listar Domínios

```http
GET /api/custom-domains

Response 200:
{
  "domains": [
    {
      "id": 1,
      "domain": "qr.empresa.com",
      "verified": true,
      "qr_codes_count": 5,
      "total_scans": 1234,
      "created_at": "2025-11-19T10:00:00Z"
    }
  ]
}
```

### Adicionar Domínio

```http
POST /api/custom-domains
Content-Type: application/json

{
  "domain": "qr.empresa.com"
}

Response 200:
{
  "domain": {
    "id": 1,
    "domain": "qr.empresa.com",
    "verified": false,
    "verification_token": "abc123..."
  },
  "message": "Domínio adicionado! Configure DNS..."
}

Response 403 (Limite atingido):
{
  "error": "Limite atingido",
  "message": "Você atingiu o limite de 3 domínios...",
  "upgrade_required": false
}
```

### Verificar Domínio

```http
POST /api/custom-domains/[id]/verify

Response 200:
{
  "success": true,
  "message": "Domínio verificado com sucesso!",
  "domain": "qr.empresa.com"
}

Response 400 (Falha):
{
  "error": "Verificação falhou",
  "message": "Token não encontrado...",
  "expected_record": {
    "type": "TXT",
    "name": "_scanqr-verification.qr.empresa.com",
    "value": "abc123..."
  }
}
```

### Deletar Domínio

```http
DELETE /api/custom-domains/[id]

Response 200:
{
  "message": "Domínio removido com sucesso"
}
```

## 🔒 Segurança

### Row Level Security (RLS)

- ✅ Usuários só veem/editam seus próprios domínios
- ✅ Verificação de tier antes de adicionar
- ✅ Token de verificação único e secreto

### Validações:

1. **Formato do domínio:** Regex valida formato
2. **Unicidade:** Um domínio = um usuário
3. **Ownership:** Verificação via DNS TXT
4. **Gatekeeping:** Limites por plano respeitados

## 🧪 Testes

### Teste 1: Adicionar Domínio

```bash
# 1. Faça login como usuário Pro
# 2. Acesse /dashboard/custom-domains
# 3. Clique "Adicionar Domínio"
# 4. Digite: qr.example.com
# 5. Verifique que aparece na lista com status "Pendente"
```

### Teste 2: Verificar DNS

```bash
# 1. Configure registro TXT no seu provedor DNS
# 2. Aguarde 15 minutos
# 3. Teste resolução:
dig TXT _scanqr-verification.qr.example.com

# 4. Clique "Verificar" na UI
# 5. Status deve mudar para "Verificado"
```

### Teste 3: Gatekeeping

```sql
-- Simular usuário Free
UPDATE user_profiles
SET subscription_tier = 'free'
WHERE id = '[USER_ID]';

-- Tentar adicionar domínio
-- Deve mostrar mensagem: "Esta funcionalidade está disponível apenas para Pro/Enterprise"
```

### Teste 4: Limite Pro (3 domínios)

```bash
# 1. Login como Pro
# 2. Adicione 3 domínios
# 3. Tente adicionar 4º
# 4. Deve bloquear com mensagem de limite
```

## 📈 Métricas

### Queries úteis:

```sql
-- Domínios por usuário
SELECT user_id, COUNT(*) as domain_count
FROM custom_domains
GROUP BY user_id
ORDER BY domain_count DESC;

-- Domínios mais usados
SELECT domain, qr_codes_count, total_scans
FROM custom_domains_stats
ORDER BY total_scans DESC
LIMIT 10;

-- Taxa de verificação
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE verified = true) as verified,
  ROUND(COUNT(*) FILTER (WHERE verified = true) * 100.0 / COUNT(*), 2) as verify_rate
FROM custom_domains;
```

## 🚧 Futuras Melhorias

### Curto Prazo:

- [ ] Seletor de domínio ao criar QR Code
- [ ] CNAME como alternativa ao TXT (mais fácil)
- [ ] Notificações de expiração de verificação
- [ ] Dashboard de analytics por domínio

### Médio Prazo:

- [ ] SSL automático via Let's Encrypt
- [ ] Subpath routing (qr.empresa.com/marketing/\*)
- [ ] Wildcard domains para Enterprise
- [ ] API de gerenciamento via webhooks

### Longo Prazo:

- [ ] CDN integration para performance
- [ ] Domínios compartilhados (teams)
- [ ] Custom DNS nameservers
- [ ] Certificados SSL customizados

## ✅ Checklist de Implementação

- [x] Migration SQL criada
- [x] Tabela custom_domains
- [x] View custom_domains_stats
- [x] Funções RPC (can_add, verification)
- [x] Tipos TypeScript
- [x] API endpoints (GET, POST, DELETE, VERIFY)
- [x] UI de gerenciamento
- [x] Gatekeeping por tier
- [x] Verificação DNS
- [x] Link na sidebar
- [x] Documentação

## 📝 Arquivos Criados/Modificados

```
supabase/migrations/002_add_custom_domains.sql          ← NOVA
src/types/customDomains.ts                              ← NOVA
src/lib/subscriptionTiers.ts                            ← MODIFICADA
src/app/api/custom-domains/route.ts                     ← NOVA
src/app/api/custom-domains/[id]/route.ts                ← NOVA
src/app/dashboard/custom-domains/page.tsx               ← NOVA
src/app/dashboard/custom-domains/CustomDomainsClient.tsx ← NOVA
src/app/dashboard/DashboardSidebar.tsx                  ← MODIFICADA
```

## 🎓 Exemplos de Uso

### Exemplo 1: Empresa de Marketing

```
Domínio: qr.agenciamarketing.com
QR Codes: 50 campanhas diferentes
Benefício: Clientes veem link da agência, não genérico
```

### Exemplo 2: E-commerce

```
Domínio: cupons.minhaloja.com.br
QR Codes: Cupons de desconto em produtos
Benefício: Confiança do cliente aumenta conversão
```

### Exemplo 3: Eventos

```
Domínio: checkin.meuevent.com
QR Codes: Ingressos e check-in
Benefício: Branding profissional
```

---

**Status:** ✅ Implementação Completa  
**Migration necessária:** Sim (`002_add_custom_domains.sql`)  
**Tier mínimo:** Pro
