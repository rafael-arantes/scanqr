import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
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
            <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Termos de uso</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Última atualização: 05 de dezembro de 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Identificação do Prestador</h2>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Razão Social:</strong> VERTIO SOLUÇÕES DIGITAIS
                  <br />
                  <strong>CNPJ:</strong> 60.183.975/0001-24
                  <br />
                  <strong>Nome fantasia:</strong> VERTIO
                  <br />
                  <strong>E-mail:</strong> contato@vertio.com.br
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Aceitação dos termos</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Ao acessar e utilizar a plataforma ScanQR (&quot;Plataforma&quot; ou &quot;Serviço&quot;), você
                (&quot;Usuário&quot;) concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer
                disposição, não utilize o Serviço. O uso continuado implica aceitação tácita de todas as cláusulas.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Descrição do serviço</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                O ScanQR é uma plataforma SaaS (Software as a Service) que possibilita:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>criação e gerenciamento de QR Codes dinâmicos com rastreamento</li>
                <li>encurtamento e gestão centralizada de URLs</li>
                <li>análise de métricas e estatísticas de acesso em tempo real</li>
                <li>configuração de domínios personalizados (planos pagos)</li>
                <li>armazenamento seguro e controle de versões</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Cadastro e responsabilidades</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>3.1 Elegibilidade:</strong> para utilizar o Serviço, você deve ser maior de 18 anos ou possuir
                autorização legal de representante.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>3.2 Veracidade das informações:</strong> o Usuário compromete-se a fornecer dados verdadeiros,
                completos e atualizados durante o cadastro e ao longo da utilização do Serviço.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>3.3 Confidencialidade de credenciais:</strong> o Usuário é exclusivamente responsável por manter a
                confidencialidade de suas credenciais de acesso (usuário e senha) e por todas as atividades realizadas em sua
                conta.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>3.4 Notificação de incidentes:</strong> qualquer suspeita de acesso não autorizado ou violação de
                segurança deve ser imediatamente comunicada através do e-mail: seguranca@vertio.com.br
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Planos, pagamentos e faturamento</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>4.1 Modalidades:</strong> o ScanQR oferece planos Gratuito, Pro e Enterprise, com funcionalidades e
                limites conforme especificado na página de preços.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>4.2 Cobrança recorrente:</strong> planos pagos são cobrados mensalmente ou anualmente, com renovação
                automática. O Usuário autoriza expressamente a cobrança recorrente no método de pagamento cadastrado.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>4.3 Alteração de preços:</strong> reservamo-nos o direito de modificar valores mediante notificação com
                30 dias de antecedência.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>4.4 Cancelamento:</strong> o cancelamento pode ser solicitado a qualquer momento através do painel de
                controle. O acesso permanece ativo até o fim do período pago.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>4.5 Política de reembolso:</strong> não há reembolsos para períodos parciais ou proporcionais, exceto
                quando determinado por lei ou em casos excepcionais a critério da VERTIO.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>4.6 Inadimplência:</strong> a falta de pagamento pode resultar na suspensão imediata do acesso ao
                Serviço e exclusão de dados após 30 dias.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Uso aceitável e proibições</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                O Usuário concorda expressamente em NÃO utilizar o Serviço para:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>Criar, hospedar ou distribuir conteúdo ilegal, fraudulento, difamatório, obsceno ou discriminatório</li>
                <li>Violar direitos de propriedade intelectual, marcas, patentes ou segredos comerciais de terceiros</li>
                <li>Transmitir vírus, malware, ransomware ou qualquer código malicioso</li>
                <li>Realizar phishing, spam, engenharia social ou outras práticas fraudulentas</li>
                <li>Sobrecarregar, realizar ataques DDoS ou comprometer a infraestrutura da Plataforma</li>
                <li>Criar QR Codes que redirecionem para sites maliciosos, ilegais ou enganosos</li>
                <li>Coletar dados de terceiros sem consentimento expresso</li>
                <li>Realizar engenharia reversa, descompilação ou tentativa de acesso não autorizado ao código-fonte</li>
                <li>Revender, sublicenciar ou transferir acesso sem autorização prévia por escrito</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                A violação de qualquer cláusula acima resultará em suspensão imediata da conta e possível ação legal.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Propriedade intelectual</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>6.1 Propriedade da VERTIO:</strong> Todos os direitos de propriedade intelectual sobre a Plataforma,
                incluindo mas não se limitando a software, código-fonte, design, interface, marca, logotipos e documentação,
                são de titularidade exclusiva da VERTIO SOLUÇÕES DIGITAIS.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>6.2 Licença de Uso:</strong> É concedida ao Usuário uma licença limitada, não exclusiva, intransferível
                e revogável para utilizar a Plataforma conforme estes Termos.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>6.3 Conteúdo do Usuário:</strong> O Usuário retém todos os direitos sobre QR Codes, URLs e dados
                criados. Ao utilizar o Serviço, concede à VERTIO licença mundial, livre de royalties, para hospedar, processar
                e exibir seu conteúdo exclusivamente para prestação do Serviço.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>6.4 Remoção de Conteúdo:</strong> A VERTIO reserva-se o direito de remover qualquer conteúdo que viole
                estes Termos, legislação aplicável ou direitos de terceiros.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Segurança e proteção de dados</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>7.1 Compromisso com Segurança:</strong> A VERTIO implementa medidas técnicas e organizacionais para
                proteger dados contra acessos não autorizados, conforme padrões da indústria (criptografia TLS 1.3,
                autenticação multifator, logs de auditoria).
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>7.2 LGPD:</strong> O tratamento de dados pessoais observa rigorosamente a Lei Geral de Proteção de
                Dados (Lei 13.709/2018). Consulte nossa Política de Privacidade para detalhes.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>7.3 Backup e Recuperação:</strong> Realizamos backups regulares, porém o Usuário é responsável por
                manter cópias próprias de dados críticos.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>7.4 Incidentes de Segurança:</strong> Em caso de violação de dados, o Usuário será notificado conforme
                prazos legais (72 horas) e medidas corretivas serão implementadas imediatamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Disponibilidade e SLA</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>8.1 Uptime:</strong> Buscamos manter disponibilidade de 99,5% ao mês, excluindo manutenções programadas
                notificadas com 48h de antecedência.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>8.2 Manutenção:</strong> Reservamo-nos o direito de realizar manutenções emergenciais sem aviso prévio
                quando necessário para segurança ou estabilidade.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>8.3 Sem Garantia Absoluta:</strong> O Serviço é fornecido &quot;como está&quot;. Não garantimos
                ausência total de erros, interrupções ou perda de dados, embora empreguemos todos os esforços razoáveis.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Limitação de responsabilidade</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>9.1 Uso por Conta e Risco:</strong> O Usuário utiliza a Plataforma por sua conta e risco. A VERTIO não
                se responsabiliza por:
              </p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-4">
                <li>Conteúdo criado, compartilhado ou destinação dada aos QR Codes pelo Usuário</li>
                <li>Danos diretos ou indiretos decorrentes de indisponibilidade, erros ou perda de dados</li>
                <li>Ações de terceiros, incluindo ataques cibernéticos ou violações de segurança externas</li>
                <li>Incompatibilidade com sistemas, navegadores ou dispositivos específicos</li>
                <li>Decisões comerciais tomadas com base em métricas fornecidas pela Plataforma</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>9.2 Limite Indenizatório:</strong> Em nenhuma hipótese a responsabilidade total da VERTIO excederá o
                valor pago pelo Usuário nos últimos 12 meses.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>9.3 Exclusão de Danos Indiretos:</strong> A VERTIO não será responsável por lucros cessantes, danos
                morais, perda de oportunidade comercial ou qualquer dano indireto, ainda que avisada previamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">10. Confidencialidade</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                As partes comprometem-se a manter confidencialidade sobre informações sensíveis trocadas durante a prestação do
                Serviço, incluindo dados de negócios, estratégias comerciais e informações técnicas, pelo prazo de 5 anos após
                o término da relação contratual.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">11. Modificações ao serviço</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                A VERTIO reserva-se o direito de modificar, adicionar ou descontinuar funcionalidades da Plataforma a qualquer
                momento. Alterações substanciais serão comunicadas com 15 dias de antecedência via e-mail cadastrado.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">12. Rescisão e suspensão</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>12.1 Rescisão pelo Usuário:</strong> O cancelamento pode ser solicitado a qualquer momento, com efeito
                ao final do período pago.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>12.2 Rescisão pela VERTIO:</strong> Podemos suspender ou encerrar contas imediatamente em caso de
                violação destes Termos, atividades fraudulentas, inadimplência ou determinação judicial.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>12.3 Efeitos da Rescisão:</strong> Após o encerramento, o acesso é revogado e dados podem ser excluídos
                após 30 dias, conforme Política de Retenção de Dados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">13. Lei aplicável e foro</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de São
                Paulo/SP para dirimir quaisquer controvérsias, com renúncia expressa a qualquer outro, por mais privilegiado
                que seja.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">14. Alterações aos termos</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                A VERTIO poderá alterar estes Termos a qualquer momento. Mudanças materiais serão notificadas por e-mail ou
                aviso na Plataforma com 30 dias de antecedência. O uso continuado após a vigência das alterações implica
                aceitação tácita.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">15. Disposições gerais</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>15.1 Integralidade:</strong> Estes Termos constituem o acordo integral entre as partes, substituindo
                quaisquer entendimentos anteriores.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>15.2 Divisibilidade:</strong> A invalidade de qualquer cláusula não afeta a validade das demais.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>15.3 Cessão:</strong> O Usuário não pode ceder ou transferir direitos sem autorização prévia por
                escrito.
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                <strong>15.4 Idioma:</strong> Versão em português prevalece sobre traduções.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">16. Contato e ouvidoria</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Para dúvidas, reclamações ou exercício de direitos previstos nestes Termos:
              </p>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>VERTIO SOLUÇÕES DIGITAIS</strong>
                  <br />
                  CNPJ: 60.183.975/0001-24
                  <br />
                  <strong>E-mail Geral:</strong> contato@vertio.com.br
                  <br />
                  <strong>E-mail Suporte:</strong> suporte@scanqr.com.br
                  <br />
                  <strong>E-mail DPO (Dados Pessoais):</strong> dpo@vertio.com.br
                  <br />
                  <strong>Prazo de Resposta:</strong> Até 5 dias úteis
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
