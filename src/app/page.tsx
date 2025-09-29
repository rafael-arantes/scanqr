// Adicione esta linha no topo para indicar que este é um Componente de Cliente
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import Link from 'next/link';
import QRCodeGenerator from 'qrcode';
import { useState } from 'react';
import { QRCode as QRCodeComponent } from 'react-qrcode-logo';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [shorten, setShorten] = useState(false); // Novo estado para o checkbox
  const [isLoading, setIsLoading] = useState(false); // Novo estado para o carregamento
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

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
        } else {
          // Se o usuário não estiver logado, a API retornará um erro 401
          if (response.status === 401) {
            alert('Você precisa estar logado para encurtar URLs. Redirecionando...');
            window.location.href = '/login'; // Redireciona para o login
          } else {
            alert(data.error || 'Ocorreu um erro.');
          }
        }
      } catch (error) {
        alert('Falha na comunicação com o servidor.');
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
    } catch (err) {
      console.error(err);
      alert('Não foi possível gerar o QR Code para download.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-8">
      <header className="absolute top-0 left-0 w-full p-4 flex justify-end">
        <Link href="/dashboard">
          <Button variant="outline">Acessar Painel</Button>
        </Link>
      </header>
      <div className="flex flex-col items-center justify-center gap-6 w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Gerador de QR Code</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Cole sua URL abaixo para gerar um QR Code instantaneamente.
          </p>
        </div>

        {/* Área de Inputs */}
        <div className="w-full flex flex-col gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="url">Sua URL</Label>
            <Input
              type="url"
              id="url"
              placeholder="https://exemplo.com.br"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="shorten" checked={shorten} onCheckedChange={(checked) => setShorten(Boolean(checked))} />
            <Label htmlFor="shorten" className="font-normal">
              Encurtar URL (opcional)
            </Label>
          </div>
        </div>

        <Button
          onClick={handleGenerateQrCode}
          className="w-full"
          disabled={!url || isLoading} // Desabilita também durante o carregamento
        >
          {isLoading ? 'Gerando...' : 'Gerar QR Code'}
        </Button>

        {/* Área de exibição do QR Code */}
        {qrValue && (
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="p-6 bg-slate-100 dark:bg-slate-700 rounded-lg">
              {/* Adicione o ID aqui */}
              <QRCodeComponent id="main-qrcode" value={qrValue} size={200} />
            </div>
            {/* NOVO BOTÃO DE DOWNLOAD */}
            <Button onClick={() => handleDownload(qrValue)} variant="secondary" className="w-full flex items-center gap-2">
              <Download size={16} />
              Baixar QR Code
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
