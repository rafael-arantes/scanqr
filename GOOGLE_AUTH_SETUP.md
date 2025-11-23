# Configuração Google OAuth - ScanQR

## Passo 1: Configurar no Google Cloud Console

### 1.1 Criar Projeto (se não tiver)

1. Acesse: https://console.cloud.google.com/
2. Clique em "Select a project" → "New Project"
3. Nome: `ScanQR` (ou o que preferir)
4. Clique em "Create"

### 1.2 Configurar OAuth Consent Screen

1. No menu lateral, vá em: **APIs & Services** → **OAuth consent screen**
2. Escolha **External** (permite qualquer usuário com conta Google)
3. Clique em "Create"

**App information:**

- **App name**: `ScanQR`
- **User support email**: seu e-mail
- **App logo**: (opcional) faça upload do logo do app
- **Application home page**: `https://www.scanqr.com.br`
- **Application privacy policy**: `https://www.scanqr.com.br/privacidade`
- **Application terms of service**: `https://www.scanqr.com.br/termos`
- **Authorized domains**:
  - `scanqr.com.br`
  - `vercel.app` (se usar Vercel)
- **Developer contact information**: seu e-mail

4. Clique em "Save and Continue"

**Scopes:**

- Clique em "Add or Remove Scopes"
- Selecione apenas:
  - `.../auth/userinfo.email` (ver seu endereço de e-mail)
  - `.../auth/userinfo.profile` (ver suas informações pessoais)
  - `openid`
- Clique em "Update" → "Save and Continue"

**Test users:** (opcional durante desenvolvimento)

- Adicione seus e-mails de teste
- Clique em "Save and Continue"

5. Review: Clique em "Back to Dashboard"

### 1.3 Criar Credenciais OAuth

1. No menu lateral: **APIs & Services** → **Credentials**
2. Clique em "+ Create Credentials" → "OAuth client ID"
3. **Application type**: `Web application`
4. **Name**: `ScanQR Web Client`

**Authorized JavaScript origins:**

```
http://localhost:3000
https://www.scanqr.com.br
https://staging.scanqr.com.br
```

**Authorized redirect URIs:**

```
http://localhost:3000/auth/callback
https://www.scanqr.com.br/auth/callback
https://staging.scanqr.com.br/auth/callback
https://smycbnurpyigvyenmuml.supabase.co/auth/v1/callback
```

> ⚠️ **IMPORTANTE**: Substitua `<seu-projeto-id>` pelo ID real do seu projeto Supabase.
> Você encontra em: Supabase Dashboard → Settings → API → Project URL

5. Clique em "Create"
6. **Copie e salve**:
   - **Client ID** (começa com algo como `123456789-xxx.apps.googleusercontent.com`)
   - **Client Secret** (string aleatória)

## Passo 2: Configurar no Supabase

### 2.1 Adicionar Provider

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Authentication** → **Providers**
4. Encontre **Google** e clique em "Enable"

### 2.2 Adicionar Credenciais

- **Client ID (for OAuth)**: Cole o Client ID do Google Cloud Console
- **Client Secret (for OAuth)**: Cole o Client Secret do Google Cloud Console
- **Redirect URL**: Copie a URL que aparece (você já adicionou no Google Cloud Console no passo 1.3)

5. Clique em "Save"

## Passo 3: Configurar Variáveis de Ambiente (Opcional)

Se quiser usar variáveis de ambiente no código (não é necessário, o Supabase já gerencia):

```env
# .env.local (desenvolvimento)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

## Passo 4: Testar

### 4.1 Teste Local

1. Inicie o servidor: `npm run dev`
2. Acesse: http://localhost:3000/login
3. Clique em "Continuar com Google"
4. Faça login com sua conta Google
5. Você deve ser redirecionado para `/dashboard`

### 4.2 Verificar Perfil Criado

No Supabase:

1. Vá em: **Authentication** → **Users**
2. Você deve ver um novo usuário com:

   - Email do Google
   - Provider: `google`
   - Avatar URL preenchido

3. Vá em: **Table Editor** → `user_profiles`
4. Deve ter um registro com:
   - `id` = ID do usuário
   - `display_name` = Nome do Google (se configurado no trigger)
   - `avatar_url` = URL da foto do Google (se configurado no trigger)

## Passo 5: Publicar App (Produção)

Durante o desenvolvimento, o app fica em "Testing" mode. Para produção:

### 5.1 Verificação do Google (Opcional mas Recomendado)

Se quiser remover a tela de aviso "This app isn't verified":

1. Google Cloud Console → OAuth consent screen
2. Clique em "Publish App"
3. Leia os requisitos de verificação
4. Se seu app usa apenas escopos básicos (email, profile), pode publicar direto
5. Se precisar de verificação completa, siga: https://support.google.com/cloud/answer/9110914

**Nota**: Para apps simples como o ScanQR (só pede email e nome), a verificação não é obrigatória.
Usuários verão uma tela extra dizendo "Google hasn't verified this app" mas podem continuar.

### 5.2 Atualizar Status

1. OAuth consent screen → Status
2. Mude de "Testing" para "In production"

## Troubleshooting

### Erro: "redirect_uri_mismatch"

**Causa**: A URL de redirect não está autorizada no Google Cloud Console.

**Solução**:

1. Verifique a URL exata na barra de endereço do erro
2. Adicione ela em "Authorized redirect URIs" no Google Cloud Console
3. Aguarde alguns minutos para propagar

### Erro: "access_denied"

**Causa**: Usuário clicou em "Cancelar" ou não está na lista de test users (em modo Testing).

**Solução**:

- Se em Testing mode: adicione o e-mail em "Test users"
- Ou publique o app (mudando para "In production")

### Usuário loga mas perfil não é criado

**Causa**: Trigger `on_auth_user_created` pode não estar criando perfil para OAuth.

**Solução**: Verifique a migration `001_add_monetization_infrastructure.sql`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Este trigger já pega `full_name`, `name` e `avatar_url` do metadata do Google automaticamente.

### Login funciona mas não redireciona

**Causa**: Callback route pode ter problema.

**Solução**: Verifique `/auth/callback/route.ts`:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

## Recursos Úteis

- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [OAuth Playground](https://developers.google.com/oauthplayground/) - testar scopes

## Checklist Final

- [ ] Projeto criado no Google Cloud Console
- [ ] OAuth consent screen configurado
- [ ] Client ID e Secret criados
- [ ] Redirect URIs adicionadas (localhost, produção, Supabase)
- [ ] Provider habilitado no Supabase
- [ ] Credenciais adicionadas no Supabase
- [ ] Teste local funcionando
- [ ] Perfil criado automaticamente no banco
- [ ] Deploy em staging testado
- [ ] (Opcional) App publicado no Google
- [ ] Deploy em produção funcionando
