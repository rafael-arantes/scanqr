# 📋 Guia de Implementação - Funcionalidades do Dashboard

## ✅ Implementações Concluídas

### 1. **Coluna de Nome do QR Code**

- ✅ Migration criada: `009_add_qrcode_name_column.sql`
- ✅ API atualizada para aceitar `name` em POST e PATCH
- ✅ Campo `name` adicionado em CreateQrCodeDialog
- ✅ Campo `name` adicionado no modal de edição
- ✅ Coluna "QR Code" (imagem) substituída por coluna "Nome" na tabela desktop
- ✅ Imagem do QR mantida apenas nos cards mobile

**O que mudou:**

- **Desktop**: Coluna de nome + ID curto ao invés da imagem
- **Mobile**: Nome no header do card + QR Code visual mantido

### 2. **Barra de Busca com Filtros**

- ✅ Componente `QrCodeSearch.tsx` criado
- ✅ Busca por: nome, URL destino, URL curta (short_id)
- ✅ Filtros de data (de/até)
- ✅ Debounce de 300ms para performance
- ✅ Botão para limpar filtros
- ✅ Expandir/colapsar filtros avançados
- ✅ Mensagem quando nenhum resultado é encontrado

**Como funciona:**

- Digite qualquer termo → busca em nome, URL destino e short_id
- Clique no ícone de filtro → expande filtros de data
- Todos os filtros trabalham juntos (AND logic)

### 3. **Download em PNG e SVG**

- ✅ Função `handleDownload()` atualizada com toast
- ✅ Função `handleDownloadSVG()` criada
- ✅ Dropdown menu instalado (@radix-ui/react-dropdown-menu)
- ✅ Botão de download substituído por dropdown
- ✅ Opções: "Baixar PNG" e "Baixar SVG"
- ✅ Implementado tanto no desktop quanto no mobile
- ✅ Toasts de sucesso/erro

**Formatos disponíveis:**

- **PNG**: 1024x1024px, correção de erros alta (H)
- **SVG**: Vetorial, editável, ideal para impressão

## 🚀 Como Aplicar as Mudanças

### Passo 1: Aplicar Migration no Supabase

```sql
-- Executar no Supabase SQL Editor:
-- Migration: 009_add_qrcode_name_column.sql

ALTER TABLE public.qrcodes
    ADD COLUMN IF NOT EXISTS name VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_qrcodes_name
    ON public.qrcodes(name);

CREATE INDEX IF NOT EXISTS idx_qrcodes_user_name
    ON public.qrcodes(user_id, name);

COMMENT ON COLUMN public.qrcodes.name IS 'Nome do QR Code para facilitar organização e busca';
```

### Passo 2: Build e Deploy

```bash
# Verificar se não há erros de TypeScript
npm run build

# Se tudo OK, fazer deploy na Vercel
git add .
git commit -m "feat: adiciona nome, busca e download SVG no dashboard"
git push origin feat/name-column-and-search
```

### Passo 3: Testar no Ambiente de Produção

#### Criar QR Code com Nome

1. Acessar dashboard
2. Clicar em "Criar QR Code"
3. Preencher nome (ex: "Instagram da Loja")
4. Verificar se aparece na lista

#### Testar Busca

1. Digite parte do nome → deve filtrar
2. Digite parte da URL → deve filtrar
3. Use filtros de data → deve funcionar
4. Limpe filtros → mostra todos

#### Testar Download

1. Click botão download
2. Escolha PNG → baixa arquivo .png
3. Escolha SVG → baixa arquivo .svg
4. Verifique se os arquivos abrem corretamente

#### Testar Mobile

1. Abra no celular
2. Verifique se nome aparece no header
3. Verifique se QR Code visual está visível
4. Teste busca e filtros
5. Teste dropdown de download

## 📱 UX Mobile

### Melhorias Implementadas

**Cards Mobile:**

- Header compacto com nome em destaque
- Scan count menor, mais discreto
- QR Code mantido para fácil acesso
- Dropdown de download compacto

**Busca Mobile:**

- Input expansível
- Filtros colapsáveis
- Botão "Limpar filtros" acessível
- Mensagens amigáveis quando não há resultados

## 🎨 Detalhes de Implementação

### Estrutura de Arquivos Modificados

