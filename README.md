# ScanQR - Gerador de QR Codes Dinâmicos

SaaS de geração e gerenciamento de QR Codes com modelo de negócio Freemium.

## 🚀 Funcionalidades

### ✅ Implementadas

- **Geração de QR Codes** - Crie QR Codes dinâmicos com URLs curtas
- **Edição de URLs** - Altere o destino sem mudar o QR Code
- **Dashboard Personalizado** - Gerencie todos os seus QR Codes
- **Analytics de Scans** - Acompanhe o número de acessos em tempo real
- **Sistema de Tiers** - Planos Free, Pro e Enterprise
- **Autenticação** - Login seguro via Supabase Auth

### 🎯 Modelo Freemium

| Plano          | QR Codes  | Scans/Mês | Analytics | Suporte     |
| -------------- | --------- | --------- | --------- | ----------- |
| **Free**       | 10        | 1.000     | Básico    | Comunidade  |
| **Pro**        | 100       | 50.000    | Avançado  | Email       |
| **Enterprise** | Ilimitado | Ilimitado | Premium   | Prioritário |

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Hospedagem**: Vercel
- **Geração de QR**: qrcode, react-qrcode-logo

## 📦 Instalação

```bash
# Clonar repositório
git clone https://github.com/rafael-arantes/scanqr.git
cd scanqr

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Rodar servidor de desenvolvimento
npm run dev
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Banco de Dados

Aplique a migration para configurar a infraestrutura:

```bash
# Via Supabase CLI
supabase db push

# Ou via SQL Editor no Dashboard do Supabase
# Cole o conteúdo de: supabase/migrations/001_add_monetization_infrastructure.sql
```

Veja instruções completas em: [`DEPLOY_GUIDE.md`](./DEPLOY_GUIDE.md)

## 📚 Documentação

- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Resumo executivo da implementação
- **[MONETIZATION_IMPLEMENTATION.md](./MONETIZATION_IMPLEMENTATION.md)** - Documentação técnica detalhada
- **[DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)** - Guia passo a passo de deploy
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Roteiro completo de testes
- **[BUSINESS_ANALYTICS_QUERIES.sql](./BUSINESS_ANALYTICS_QUERIES.sql)** - Queries para análise de negócio

## 🧪 Testes

```bash
# Build de produção
npm run build

# Verificar tipos TypeScript
npm run type-check  # ou: tsc --noEmit

# Rodar em modo produção localmente
npm run start
```

Veja testes detalhados em: [`TESTING_GUIDE.md`](./TESTING_GUIDE.md)

## 📊 Analytics e Monitoramento

O sistema rastreia automaticamente:

- **Scans por QR Code** - Cada acesso é contabilizado
- **Usuários por Tier** - Distribuição entre planos
- **Taxa de Conversão** - Free → Paid

Execute queries de análise:

```bash
# Abra o SQL Editor no Supabase
# Cole queries de: BUSINESS_ANALYTICS_QUERIES.sql
```

## 🎨 Estrutura do Projeto

```
scanqr/
├── src/
│   ├── app/
│   │   ├── [shortId]/          # Redirecionamento e tracking
│   │   ├── api/
│   │   │   ├── qrcodes/        # CRUD de QR Codes
│   │   │   └── shorten/        # Criação de URLs curtas
│   │   ├── dashboard/          # Painel do usuário
│   │   └── login/              # Autenticação
│   ├── components/             # Componentes reutilizáveis
│   └── lib/
│       ├── supabaseClient.ts   # Cliente Supabase
│       └── subscriptionTiers.ts # Sistema de planos
├── supabase/
│   └── migrations/             # Migrations SQL
└── public/                     # Arquivos estáticos
```

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Via CLI
vercel --prod

# Ou via Git
git push origin main  # Deploy automático
```

### Configurar Variáveis no Vercel

```bash
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

Veja guia completo: [`DEPLOY_GUIDE.md`](./DEPLOY_GUIDE.md)

## 🔐 Segurança

- ✅ Row Level Security (RLS) habilitado no Supabase
- ✅ Service Role Key protegida (server-side only)
- ✅ Autenticação via JWT
- ✅ HTTPS obrigatório em produção

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Vercel](https://vercel.com)
- [shadcn/ui](https://ui.shadcn.com)

---

**Desenvolvido com ❤️ usando Next.js e Supabase**
