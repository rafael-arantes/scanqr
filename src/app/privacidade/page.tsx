import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ScanQR
              </span>
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
            <div className="w-14 h-14 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Política de Privacidade</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Última atualização: 23 de novembro de 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Introdução</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                O ScanQR (&quot;nós&quot;, &quot;nosso&quot; ou &quot;nos&quot;) está comprometido em proteger sua privacidade.
                Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando
                você usa nosso serviço.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Ao usar o ScanQR, você concorda com a coleta e uso de informações de acordo com esta política.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Informações que Coletamos</h2>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                2.1 Informações Fornecidas por Você
              </h3>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Conta:</strong> E-mail, nome de exibição (opcional)
                </li>
                <li>
                  <strong>Pagamento:</strong> Informações de cobrança processadas pela Stripe (não armazenamos dados de cartão)
                </li>
                <li>
                  <strong>Conteúdo:</strong> URLs encurtadas, configurações de QR Codes, domínios customizados
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                2.2 Informações Coletadas Automaticamente
              </h3>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Analytics:</strong> Número de scans de QR Codes, datas e horários de acesso
                </li>
                <li>
                  <strong>Logs:</strong> Endereço IP, tipo de navegador, páginas visitadas
                </li>
                <li>
                  <strong>Cookies:</strong> Cookies de sessão para manter você autenticado
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Como Usamos suas Informações</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">Utilizamos as informações coletadas para:</p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>Fornecer, operar e manter nosso Serviço</li>
                <li>Processar transações e gerenciar assinaturas</li>
                <li>Enviar e-mails transacionais (confirmações, atualizações de conta)</li>
                <li>Fornecer analytics e estatísticas sobre seus QR Codes</li>
                <li>Melhorar, personalizar e expandir nosso Serviço</li>
                <li>Detectar, prevenir e resolver problemas técnicos</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Compartilhamento de Informações</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas nas seguintes
                circunstâncias:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Prestadores de Serviços:</strong> Compartilhamos com terceiros que nos ajudam a operar o Serviço
                  (Stripe para pagamentos, Supabase para banco de dados, Vercel para hospedagem)
                </li>
                <li>
                  <strong>Requisitos Legais:</strong> Se exigido por lei ou em resposta a processos legais válidos
                </li>
                <li>
                  <strong>Proteção de Direitos:</strong> Para proteger os direitos, propriedade ou segurança do ScanQR, nossos
                  usuários ou o público
                </li>
                <li>
                  <strong>Transferência de Negócios:</strong> Em caso de fusão, aquisição ou venda de ativos
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Segurança dos Dados</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>Criptografia de dados em trânsito (HTTPS/SSL)</li>
                <li>Autenticação sem senha (magic links) via Supabase Auth</li>
                <li>Banco de dados protegido com Row Level Security (RLS)</li>
                <li>Processamento seguro de pagamentos via Stripe (PCI-DSS compliant)</li>
                <li>Backups regulares e recuperação de desastres</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                No entanto, nenhum método de transmissão pela Internet é 100% seguro. Embora nos esforcemos para proteger suas
                informações, não podemos garantir segurança absoluta.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Retenção de Dados</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Retemos suas informações pessoais apenas pelo tempo necessário para os fins estabelecidos nesta Política de
                Privacidade:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Contas Ativas:</strong> Enquanto sua conta estiver ativa
                </li>
                <li>
                  <strong>Após Cancelamento:</strong> Podemos reter certos dados por até 90 dias para recuperação de conta
                </li>
                <li>
                  <strong>Dados de Analytics:</strong> Agregados e anonimizados indefinidamente
                </li>
                <li>
                  <strong>Requisitos Legais:</strong> Conforme exigido por lei ou regulamentação
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Seus Direitos (LGPD)</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Acesso:</strong> Solicitar cópia dos dados que temos sobre você
                </li>
                <li>
                  <strong>Correção:</strong> Solicitar correção de dados incorretos ou incompletos
                </li>
                <li>
                  <strong>Exclusão:</strong> Solicitar exclusão de seus dados pessoais
                </li>
                <li>
                  <strong>Portabilidade:</strong> Solicitar seus dados em formato estruturado
                </li>
                <li>
                  <strong>Revogação de Consentimento:</strong> Retirar consentimento a qualquer momento
                </li>
                <li>
                  <strong>Oposição:</strong> Opor-se ao processamento de seus dados em certas circunstâncias
                </li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Para exercer esses direitos, entre em contato conosco através do e-mail fornecido na seção de contato.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Cookies e Tecnologias Similares</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">Usamos cookies e tecnologias similares para:</p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>
                  <strong>Cookies Essenciais:</strong> Manter você autenticado e lembrar suas preferências
                </li>
                <li>
                  <strong>Cookies de Analytics:</strong> Entender como você usa nosso Serviço (anonimizados)
                </li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade do Serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Transferências Internacionais</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Seus dados podem ser transferidos e mantidos em servidores localizados fora do Brasil, onde as leis de proteção
                de dados podem ser diferentes. Garantimos que tais transferências são realizadas com garantias adequadas de
                proteção.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">10. Privacidade de Crianças</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Nosso Serviço não é direcionado a menores de 18 anos. Não coletamos intencionalmente informações pessoais de
                crianças. Se você acredita que coletamos informações de uma criança, entre em contato conosco imediatamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">11. Alterações a esta Política</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações
                publicando a nova Política de Privacidade nesta página e atualizando a data de &quot;Última atualização&quot;.
                Alterações significativas serão comunicadas por e-mail.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">12. Contato</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Se você tiver dúvidas sobre esta Política de Privacidade ou quiser exercer seus direitos de privacidade, entre
                em contato conosco:
              </p>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>E-mail:</strong> privacidade@scanqr.com.br
                  <br />
                  <strong>E-mail (DPO):</strong> dpo@scanqr.com.br
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link href="/termos">
                <Button variant="outline">Ver Termos de Uso</Button>
              </Link>
              <Link href="/login">
                <Button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
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
