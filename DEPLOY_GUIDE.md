# 🚀 Guia de Deploy - Monetização e Analytics

## 📋 Checklist Pré-Deploy

### 1. Ambiente Local

- [ ] Todas as mudanças commitadas
- [ ] Testes executados conforme `TESTING_GUIDE.md`
- [ ] Build local funcionando (`npm run build`)
- [ ] Sem erros TypeScript (`npm run type-check` ou `tsc --noEmit`)

### 2. Variáveis de Ambiente

- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada no `.env.local`
- [ ] Mesma variável será configurada na plataforma de deploy (Vercel/Netlify)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` está correto
- [ ] `NEXT_PUBLIC_APP_URL` aponta para o domínio de produção

### 3. Banco de Dados

- [ ] Migration pronta para ser aplicada
- [ ] Backup do banco atual realizado
- [ ] Acesso ao Supabase Dashboard disponível

---

## 🗄️ Passo 1: Aplicar Migration no Supabase

### Opção A: Via Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI (se não tiver)
brew install supabase/tap/supabase

# 2. Fazer login
supabase login

# 3. Linkar ao projeto (apenas primeira vez)
supabase link --project-ref [SEU_PROJECT_REF]

# 4. Aplicar migration
supabase db push
```

### Opção B: Via Dashboard do Supabase

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Navegue até **SQL Editor**
4. Clique em **New Query**
5. Cole todo o conteúdo de:
   ```
   supabase/migrations/001_add_monetization_infrastructure.sql
   ```
6. Clique em **Run** ou `Cmd/Ctrl + Enter`
7. Aguarde confirmação de sucesso

### Opção C: Via API do Supabase

```bash
# Obtenha suas credenciais do dashboard
SUPABASE_ACCESS_TOKEN="seu_token"
PROJECT_REF="seu_project_ref"

# Execute
curl -X POST \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "-- Cole aqui o conteúdo da migration"
  }'
```

### ✅ Validar Migration

```sql
-- Execute no SQL Editor após aplicar

-- 1. Verificar tabela user_profiles
SELECT COUNT(*) FROM user_profiles;

-- 2. Verificar coluna scan_count
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'qrcodes' AND column_name = 'scan_count';

-- 3. Verificar função RPC
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'increment_scan_count';

-- 4. Verificar trigger
SELECT trigger_name
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Resultado esperado:** Todas as queries retornam resultados.

---

## ☁️ Passo 2: Configurar Variáveis de Ambiente

### Vercel

```bash
# Via CLI
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Cole o valor quando solicitado

# Via Dashboard
# 1. Acesse https://vercel.com/[seu-usuario]/scanqr/settings/environment-variables
# 2. Adicione SUPABASE_SERVICE_ROLE_KEY
# 3. Selecione "Production"
# 4. Salve
```

### Netlify

```bash
# Via CLI
netlify env:set SUPABASE_SERVICE_ROLE_KEY "seu_valor" --context production

# Via Dashboard
# 1. Site settings > Environment variables
# 2. Add a variable
# 3. Key: SUPABASE_SERVICE_ROLE_KEY
# 4. Value: [cole o valor]
# 5. Scopes: Production
# 6. Save
```

### Outras Plataformas

- **Railway**: Settings > Variables > New Variable
- **Render**: Environment > Add Environment Variable
- **Fly.io**: `fly secrets set SUPABASE_SERVICE_ROLE_KEY=valor`

### 🔑 Obter Service Role Key

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. **Settings** > **API**
4. Procure por **service_role** (⚠️ NÃO confundir com anon key)
5. Clique em **Reveal** e copie o valor

⚠️ **IMPORTANTE**: Nunca exponha esta chave no cliente (browser)!

---

## 📦 Passo 3: Deploy da Aplicação

### Vercel (Recomendado)

```bash
# Via Git (automático)
git add .
git commit -m "feat: adicionar monetização e analytics"
git push origin main

# Deploy acontece automaticamente

# Via CLI
vercel --prod
```

### Netlify

```bash
# Via Git (automático)
git push origin main

# Via CLI
netlify deploy --prod
```

### Build Local (teste antes)

```bash
# Garantir que build funciona
npm run build

# Rodar versão de produção localmente
npm run start
```

---

## 🧪 Passo 4: Validação Pós-Deploy

### 4.1 Testar Tracking de Scans

```bash
# Criar um novo QR Code em produção
# Anotar o short_id

# Acessar várias vezes
curl -L https://seu-dominio.com/[SHORT_ID]
curl -L https://seu-dominio.com/[SHORT_ID]
curl -L https://seu-dominio.com/[SHORT_ID]

# Verificar no dashboard se incrementou
# Acessar: https://seu-dominio.com/dashboard
```

### 4.2 Testar Auto-criação de Perfil

```bash
# 1. Criar novo usuário
# Acessar: https://seu-dominio.com/login
# Fazer signup

# 2. Verificar no Supabase
# SQL Editor:
SELECT * FROM user_profiles
ORDER BY created_at DESC
LIMIT 1;

# Deve mostrar o novo usuário com tier 'free'
```

### 4.3 Verificar Logs

```bash
# Vercel
vercel logs --prod

# Netlify
netlify logs --prod

# Supabase
# Dashboard > Logs > Database
```

### 4.4 Monitorar Performance

```bash
# Medir latência do redirecionamento
time curl -L https://seu-dominio.com/[SHORT_ID]

