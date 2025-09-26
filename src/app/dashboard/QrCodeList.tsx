'use client';

import { Button } from '@/components/ui/button';
import { Copy, Trash2 } from 'lucide-react'; // Ícone de cópia
import { useState } from 'react';
import { QRCode } from 'react-qrcode-logo';

// Define o tipo de dados que o componente espera receber
type QRCodeType = {
  id: number;
  short_id: string;
  original_url: string;
  created_at: string;
};

type QrCodeListProps = {
  qrcodes: QRCodeType[];
};

export default function QrCodeList({ qrcodes }: QrCodeListProps) {
  const [codes, setCodes] = useState(qrcodes); // Novo estado
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  const handleCopy = (shortId: string) => {
    const shortUrl = `${appUrl}/${shortId}`;
    navigator.clipboard.writeText(shortUrl);
    // O ideal seria adicionar um toast/notificação aqui para "Copiado!"
    alert(`URL Curta Copiada: ${shortUrl}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja apagar este QR Code? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/qrcodes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove o item da lista no estado, atualizando a UI
        setCodes((currentCodes) => currentCodes.filter((code) => code.id !== id));
        alert('QR Code apagado com sucesso!');
      } else {
        const data = await response.json();
        alert(data.error || 'Falha ao apagar o QR Code.');
      }
    } catch (error) {
      alert('Ocorreu um erro de comunicação com o servidor.');
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Seus QR Codes</h2>
      <div className="border rounded-lg">
        <table className="min-w-full divide-y">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">QR Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">URL Curta</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">URL Original</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Criado em</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {qrcodes.map((qr) => (
              <tr key={qr.id}>
                <td className="p-4">
                  <div className="p-2 bg-white inline-block border rounded">
                    <QRCode value={`${appUrl}/${qr.short_id}`} size={60} quietZone={2} />
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <a href={`${appUrl}/${qr.short_id}`} target="_blank" className="text-blue-600 hover:underline font-mono">
                      {`${appUrl.replace('https://', '').replace('http://', '')}/${qr.short_id}`}
                    </a>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(qr.short_id)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-4 max-w-xs truncate text-slate-500">
                  <a href={qr.original_url} target="_blank" title={qr.original_url} className="hover:underline">
                    {qr.original_url}
                  </a>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(qr.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(qr.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
