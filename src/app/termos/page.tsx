import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function TermosPage() {
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
            <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Termos de Uso</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Última atualização: 23 de novembro de 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Aceitação dos Termos</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Ao acessar e usar o ScanQR (&quot;Serviço&quot;), você concorda em cumprir e estar vinculado aos seguintes
                termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Descrição do Serviço</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">O ScanQR é uma plataforma que permite aos usuários:</p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>Criar e gerenciar QR Codes personalizados</li>
                <li>Encurtar URLs e rastreá-las</li>
                <li>Acessar analytics e estatísticas de uso</li>
                <li>Configurar domínios customizados (planos pagos)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Contas de Usuário</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Para acessar determinadas funcionalidades do Serviço, você precisará criar uma conta. Você é responsável por:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>Manter a confidencialidade das informações de sua conta</li>
                <li>Todas as atividades que ocorram sob sua conta</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                <li>Fornecer informações verdadeiras e atualizadas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Planos e Pagamentos</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>4.1 Planos Gratuitos:</strong> O ScanQR oferece um plano gratuito com funcionalidades limitadas.
                Reservamo-nos o direito de modificar ou descontinuar o plano gratuito a qualquer momento.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>4.2 Planos Pagos:</strong> Os planos Pro e Enterprise são cobrados mensalmente ou anualmente. Ao
                assinar um plano pago, você autoriza o ScanQR a cobrar de forma recorrente no método de pagamento fornecido.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>4.3 Cancelamento:</strong> Você pode cancelar sua assinatura a qualquer momento através do dashboard. O
                cancelamento entra em vigor ao final do período de cobrança atual.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>4.4 Reembolsos:</strong> Não oferecemos reembolsos para períodos parciais de assinatura.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Uso Aceitável</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">Você concorda em NÃO usar o Serviço para:</p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>Criar conteúdo ilegal, fraudulento, difamatório ou prejudicial</li>
                <li>Violar direitos de propriedade intelectual de terceiros</li>
                <li>Transmitir vírus, malware ou código malicioso</li>
                <li>Realizar phishing, spam ou qualquer atividade fraudulenta</li>
                <li>Sobrecarregar ou interferir com a infraestrutura do Serviço</li>
                <li>Criar QR Codes que redirecionem para sites maliciosos</li>
                <li>Utilizar o serviço para assédio ou discriminação</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Propriedade Intelectual</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>6.1 Conteúdo do ScanQR:</strong> Todo o conteúdo, recursos e funcionalidades do Serviço (incluindo, mas
                não se limitando a, software, design, texto e gráficos) são propriedade do ScanQR e estão protegidos por leis
                de propriedade intelectual.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>6.2 Conteúdo do Usuário:</strong> Você mantém todos os direitos sobre os QR Codes e URLs que criar. Ao
                usar o Serviço, você nos concede uma licença limitada para hospedar, armazenar e exibir seu conteúdo conforme
                necessário para fornecer o Serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Limitação de Responsabilidade</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                O Serviço é fornecido &quot;como está&quot; e &quot;conforme disponível&quot;. O ScanQR não garante que:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>O Serviço estará sempre disponível ou livre de erros</li>
                <li>Os resultados obtidos através do Serviço serão precisos ou confiáveis</li>
                <li>Defeitos no Serviço serão corrigidos</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Em nenhum caso o ScanQR será responsável por danos indiretos, incidentais, especiais ou consequenciais
                decorrentes do uso ou incapacidade de usar o Serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Modificações ao Serviço</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Reservamo-nos o direito de modificar ou descontinuar, temporária ou permanentemente, o Serviço (ou qualquer
                parte dele) com ou sem aviso prévio. Você concorda que o ScanQR não será responsável perante você ou terceiros
                por qualquer modificação, suspensão ou descontinuação do Serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Rescisão</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Podemos encerrar ou suspender sua conta e acesso ao Serviço imediatamente, sem aviso prévio, por qualquer
                motivo, incluindo, sem limitação, se você violar estes Termos de Uso.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Após o encerramento, seu direito de usar o Serviço cessará imediatamente. Se desejar encerrar sua conta, você
                pode simplesmente parar de usar o Serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">10. Lei Aplicável</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar suas disposições
                sobre conflito de leis.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">11. Alterações aos Termos</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Se fizermos alterações materiais,
                notificaremos você por e-mail ou através de um aviso em nosso Serviço. Seu uso continuado do Serviço após tais
                modificações constitui sua aceitação dos novos termos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">12. Contato</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco:
              </p>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>E-mail:</strong> suporte@scanqr.com.br
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link href="/privacidade">
                <Button variant="outline">Ver Política de Privacidade</Button>
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