# Deve ser < 500ms (incluindo redirect)
```

---

## 🔄 Passo 5: Rollback (Se Necessário)

### Reverter Migration

```sql
-- ATENÇÃO: Isso apaga dados! Faça backup primeiro!

-- 1. Remover trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Remover função do trigger
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Remover função RPC
DROP FUNCTION IF EXISTS public.increment_scan_count(TEXT);

-- 4. Remover coluna scan_count
ALTER TABLE public.qrcodes DROP COLUMN IF EXISTS scan_count;

-- 5. Remover tabela user_profiles
DROP TABLE IF EXISTS public.user_profiles;
```

### Reverter Código

```bash
# Voltar para commit anterior
git revert HEAD
git push origin main

# Ou fazer deploy de branch específica
vercel --prod --git-branch main
```

---

## 📊 Passo 6: Monitoramento Contínuo

### Métricas Importantes

#### Supabase Dashboard

1. **Database > Query Performance**

   - Monitorar latência de `increment_scan_count`
   - Deve estar < 50ms P95

2. **Database > Table Stats**

   - Crescimento de `qrcodes.scan_count`
   - Crescimento de `user_profiles`

3. **Database > Logs**
   - Erros relacionados a RPC
   - Violações de RLS

#### Vercel Analytics

1. **Web Vitals**

   - Tempo de carregamento do dashboard
   - Deve estar < 1s LCP

2. **Function Logs**
   - Erros em `/{shortId}`
   - Taxa de erro < 0.1%

### Queries de Monitoramento

```sql
-- Executar diariamente

-- 1. Total de scans hoje
SELECT SUM(scan_count) as total_scans
FROM qrcodes
WHERE created_at >= CURRENT_DATE;

-- 2. Novos usuários hoje
SELECT COUNT(*) as new_users
FROM user_profiles
WHERE created_at >= CURRENT_DATE;

-- 3. Distribuição por tier
SELECT subscription_tier, COUNT(*) as count
FROM user_profiles
GROUP BY subscription_tier;

-- 4. QR Codes mais populares
SELECT short_id, original_url, scan_count
FROM qrcodes
ORDER BY scan_count DESC
LIMIT 10;

-- 5. Taxa de conversão (se tiver upgrades)
SELECT
  subscription_tier,
  COUNT(*) as users,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM user_profiles
GROUP BY subscription_tier;
```

### Alertas Sugeridos

Configure no Supabase ou via ferramenta externa:

1. **Erro Rate > 1%**: Alerta crítico
2. **Latência P95 > 500ms**: Investigar performance
3. **Novos usuários sem perfil**: Trigger quebrado
4. **Scans não incrementando**: Função RPC com problema

---

## 🎯 Próximos Deploys (Features Futuras)

### Deploy do Gatekeeping

1. Renomear `route.example.ts` para `route.ts`
2. Ajustar lógica conforme necessário
3. Testar localmente
4. Deploy

```bash
mv src/app/api/shorten/route.example.ts src/app/api/shorten/route.ts
# Editar e testar
git add .
git commit -m "feat: implementar gatekeeping de limites"
git push
```

### Deploy do Banner de Status

1. Renomear `PlanStatusBanner.example.tsx`
2. Integrar no dashboard
3. Testar responsividade
4. Deploy

```bash
mv src/app/dashboard/PlanStatusBanner.example.tsx src/app/dashboard/PlanStatusBanner.tsx
# Integrar em dashboard/page.tsx
```

---

## 🆘 Troubleshooting em Produção

### Problema: Scans não incrementam

**Debug:**

```sql
-- Testar função manualmente
SELECT increment_scan_count('abc12345');
```

**Soluções:**

1. Verificar se `SUPABASE_SERVICE_ROLE_KEY` está configurada
2. Recriar função RPC
3. Verificar logs do Supabase

### Problema: Novos usuários sem perfil

**Debug:**

```sql
-- Verificar se trigger está ativo
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

**Soluções:**

1. Recriar trigger
2. Popular perfis manualmente (query na migration)
3. Verificar logs de erros

### Problema: Erro 500 no redirect

**Debug:**

```bash
# Verificar logs
vercel logs --prod | grep "shortId"
```

**Soluções:**

1. Verificar variáveis de ambiente
2. Testar função RPC no SQL Editor
3. Verificar se short_id existe no banco

### Problema: RLS bloqueando operações

**Debug:**

```sql
-- Verificar policies
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

**Soluções:**

1. Verificar se função usa `SECURITY DEFINER`
2. Recriar policies
3. Temporariamente desabilitar RLS (apenas debug!)

---

## ✅ Checklist Final Pós-Deploy

- [ ] Migration aplicada sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado com sucesso
- [ ] Tracking de scans funcionando
- [ ] Novos usuários recebem perfil 'free'
- [ ] Dashboard exibe contadores
- [ ] Performance aceitável (latência < 500ms)
- [ ] Logs sem erros críticos
- [ ] Alertas configurados
- [ ] Documentação atualizada

---

## 📞 Contatos e Recursos

### Documentação

- **Supabase**: https://supabase.com/docs
- **Next.js**: https://nextjs.org/docs
- **Vercel**: https://vercel.com/docs

### Suporte

- **Supabase Discord**: https://discord.supabase.com
- **Stack Overflow**: Tag `supabase` ou `next.js`

### Monitoramento

- **Supabase Dashboard**: https://app.supabase.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Sentry** (opcional): Integrar para error tracking

---

**Deploy realizado com sucesso! 🎉**

Lembre-se de monitorar as métricas nas primeiras 24-48h após o deploy.
