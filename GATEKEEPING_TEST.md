# 🧪 Teste Rápido - Gatekeeping de Limites

## Objetivo

Validar que o sistema está bloqueando a criação de QR Codes quando o limite do plano é atingido.

## Pré-requisitos

- ✅ Migration aplicada no Supabase
- ✅ Aplicação rodando (`npm run dev`)
- ✅ Usuário logado (plano Free por padrão)

## Passo a Passo

### 1. Verificar Tier Atual

```sql
-- No Supabase SQL Editor
SELECT u.id, u.email, p.subscription_tier
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'seu-email@exemplo.com';
```

Resultado esperado: `subscription_tier = 'free'`

### 2. Verificar Quantos QR Codes Já Existem

```sql
-- Substituir [USER_ID] pelo ID do passo anterior
SELECT COUNT(*) as qr_count
FROM qrcodes
WHERE user_id = '[USER_ID]';
```

Anote o número. Plano Free permite **10 QR Codes no total**.

### 3. Criar QR Codes Até o Limite

1. Acesse http://localhost:3000
2. Marque a opção "Encurtar URL"
3. Cole uma URL (ex: https://google.com)
4. Clique em "Gerar QR Code"
5. Repita até criar 10 QR Codes no total

**Observação:** A cada criação, verifique o console do browser (F12 > Console).
Você verá mensagens como:

```
📊 Uso: 8 QR Codes no plano free
📊 Uso: 9 QR Codes no plano free
📊 Uso: 10 QR Codes no plano free
```

### 4. Testar o Bloqueio (11º QR Code)

1. Tente criar mais um QR Code
2. Você deve ver um **popup de confirmação** com a mensagem:

   ```
   Você atingiu o limite de 10 QR Codes do plano FREE.
   Faça upgrade para criar mais!

   Deseja fazer upgrade para criar mais QR Codes?
   ```

3. Se clicar "OK", será redirecionado para `/upgrade` (página ainda não criada)
4. Se clicar "Cancelar", o popup fecha

### 5. Validar no Backend

```sql
-- Verificar que não foi criado o 11º QR Code
SELECT COUNT(*) as qr_count
FROM qrcodes
WHERE user_id = '[USER_ID]';
```

Resultado esperado: **10** (não deve ter criado o 11º)

### 6. Verificar Logs da API

No terminal onde está rodando `npm run dev`, você deve ver:

```
Erro ao buscar perfil do usuário: [se houver algum erro]
```

Ou nenhum erro se tudo funcionou corretamente.

### 7. Testar com Upgrade Manual (Simulação)

Agora vamos simular que o usuário fez upgrade para Pro:

```sql
-- Atualizar tier para 'pro'
UPDATE user_profiles
SET subscription_tier = 'pro'
WHERE id = '[USER_ID]';
```

Depois:

1. Recarregue a página inicial
2. Tente criar mais QR Codes
3. Agora deve permitir até **100 QR Codes**

### 8. Testar Mensagens de Aviso

Volte para plano Free e delete alguns QR Codes:

```sql
-- Voltar para free
UPDATE user_profiles
SET subscription_tier = 'free'
WHERE id = '[USER_ID]';

-- Deletar alguns para testar avisos (deixar 8)
DELETE FROM qrcodes
WHERE user_id = '[USER_ID]'
AND id IN (
  SELECT id FROM qrcodes
  WHERE user_id = '[USER_ID]'
  ORDER BY created_at DESC
  LIMIT 2
);
```

Agora, ao criar QR Codes, você verá no console:

- Com 8 QR Codes: `"Atenção: Restam apenas 2 QR Code(s) disponíveis no seu plano."`
- Com 9 QR Codes: `"Atenção: Restam apenas 1 QR Code(s) disponíveis no seu plano."`
- Com 10 QR Codes: Bloqueio total

## ✅ Checklist de Validação

- [ ] Usuário free pode criar até 10 QR Codes
- [ ] Ao tentar criar o 11º, recebe erro 403
- [ ] Mensagem de erro é amigável e sugere upgrade
- [ ] Console mostra uso atual após cada criação
- [ ] Backend não permite criar além do limite
- [ ] Contador do dashboard está correto
- [ ] Upgrade manual para 'pro' permite criar mais
- [ ] Mensagens de aviso aparecem quando próximo do limite

## 🐛 Troubleshooting

### Erro: "Cannot read property 'subscription_tier'"

**Solução:** Perfil não foi criado. Execute:

```sql
INSERT INTO user_profiles (id, subscription_tier)
SELECT id, 'free'
FROM auth.users
WHERE id = '[USER_ID]'
ON CONFLICT DO NOTHING;
```

### Gatekeeping não funciona

**Debug:**

1. Verifique que o import está correto no `route.ts`
2. Console do servidor deve mostrar erros
3. Teste a função diretamente:
   ```typescript
   import { canCreateQrCode } from '@/lib/subscriptionTiers';
   console.log(canCreateQrCode('free', 10)); // deve ser false
   ```

### Redirect para /upgrade dá 404

**Esperado!** A página de upgrade ainda não foi criada.
Por enquanto, é normal dar 404. Você pode:

- Clicar "Cancelar" no popup
- Ou criar uma página básica em `src/app/upgrade/page.tsx`

## 📊 Resultado Esperado

Ao final deste teste:

- ✅ Gatekeeping funcionando
- ✅ Limites sendo respeitados
- ✅ Mensagens amigáveis ao usuário
- ✅ Backend protegido contra bypass

## Próximo Passo

Marcar item como completo no checklist:

```
- [x] Gatekeeping de limites implementado
```
