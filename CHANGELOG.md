# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [0.2.0] - 2025-11-19

### ✨ Adicionado

#### Infraestrutura de Monetização

- Sistema de tiers de assinatura (Free, Pro, Enterprise)
- Tabela `user_profiles` com campo `subscription_tier`
- Trigger automático para criar perfil 'free' em novos usuários
- Biblioteca de helpers `subscriptionTiers.ts` para gerenciar limites e permissões
- Tipos TypeScript para `SubscriptionTier` e `UserProfile`

#### Analytics de Scans

- Coluna `scan_count` na tabela `qrcodes`
- Tracking automático de scans a cada redirecionamento
- Função RPC `increment_scan_count()` otimizada para performance
- Incremento atômico via PostgreSQL (1 query)
- Suporte para tracking de acessos anônimos (sem autenticação)

#### Interface de Dashboard

- Coluna "Scans" na tabela desktop de QR Codes
- Badge de scans nos cards mobile
- Formatação de números em português (ex: "1.234 cliques")
- Tipo `QRCodeType` atualizado para incluir `scan_count`

#### Documentação

- `IMPLEMENTATION_SUMMARY.md` - Resumo executivo completo
- `MONETIZATION_IMPLEMENTATION.md` - Documentação técnica detalhada
- `DEPLOY_GUIDE.md` - Guia passo a passo de deploy em produção
- `TESTING_GUIDE.md` - Roteiro completo de testes e validação
- `BUSINESS_ANALYTICS_QUERIES.sql` - 50+ queries para análise de negócio
- `.env.example` - Modelo de configuração de variáveis de ambiente
- `README.md` atualizado com nova estrutura e funcionalidades

#### Exemplos e Templates

- `src/app/api/shorten/route.example.ts` - Implementação de gatekeeping
- `src/app/dashboard/PlanStatusBanner.example.tsx` - Componente de UI para status do plano

#### Otimizações de Banco de Dados

- Índice `idx_qrcodes_scan_count` para ordenação por popularidade
- Índice `idx_qrcodes_user_created` para queries do dashboard
- Índice `idx_user_profiles_subscription_tier` para análises
- Row Level Security (RLS) na tabela `user_profiles`
- Policies de acesso restrito aos próprios dados

### 🔧 Modificado

#### Redirecionamento (src/app/[shortId]/page.tsx)

- Implementado tracking de scans via RPC
- Alterado de 2 queries para 1 (melhoria de performance)
- Mantida baixa latência (<50ms overhead)

#### Dashboard (src/app/dashboard/page.tsx)

- Query atualizada para incluir `scan_count`
- Suporte para exibição de métricas de engajamento

#### Lista de QR Codes (src/app/dashboard/QrCodeList.tsx)

- Tipo `QRCodeType` expandido com campo `scan_count`
- UI responsiva atualizada para desktop e mobile
- Formatação de números em português brasileiro

### 📊 Configurações

#### Limites por Tier

- **Free**: 10 QR Codes, 1.000 scans/mês
- **Pro**: 100 QR Codes, 50.000 scans/mês
- **Enterprise**: Ilimitado

#### Variáveis de Ambiente

- Adicionado `SUPABASE_SERVICE_ROLE_KEY` (obrigatória)
- Documentação completa em `.env.example`

### 🔐 Segurança

- Row Level Security habilitado em `user_profiles`
- Função RPC usa `SECURITY DEFINER` para permitir tracking público
- Service Role Key isolada no server-side
- Policies de acesso implementadas (usuários veem apenas seus dados)

### 📈 Métricas e Monitoramento

- 50+ queries SQL para análise de negócio
- Queries para identificar oportunidades de upgrade
- Análise de retenção e churned users
- Cálculo de MRR (Monthly Recurring Revenue)
- Identificação de power users

---

## [0.1.0] - 2025-11-XX (Versão Inicial)

### ✨ Adicionado

- Geração de QR Codes dinâmicos
- URLs curtas com nanoid
- Sistema de autenticação via Supabase
- Dashboard de gerenciamento
- Edição de URLs sem mudar QR Code
- Exclusão de QR Codes
- Download de QR Codes em alta resolução
- Interface responsiva (desktop e mobile)
- Componentes UI com shadcn/ui
- Integração com Supabase PostgreSQL

### 🛠️ Stack Inicial

- Next.js 14 com App Router
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database)
- React QRCode Logo

---

## [Unreleased] - Próximas Funcionalidades

### 🎯 Planejado

- [ ] Implementar gatekeeping (bloquear criação quando limite atingido)
- [ ] Adicionar banner de status do plano no dashboard
- [ ] Criar página `/upgrade` com comparativo de planos
- [ ] Integração com Stripe para pagamentos
- [ ] Analytics avançado com gráficos temporais
- [ ] Exportação de dados (CSV, Excel)
- [ ] Webhooks de scan para integrações
- [ ] API pública documentada
- [ ] Domínios customizados (plano Pro+)
- [ ] QR Codes com logos personalizados
- [ ] Dark mode
- [ ] Multi-idioma (i18n)

### 🔧 Melhorias Futuras

- [ ] Testes automatizados (Jest + Testing Library)
- [ ] CI/CD com GitHub Actions
- [ ] Monitoramento com Sentry
- [ ] Cache com Redis para high-traffic
- [ ] Rate limiting por tier
- [ ] Soft delete para QR Codes
- [ ] Histórico de edições
- [ ] Favoritos / Tags para organização

---

## Notas de Versão

### Versionamento

- **MAJOR**: Mudanças incompatíveis na API
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs

### Links

- [Repositório](https://github.com/rafael-arantes/scanqr)
- [Issues](https://github.com/rafael-arantes/scanqr/issues)
- [Pull Requests](https://github.com/rafael-arantes/scanqr/pulls)
