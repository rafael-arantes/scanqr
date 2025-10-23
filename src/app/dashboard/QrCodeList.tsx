'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input'; // Importe o Input
import { Label } from '@/components/ui/label'; // Importe a Label
import { Copy, Download, Pencil, Trash2 } from 'lucide-react';
import QRCodeGenerator from 'qrcode';
import { useState } from 'react';
import { QRCode as QRCodeComponent } from 'react-qrcode-logo';

// Tipos (sem alteração)
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
  const [codes, setCodes] = useState(qrcodes);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  // === NOVOS ESTADOS PARA O MODAL ===
  // Armazena o QR Code que está sendo editado no momento
  const [editingQr, setEditingQr] = useState<QRCodeType | null>(null);
  // Armazena o valor da nova URL que o usuário digita no input
  const [newUrl, setNewUrl] = useState('');
  // Estado para controlar o loading do botão de salvar
  const [isUpdating, setIsUpdating] = useState(false);

  // Funções handleCopy e handleDelete (sem alteração)
  const handleCopy = (shortId: string) => {
    const shortUrl = `${appUrl}/${shortId}`;
    navigator.clipboard.writeText(shortUrl);
    alert(`URL Curta Copiada: ${shortUrl}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja apagar este QR Code?')) {
      return;
    }
    try {
      const response = await fetch(`/api/qrcodes/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
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

  const handleDownload = async (shortId: string) => {
    try {
      const urlToDownload = `${appUrl}/${shortId}`;

      // Gera uma Data URL em alta resolução (1024px) em memória
      const dataUrl = await QRCodeGenerator.toDataURL(urlToDownload, {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: 'H', // Alta correção de erros, bom para logos
      });

      // A lógica para criar o link e iniciar o download continua a mesma
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `${shortId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error(err);
      alert('Não foi possível gerar o QR Code para download.');
    }
  };

  const handleOpenEditModal = (qr: QRCodeType) => {
    setEditingQr(qr); // Define qual QR Code estamos editando
    setNewUrl(qr.original_url); // Preenche o input com a URL atual
  };

  const handleUpdateLink = async () => {
    if (!editingQr || !newUrl) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/qrcodes/${editingQr.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_url: newUrl }),
      });

      if (response.ok) {
        const updatedQr = await response.json();

        // Atualiza a lista na tela sem precisar recarregar a página
        setCodes((currentCodes) => currentCodes.map((code) => (code.id === updatedQr.id ? updatedQr : code)));
        alert('URL atualizada com sucesso!');
        setEditingQr(null); // Fecha o modal
      } else {
        const data = await response.json();
        alert(`Falha ao atualizar: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      alert('Ocorreu um erro de comunicação com o servidor.');
    }
    setIsUpdating(false);
  };

  return (
    <Dialog open={!!editingQr} onOpenChange={(open) => !open && setEditingQr(null)}>
      <div className="w-full">
        {/* ===== LAYOUT DA TABELA PARA DESKTOP (md e acima) ===== */}
        <div className="hidden md:block">
          <div className="w-full overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">QR Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">URL Curta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">URL Original</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Criado em</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {codes.map((qr) => (
                  <tr key={qr.id}>
                    <td className="p-4">
                      <div className="p-2 bg-white inline-block border rounded">
                        <QRCodeComponent value={`${appUrl}/${qr.short_id}`} size={60} quietZone={2} />
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <a
                          href={`${appUrl}/${qr.short_id}`}
                          target="_blank"
                          className="text-blue-600 hover:underline font-mono"
                        >{`${appUrl.replace('https://', '').replace('http://', '')}/${qr.short_id}`}</a>
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
                      {new Date(qr.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1">
                        {/* NOVO BOTÃO DE EDITAR (usa DialogTrigger) */}
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(qr)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(qr.short_id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(qr.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== LAYOUT DE CARDS PARA MOBILE (abaixo de md) ===== */}
        <div className="md:hidden space-y-4">
          {codes.map((qr) => (
            <div key={qr.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex gap-4">
                {/* Coluna do QR Code */}
                <div className="flex-shrink-0">
                  <div className="p-1 bg-white inline-block border rounded">
                    <QRCodeComponent value={`${appUrl}/${qr.short_id}`} size={80} quietZone={2} />
                  </div>
                </div>
                {/* Coluna das Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <a
                      href={`${appUrl}/${qr.short_id}`}
                      target="_blank"
                      className="font-mono text-blue-600 hover:underline text-sm truncate"
                    >{`${appUrl.replace('https://', '').replace('http://', '')}/${qr.short_id}`}</a>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(qr.short_id)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-slate-500">URL Original:</p>
                    <a href={qr.original_url} target="_blank" className="text-sm text-slate-700 hover:underline break-words">
                      {qr.original_url}
                    </a>
                  </div>
                </div>
              </div>
              <div className="border-t mt-4 pt-3 flex items-center justify-between">
                <p className="text-xs text-slate-500">Criado em: {new Date(qr.created_at).toLocaleDateString('pt-BR')}</p>
                <div className="flex items-center gap-1">
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(qr)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(qr.short_id)}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>Baixar</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(qr.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* ===== O MODAL (DIALOG) DE EDIÇÃO ===== */}
      {/* Este componente fica "dormente" até ser ativado */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar URL de Destino</DialogTitle>
          <DialogDescription>O QR Code continuará o mesmo, mas o destino final será alterado.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="current-url" className="text-right">
              Link Curto
            </Label>
            <Input id="current-url" value={`${appUrl}/${editingQr?.short_id}`} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-url" className="text-right">
              Novo Destino
            </Label>
            <Input id="new-url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleUpdateLink} disabled={isUpdating}>
            {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
