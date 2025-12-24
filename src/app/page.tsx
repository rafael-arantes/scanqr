'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { trackEvent, UmamiEvents } from '@/lib/umami';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BarChart3, Crown, Download, Globe, LineChart, Link2, Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import QRCodeGenerator from 'qrcode';
import { useEffect, useState } from 'react';
import { QRCode as QRCodeComponent } from 'react-qrcode-logo';

export default function HomePage() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [shorten, setShorten] = useState(true); // Ativado por padrão para promover o produto
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateQrCode = async () => {
    setIsLoading(true);
    setQrValue(''); // Limpa o QR Code anterior

    if (shorten) {
      // Se a opção de encurtar estiver marcada...
      try {
        const response = await fetch('/api/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const data = await response.json();

        if (response.ok) {
          setQrValue(data.shortUrl);

          // Track QR code creation
          trackEvent(UmamiEvents.QR_CODE_CREATED, {
            tier: 'anonymous',
            hasCustomDomain: false,
            createdFrom: 'homepage',
          });

          // Se houver informação de uso, mostrar ao usuário
          if (data.usage) {
            console.log(`📊 Uso: ${data.usage.current} QR Codes no plano ${data.usage.tier}`);
          }
        } else {
          // Tratamento de erros específicos
          if (response.status === 401) {
            toast({
              title: 'Erro',
              description: 'Você precisa estar logado para encurtar URLs. Redirecionando...',
              variant: 'destructive',
            });
            window.location.href = '/login';
          } else if (response.status === 403 && data.upgrade_required) {
            // Limite atingido - mostrar mensagem amigável com opção de upgrade
            const upgradeMessage = `${data.message}\n\nDeseja fazer upgrade para criar mais QR Codes?`;
            if (confirm(upgradeMessage)) {
              window.location.href = '/upgrade'; // Redireciona para página de upgrade (criar depois)
            }
          } else {
            toast({
              title: 'Erro',
              description: data.error || 'Ocorreu um erro.',
              variant: 'destructive',
            });
          }
        }
      } catch (_error) {
        toast({
          title: 'Erro',
          description: 'Falha na comunicação com o servidor.',
          variant: 'destructive',
        });
      }
    } else {
      // Se não, apenas usa a URL original
      setQrValue(url);
    }

    setIsLoading(false);
  };

  const generateFileName = (urlForFileName: string) => {
    try {
      // Se for uma URL curta do nosso app, pegamos só o ID
      if (urlForFileName.startsWith(appUrl)) {
        return urlForFileName.split('/').pop() || 'qrcode';
      }
      const urlObject = new URL(urlForFileName);
      return urlObject.hostname.replace(/^www\./, ''); // Remove o "www."
    } catch (error) {
      console.error('URL inválida para gerar nome de arquivo:', error);
      return 'qrcode';
    }
  };

  const handleDownload = async (qrValue: string) => {
    if (!qrValue) return;

    const fileName = `${generateFileName(qrValue)}.png`;

    try {
      const dataUrl = await QRCodeGenerator.toDataURL(qrValue, {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: 'H',
      });

      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Track QR code download
      trackEvent(UmamiEvents.QR_CODE_DOWNLOADED, {
        downloadedFrom: 'homepage',
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o QR Code para download.',
        variant: 'destructive',
      });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': 'https://scanqr.com.br/#organization',
                name: 'ScanQR',
                url: 'https://scanqr.com.br',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://scanqr.com.br/scan-qr-svg.svg',
                },
                sameAs: [],
              },
              {
                '@type': 'WebSite',
                '@id': 'https://scanqr.com.br/#website',
                url: 'https://scanqr.com.br',
                name: 'ScanQR',
                description: 'Gerador de QR Codes Dinâmicos com Analytics',
                publisher: {
                  '@id': 'https://scanqr.com.br/#organization',
                },
                potentialAction: {
                  '@type': 'SearchAction',
                  target: 'https://scanqr.com.br/?s={search_term_string}',
                  'query-input': 'required name=search_term_string',
                },
              },
              {
                '@type': 'SoftwareApplication',
                name: 'ScanQR',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                offers: [
                  {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'BRL',
                    name: 'Plano Gratuito',
                  },
                  {
                    '@type': 'Offer',
                    price: '29',
                    priceCurrency: 'BRL',
                    name: 'Plano Pro',
                  },
                ],
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.8',
                  ratingCount: '127',
                },
                description:
                  'Crie QR Codes dinâmicos e gerencie seus links com facilidade. Acompanhe estatísticas em tempo real e use domínios customizados.',
              },
            ],
          }),
        }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Image src="/scan-qr-svg.svg" alt="ScanQR" width={237} height={56} className="h-14 w-auto" priority />
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Entrar</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      Começar grátis
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300">
              <Zap className="w-4 h-4" />
              QR Codes inteligentes com analytics
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              <span className="text-slate-900 dark:text-white">Crie QR Codes</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Rastreie resultados
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Gere QR Codes profissionais com URLs encurtadas, analytics em tempo real e domínios customizados. Ideal para
              marketing, eventos e negócios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8"
                >
                  Começar grátis
                </Button>
              </Link>
              <Link href="/upgrade">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Ver planos
                </Button>
              </Link>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">10+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">QR Codes grátis</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">100%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Analytics</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">∞</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Scans</div>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code Generator */}
          <div className="lg:pl-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-blue-500/10 p-8 border border-slate-200 dark:border-slate-700">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Experimente agora</h2>
                <p className="text-slate-600 dark:text-slate-400">Crie seu primeiro QR Code em segundos</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-base">
                    URL de destino
                  </Label>
                  <Input
                    type="url"
                    id="url"
                    placeholder="https://seu-site.com.br"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="flex items-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Checkbox
                    id="shorten"
                    checked={shorten}
                    onCheckedChange={(checked) => setShorten(Boolean(checked))}
                    className="border-blue-400"
                  />
                  <Label htmlFor="shorten" className="font-normal cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-blue-600" />
                      <span>Encurtar URL e salvar no dashboard</span>
                    </div>
                  </Label>
                </div>

                <Button
                  onClick={handleGenerateQrCode}
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={!url || isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Gerando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Gerar QR Code
                    </span>
                  )}
                </Button>

                {qrValue && (
                  <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border-2 border-blue-200 dark:border-blue-800 flex justify-center">
                      <QRCodeComponent id="main-qrcode" value={qrValue} size={200} />
                    </div>
                    <Button onClick={() => handleDownload(qrValue)} variant="secondary" className="w-full h-12 text-base">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar QR Code (1024x1024)
                    </Button>
                    {shorten && (
                      <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                        ✨ QR Code salvo no seu{' '}
                        <Link href="/dashboard" className="text-blue-600 hover:underline font-medium">
                          dashboard
                        </Link>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Por que escolher o ScanQR?</h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Muito mais que um simples gerador de QR Codes. Tenha controle total sobre suas campanhas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analytics em tempo real</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Acompanhe cada scan dos seus QR Codes. Veja estatísticas detalhadas e tome decisões baseadas em dados.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Domínios customizados</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Use seu próprio domínio (ex: qr.suaempresa.com) para fortalecer sua marca e aumentar a confiança.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">URLs encurtadas</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Links curtos e elegantes que são fáceis de compartilhar e memorizar. Perfeito para redes sociais.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Super rápido</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Crie QR Codes em segundos. Interface intuitiva e performance otimizada para sua produtividade.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <LineChart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Dashboard completo</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Gerencie todos os seus QR Codes em um só lugar. Edite, exclua e monitore com facilidade.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-yellow-300 dark:hover:border-yellow-600">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Planos flexíveis</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Do gratuito ao enterprise. Escolha o plano perfeito para suas necessidades e escale quando precisar.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">Pronto para começar?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de usuários que já estão usando QR Codes inteligentes para crescer seus negócios.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8">
                Criar conta grátis
              </Button>
            </Link>
            <Link href="/upgrade">
              <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8">
                Ver planos premium
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">ScanQR</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 max-w-sm">
                A plataforma completa para criar, gerenciar e rastrear QR Codes profissionais.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Produto</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  <Link href="/upgrade" className="hover:text-blue-600">
                    Preços
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-blue-600">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Legal</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  <Link href="/privacidade" className="hover:text-blue-600">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/termos" className="hover:text-blue-600">
                    Termos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-8 text-center text-slate-600 dark:text-slate-400">
            <p>© 2025 ScanQR. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
