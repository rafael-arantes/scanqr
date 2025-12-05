import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Image src="/scan-qr-svg.svg" alt="ScanQR" width={237} height={56} className="h-14 w-auto" priority />
            </Link>
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-blue-500/10 p-8 md:p-12 border border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Política de privacidade e proteção de dados
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Última atualização: 05 de dezembro de 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Controlador de dados</h2>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Razão Social:</strong> VERTIO SOLUÇÕES DIGITAIS
                  <br />
                  <strong>CNPJ:</strong> 60.183.975/0001-24
                  <br />
                  <strong>Nome fantasia:</strong> VERTIO
                  <br />
                  <strong>E-mail DPO (Encarregado de Dados):</strong> dpo@vertio.com.br
                  <br />
                  <strong>E-mail Geral:</strong> privacidade@scanqr.com.br
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Introdução e compromisso</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                A VERTIO SOLUÇÕES DIGITAIS (&quot;VERTIO&quot;, &quot;nós&quot; ou &quot;nosso&quot;), controladora da
                plataforma ScanQR, está comprometida com a proteção da privacidade e segurança dos dados pessoais de seus
                Usuários. Esta Política de Privacidade descreve detalhadamente como coletamos, usamos, armazenamos,
                compartilhamos e protegemos suas informações em conformidade com a Lei Geral de Proteção de Dados (Lei nº
                13.709/2018 - LGPD) e demais legislações aplicáveis.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Ao utilizar a Plataforma ScanQR, você declara ter lido, compreendido e concordado integralmente com esta
                Política de Privacidade e com nossos Termos de Uso.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Definições</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">Para fins desta Política:</p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Dados Pessoais:</strong> Informação relacionada a pessoa natural identificada ou identificável
                </li>
                <li>
                  <strong>Titular:</strong> Pessoa natural a quem se referem os dados pessoais
                </li>
                <li>
                  <strong>Controlador:</strong> VERTIO SOLUÇÕES DIGITAIS, responsável pelas decisões sobre tratamento de dados
                </li>
                <li>
                  <strong>Tratamento:</strong> Toda operação com dados pessoais (coleta, armazenamento, processamento,
                  exclusão, etc.)
                </li>
                <li>
                  <strong>Anonimização:</strong> Processo que torna dados irreversivelmente não identificáveis
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Dados pessoais coletados</h2>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                3.1 Dados Fornecidos Diretamente pelo Titular
              </h3>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Identificação e Contato:</strong> Endereço de e-mail, nome de exibição (opcional), foto de perfil
                  (opcional)
                </li>
                <li>
                  <strong>Dados de Pagamento:</strong> Nome completo, CPF/CNPJ, endereço de cobrança (processados via Stripe -
                  não armazenamos dados de cartão de crédito)
                </li>
                <li>
                  <strong>Conteúdo Criado:</strong> URLs originais, URLs encurtadas, configurações de QR Codes, nomes
                  personalizados, domínios customizados
                </li>
                <li>
                  <strong>Comunicações:</strong> Mensagens enviadas através de formulários de contato ou e-mails de suporte
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                3.2 Dados Coletados Automaticamente
              </h3>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Dados de Navegação:</strong> Endereço IP, tipo e versão do navegador, sistema operacional, resolução
                  de tela, idioma preferido
                </li>
                <li>
                  <strong>Dados de Uso:</strong> Páginas visitadas, tempo de permanência, origem de acesso (referrer), horários
                  de acesso
                </li>
                <li>
                  <strong>Analytics de QR Codes:</strong> Número de scans, timestamps, localização geográfica aproximada (via
                  IP - nível de cidade/estado), dispositivos utilizados
                </li>
                <li>
                  <strong>Cookies e Identificadores:</strong> Tokens de sessão, preferências de interface, cookies de
                  autenticação
                </li>
                <li>
                  <strong>Logs de Sistema:</strong> Registros de acessos, tentativas de login, ações administrativas, erros e
                  exceções
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                3.3 Dados Sensíveis - Não Coletados
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                A VERTIO <strong>NÃO coleta</strong> dados pessoais sensíveis conforme definidos na LGPD (origem racial/étnica,
                convicções religiosas, opiniões políticas, dados genéticos/biométricos, dados de saúde, vida sexual, etc.)
                salvo em casos específicos mediante consentimento expresso e justificativa legal.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Finalidades e bases legais</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                O tratamento de dados pessoais ocorre exclusivamente para as seguintes finalidades, fundamentadas nas bases
                legais da LGPD:
              </p>

              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border border-slate-300 dark:border-slate-600">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-700">
                      <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left">Finalidade</th>
                      <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left">
                        Base Legal (Art. 7º LGPD)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Criação e gestão de conta de usuário
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Execução de contrato (inciso V)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Processamento de pagamentos e cobrança
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Execução de contrato (inciso V)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Fornecimento de funcionalidades da Plataforma
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Execução de contrato (inciso V)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Envio de comunicações transacionais (confirmações, alertas)
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Execução de contrato (inciso V)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Análise de métricas e estatísticas agregadas
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Legítimo interesse (inciso IX)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Melhoria e desenvolvimento de funcionalidades
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Legítimo interesse (inciso IX)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Prevenção de fraudes e segurança da informação
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Legítimo interesse (inciso IX)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Cumprimento de obrigações legais e regulatórias
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">Obrigação legal (inciso II)</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Exercício regular de direitos em processos
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Exercício regular de direitos (inciso VI)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Envio de comunicações de marketing (opcional)
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">Consentimento (inciso I)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Compartilhamento de dados</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                A VERTIO <strong>NÃO vende, aluga ou comercializa</strong> dados pessoais. Compartilhamos informações apenas
                nas seguintes hipóteses:
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                5.1 Prestadores de Serviços (Operadores)
              </h3>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Stripe:</strong> Processamento de pagamentos (PCI-DSS Level 1 compliant)
                </li>
                <li>
                  <strong>Supabase:</strong> Banco de dados e autenticação (SOC 2 Type II certified)
                </li>
                <li>
                  <strong>Vercel:</strong> Hospedagem e infraestrutura (ISO 27001 certified)
                </li>
                <li>
                  <strong>Google Cloud / AWS:</strong> Armazenamento e CDN (compliance GDPR/LGPD)
                </li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Todos os operadores são selecionados criteriosamente e vinculados por contratos que garantem conformidade com a
                LGPD, implementação de medidas de segurança adequadas e tratamento de dados exclusivamente conforme nossas
                instruções.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                5.2 Obrigações Legais e Regulatórias
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Podemos divulgar dados pessoais quando exigido por lei, ordem judicial, CPI, requisição de autoridades
                competentes (Polícia Federal, Receita Federal, ANPD, etc.) ou para cumprir processos legais.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">5.3 Proteção de Direitos</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Em casos de investigação de fraudes, violações dos Termos de Uso, ameaças à segurança da Plataforma ou proteção
                de direitos da VERTIO, de outros usuários ou do público.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">5.4 Fusões e Aquisições</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Em caso de fusão, aquisição, reorganização societária ou venda de ativos, seus dados podem ser transferidos.
                Você será notificado previamente e terá direito de solicitar exclusão caso não concorde.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Segurança da informação</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Implementamos medidas técnicas, administrativas e organizacionais robustas para proteger dados pessoais contra
                acessos não autorizados, destruição, perda, alteração, comunicação ou qualquer forma de tratamento inadequado:
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">6.1 Medidas Técnicas</h3>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Criptografia:</strong> TLS 1.3 para dados em trânsito, AES-256 para dados sensíveis em repouso
                </li>
                <li>
                  <strong>Autenticação:</strong> Magic links (passwordless), Multi-Factor Authentication (MFA) opcional, OAuth
                  2.0
                </li>
                <li>
                  <strong>Autorização:</strong> Row Level Security (RLS) no banco de dados, princípio do menor privilégio
                  (POLP)
                </li>
                <li>
                  <strong>Firewall e WAF:</strong> Proteção contra ataques DDoS, SQL injection, XSS
                </li>
                <li>
                  <strong>Monitoramento:</strong> Logs de auditoria detalhados, alertas de segurança em tempo real
                </li>
                <li>
                  <strong>Testes:</strong> Penetration testing periódico, análise de vulnerabilidades (SAST/DAST)
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">6.2 Medidas Organizacionais</h3>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Política de Segurança:</strong> Documentação formal de processos e controles
                </li>
                <li>
                  <strong>Treinamento:</strong> Capacitação contínua da equipe em segurança e privacidade
                </li>
                <li>
                  <strong>Controle de Acesso:</strong> Segregação de ambientes, revisão periódica de permissões
                </li>
                <li>
                  <strong>Backup e Recuperação:</strong> Backups diários criptografados, plano de continuidade de negócios
                  (BCP)
                </li>
                <li>
                  <strong>Plano de Resposta a Incidentes:</strong> Procedimentos documentados para violações de dados
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">6.3 Comunicação de Incidentes</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos Titulares, a VERTIO
                notificará:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Autoridade Nacional (ANPD):</strong> Em prazo razoável (até 72 horas quando possível), conforme art.
                  48 da LGPD
                </li>
                <li>
                  <strong>Titulares Afetados:</strong> Via e-mail cadastrado, com descrição do incidente, dados afetados e
                  medidas adotadas
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Retenção e eliminação de dados</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Retemos dados pessoais apenas pelo período necessário para cumprir as finalidades descritas, observados os
                prazos legais e regulatórios:
              </p>

              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border border-slate-300 dark:border-slate-600">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-700">
                      <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left">Categoria de Dados</th>
                      <th className="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left">Prazo de Retenção</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Dados de cadastro (conta ativa)
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">Durante vigência da conta</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Dados após cancelamento voluntário
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        30 dias (recuperação de conta)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">Dados fiscais e de pagamento</td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        5 anos (Código Tributário Nacional)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">Logs de acesso e auditoria</td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        6 meses (Marco Civil da Internet)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Dados de analytics (anonimizados)
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Indefinido (não identificáveis)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Dados relacionados a litígios
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-2">
                        Até conclusão + prazos prescricionais
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Após os prazos de retenção, os dados são eliminados de forma segura e irreversível ou anonimizados para fins
                estatísticos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Direitos dos Titulares (LGPD)</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Conforme Art. 18 da LGPD, você possui os seguintes direitos em relação aos seus dados pessoais:
              </p>

              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-3 mb-4">
                <li>
                  <strong>I - Confirmação e Acesso:</strong> Confirmar a existência de tratamento e acessar seus dados (formato
                  simplificado ou integral)
                </li>
                <li>
                  <strong>II - Correção:</strong> Solicitar correção de dados incompletos, inexatos ou desatualizados
                </li>
                <li>
                  <strong>III - Anonimização, Bloqueio ou Eliminação:</strong> Requerer anonimização de dados desnecessários,
                  bloqueio ou eliminação de dados excessivos ou tratados em desconformidade
                </li>
                <li>
                  <strong>IV - Portabilidade:</strong> Receber dados em formato estruturado e interoperável (JSON, CSV)
                </li>
                <li>
                  <strong>V - Exclusão:</strong> Solicitar eliminação de dados tratados com consentimento (salvo hipóteses de
                  retenção legal)
                </li>
                <li>
                  <strong>VI - Informação sobre Compartilhamento:</strong> Obter informações sobre entidades públicas e
                  privadas com as quais compartilhamos dados
                </li>
                <li>
                  <strong>VII - Informação sobre Não Fornecimento de Consentimento:</strong> Ser informado sobre consequências
                  da não concessão de consentimento
                </li>
                <li>
                  <strong>VIII - Revogação do Consentimento:</strong> Revogar consentimento a qualquer momento (quando
                  aplicável)
                </li>
                <li>
                  <strong>IX - Oposição:</strong> Opor-se a tratamento realizado sem consentimento, em casos específicos
                </li>
                <li>
                  <strong>X - Revisão de Decisões Automatizadas:</strong> Solicitar revisão de decisões tomadas unicamente com
                  base em tratamento automatizado
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">8.1 Como Exercer seus Direitos</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">Para exercer qualquer dos direitos acima, você pode:</p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  Enviar e-mail para: <strong>dpo@vertio.com.br</strong> ou <strong>privacidade@scanqr.com.br</strong>
                </li>
                <li>Acessar configurações da conta no painel de controle (para correção e exclusão direta)</li>
                <li>
                  Especificar claramente qual direito deseja exercer e fornecer informações suficientes para validação de
                  identidade
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">8.2 Prazos de Resposta</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Responderemos às solicitações em até <strong>15 dias</strong>, podendo ser prorrogado por mais 15 dias mediante
                justificativa. Em caso de impossibilidade de atendimento imediato, informaremos os motivos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Cookies e tecnologias similares</h2>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">9.1 Tipos de Cookies Utilizados</h3>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Cookies Estritamente Necessários:</strong> Essenciais para funcionamento da Plataforma (autenticação,
                  sessão). Não podem ser desativados.
                </li>
                <li>
                  <strong>Cookies de Funcionalidade:</strong> Lembram preferências do usuário (idioma, tema, configurações).
                  Melhoram experiência.
                </li>
                <li>
                  <strong>Cookies de Performance/Analytics:</strong> Coletam informações anônimas sobre uso da Plataforma para
                  melhorias. Podem ser desativados.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">9.2 Gerenciamento de Cookies</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Você pode configurar seu navegador para bloquear cookies, porém isso pode afetar funcionalidades da Plataforma.
                Consulte as instruções do seu navegador para gerenciar cookies.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">9.3 Outras Tecnologias</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Utilizamos também <strong>localStorage</strong>, <strong>sessionStorage</strong> e <strong>tokens JWT</strong>{' '}
                para autenticação e armazenamento temporário de configurações.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                10. Transferência internacional de dados
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Alguns de nossos prestadores de serviços (Stripe, Vercel, Supabase) operam infraestrutura em países fora do
                Brasil, incluindo Estados Unidos e União Europeia. Tais transferências ocorrem com garantias adequadas:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Cláusulas Contratuais Padrão (SCCs):</strong> Aprovadas pela Comissão Europeia e reconhecidas pela
                  ANPD
                </li>
                <li>
                  <strong>Certificações:</strong> ISO 27001, SOC 2 Type II, GDPR compliance
                </li>
                <li>
                  <strong>Adequação de Legislação:</strong> Países com nível adequado de proteção reconhecido
                </li>
                <li>
                  <strong>Consentimento Específico:</strong> Quando necessário, obtido de forma destacada
                </li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Para mais informações sobre salvaguardas específicas, entre em contato com nosso DPO.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                11. Privacidade de crianças e adolescentes
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                A Plataforma ScanQR <strong>não é direcionada a menores de 18 anos</strong>. Não coletamos intencionalmente
                dados de crianças ou adolescentes sem consentimento dos pais ou responsáveis legais.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Caso tomemos conhecimento de coleta inadvertida de dados de menores, procederemos à exclusão imediata. Pais ou
                responsáveis que identifiquem tal situação devem contatar: <strong>dpo@vertio.com.br</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">12. Alterações a esta política</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                A VERTIO reserva-se o direito de modificar esta Política de Privacidade a qualquer momento, refletindo
                alterações em práticas de tratamento, legislação ou serviços oferecidos.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>Notificação de Alterações:</strong>
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Alterações Substanciais:</strong> Notificação por e-mail com <strong>30 dias de antecedência</strong>
                  , destacando principais mudanças
                </li>
                <li>
                  <strong>Alterações Não Substanciais:</strong> Atualização da data de &quot;Última atualização&quot; e aviso
                  na Plataforma
                </li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                O uso continuado da Plataforma após modificações constitui aceitação tácita. Caso não concorde, você deve
                cessar o uso e solicitar exclusão da conta.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                13. Encarregado de proteção de dados (DPO)
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Em conformidade com o Art. 41 da LGPD, a VERTIO designou Encarregado de Proteção de Dados (Data Protection
                Officer - DPO) como canal de comunicação entre o controlador, titulares e a ANPD.
              </p>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 mb-4">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Contato do DPO:</strong>
                  <br />
                  E-mail: <strong>dpo@vertio.com.br</strong>
                  <br />
                  Prazo de Resposta: Até 15 dias úteis
                  <br />
                  Horário de Atendimento: Segunda a sexta, 9h às 18h (horário de Brasília)
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">14. Base legal para tratamento</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Conforme exigido pelo Art. 9º da LGPD, sempre que tratarmos seus dados pessoais, indicaremos claramente a base
                legal aplicável. As principais bases utilizadas estão descritas na Seção 4 desta Política.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">15. Reclamações e recursos</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Caso não fique satisfeito com a resposta às suas solicitações ou tenha preocupações sobre nossas práticas de
                privacidade, você pode:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Escalar Internamente:</strong> Contatar nosso DPO para revisão da decisão
                </li>
                <li>
                  <strong>Registrar Reclamação na ANPD:</strong> Autoridade Nacional de Proteção de Dados -{' '}
                  <a
                    href="https://www.gov.br/anpd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    www.gov.br/anpd
                  </a>
                </li>
                <li>
                  <strong>Buscar Tutela Judicial:</strong> Conforme Art. 22 da LGPD
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">16. Legislação e foro</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Esta Política é regida pela legislação brasileira, em especial pela Lei nº 13.709/2018 (LGPD), Lei nº
                12.965/2014 (Marco Civil da Internet) e Decreto nº 8.771/2016.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias decorrentes desta Política,
                com renúncia expressa a qualquer outro.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">17. Informações de contato</h2>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>VERTIO SOLUÇÕES DIGITAIS</strong>
                  <br />
                  CNPJ: 60.183.975/0001-24
                  <br />
                  <br />
                  <strong>Privacidade e Proteção de Dados:</strong>
                  <br />
                  E-mail DPO: dpo@vertio.com.br
                  <br />
                  E-mail Geral: privacidade@scanqr.com.br
                  <br />
                  <br />
                  <strong>Suporte Técnico:</strong>
                  <br />
                  E-mail: suporte@scanqr.com.br
                  <br />
                  <br />
                  <strong>Contato Comercial:</strong>
                  <br />
                  E-mail: contato@vertio.com.br
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">18. Disposições finais</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Esta Política de Privacidade complementa os Termos de Uso da Plataforma ScanQR. Em caso de conflito, prevalecem
                as disposições mais protetivas aos direitos dos Titulares.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                A invalidade de qualquer cláusula não prejudica a validade das demais. Versão em português prevalece sobre
                traduções.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>Data de vigência:</strong> 05 de dezembro de 2025
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link href="/termos">
                <Button variant="outline">Ver Termos de Uso</Button>
              </Link>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Continuar para Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