```
/src
├── app/
│   ├── dashboard/
│   │   ├── CreateQrCodeDialog.tsx      ✅ + campo name
│   │   ├── QrCodeList.tsx              ✅ + coluna nome, dropdown download
│   │   ├── QrCodeSearch.tsx            ✅ NOVO componente
│   │   └── page.tsx                    ✅ + filtros e busca
│   └── api/
│       ├── shorten/route.ts            ✅ + campo name
│       └── qrcodes/[id]/route.ts       ✅ + campo name
├── components/ui/
│   └── dropdown-menu.tsx               ✅ NOVO componente
└── supabase/migrations/
    └── 009_add_qrcode_name_column.sql  ✅ NOVA migration
```

### APIs Atualizadas

#### POST /api/shorten

```typescript
{
  url: string;
  name?: string;  // ✅ NOVO
  custom_domain_id?: number;
}
```

#### PATCH /api/qrcodes/[id]

```typescript
{
  new_url: string;
  name?: string;  // ✅ NOVO
  custom_domain_id?: number;
}
```

### Tipos TypeScript Atualizados

```typescript
type QRCodeType = {
  id: number;
  short_id: string;
  original_url: string;
  name: string | null;  // ✅ NOVO
  created_at: string;
  scan_count: number;
  custom_domain_id: number | null;
  custom_domains?: { ... } | null;
};
```

## 🔍 Lógica de Busca

```typescript
// Busca textual (OR logic)
const matchesName = qr.name?.toLowerCase().includes(searchTerm);
const matchesUrl = qr.original_url.toLowerCase().includes(searchTerm);
const matchesShortId = qr.short_id.toLowerCase().includes(searchTerm);

// Filtros de data (AND logic)
const matchesDateFrom = new Date(qr.created_at) >= fromDate;
const matchesDateTo = new Date(qr.created_at) <= toDate;

// Resultado final
const filtered = qrcodes.filter((qr) => (matchesName || matchesUrl || matchesShortId) && matchesDateFrom && matchesDateTo);
```

## 📊 Performance

### Otimizações Implementadas

1. **Debounce na Busca**: 300ms

   - Evita filtrar a cada tecla digitada
   - Reduz re-renders

2. **Índices no Banco**:

   - `idx_qrcodes_name` - busca por nome
   - `idx_qrcodes_user_name` - busca composta

3. **Filtragem Client-Side**:
   - Dados já estão carregados
   - Filtros aplicados em memória
   - Sem requests adicionais

## 🎯 Próximos Passos (Opcional)

### Melhorias Futuras

- [ ] Ordenação customizada (nome, data, scans)
- [ ] Exportar lista de QR Codes em CSV
- [ ] Busca avançada (regex, operadores)
- [ ] Tags/categorias para QR Codes
- [ ] Preview do QR Code antes de baixar
- [ ] Personalização de cores do QR Code

### Analytics

- [ ] Rastrear quais QR Codes são mais baixados
- [ ] Rastrear formatos mais usados (PNG vs SVG)
- [ ] Rastrear uso da busca/filtros

## 📝 Notas de Migração

### Compatibilidade Retroativa

- QR Codes antigos terão `name = null`
- Interface mostra "Sem nome" quando null
- Busca funciona mesmo com nome null
- Edição permite adicionar nome a QR antigos

### Dados Existentes

Os QR Codes criados antes desta atualização:

- Continuam funcionando normalmente
- Podem ter nome adicionado via edição
- Aparecem como "Sem nome" na lista
- São filtráveis por URL e short_id

## ✅ Checklist de Validação

Antes de considerar completo, verificar:

- [x] Migration criada e documentada
- [x] APIs atualizadas (POST + PATCH)
- [x] Componente de criação atualizado
- [x] Componente de edição atualizado
- [x] Busca e filtros implementados
- [x] Download SVG implementado
- [x] Dropdown de download criado
- [x] Layout desktop atualizado
- [x] Layout mobile atualizado
- [x] Tipos TypeScript atualizados
- [x] Toasts de feedback
- [x] Debounce implementado
- [ ] Migration aplicada no Supabase
- [ ] Build sem erros
- [ ] Testado em produção
- [ ] Testado em mobile
- [ ] Testado todos os casos de uso

---

**Data de Implementação**: 2 de Dezembro de 2025
**Branch**: `feat/name-column-and-search`
**Status**: ✅ Código completo, aguardando deploy e testes
