// Adicione esta linha no topo para indicar que este é um Componente de Cliente
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState } from 'react';
import { QRCode } from 'react-qrcode-logo'; // Usaremos uma versão com mais opções futuras

export default function HomePage() {
  // Estados para controlar os inputs e o valor do QR Code
  // ... dentro do componente HomePage
  const [url, setUrl] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [shorten, setShorten] = useState(false); // Novo estado para o checkbox
  const [isLoading, setIsLoading] = useState(false); // Novo estado para o carregamento

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
          <div className="mt-4 p-6 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <QRCode value={qrValue} size={200} />
          </div>
        )}
      </div>
    </main>
  );
}
