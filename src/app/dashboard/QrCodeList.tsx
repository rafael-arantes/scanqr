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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BarChart3, Copy, Download, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import QRCodeGenerator from 'qrcode';
import { useEffect, useState } from 'react';
import { QRCode as QRCodeComponent } from 'react-qrcode-logo';

// Tipos
type CustomDomain = {
  id: number;
  domain: string;
  verified: boolean;
  mode: 'branding' | 'routing';
};

type QRCodeType = {
  id: number;
  short_id: string;
  original_url: string;
  created_at: string;
  scan_count: number;
  custom_domain_id: number | null;
  custom_domains?: {
    id: number;
    domain: string;
    verified: boolean;
    mode: 'branding' | 'routing';
  } | null;
};

type QrCodeListProps = {
  qrcodes: QRCodeType[];
  userTier: 'free' | 'pro' | 'enterprise';
};

export default function QrCodeList({ qrcodes, userTier }: QrCodeListProps) {
  const { toast } = useToast();
  const [codes, setCodes] = useState(qrcodes);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const supabase = createClientComponentClient();

  // === NOVOS ESTADOS PARA O MODAL ===
  // Armazena o QR Code que está sendo editado no momento
  const [editingQr, setEditingQr] = useState<QRCodeType | null>(null);
  // Armazena o valor da nova URL que o usuário digita no input
  const [newUrl, setNewUrl] = useState('');
  // Estado para controlar o loading do botão de salvar
  const [isUpdating, setIsUpdating] = useState(false);
  // Domínios customizados disponíveis
  const [customDomains, setCustomDomains] = useState<CustomDomain[]>([]);
  // Domínio selecionado para o QR code
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(null);
  // Estado para controlar o dialog de confirmação de exclusão
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [qrToDelete, setQrToDelete] = useState<number | null>(null);

  // Carregar domínios customizados se for Pro ou Enterprise
  useEffect(() => {
    if (userTier === 'pro' || userTier === 'enterprise') {
      loadCustomDomains();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userTier]);

  const loadCustomDomains = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_domains')
        .select('id, domain, verified, mode')
        .eq('verified', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCustomDomains(data);
      }
    } catch (error) {
      console.error('Erro ao carregar domínios:', error);
    }
  };

  // Função helper para obter URL do QR Code
  const getQrCodeUrl = (qrcode: QRCodeType): string => {
    // Se tem domínio customizado em modo routing, usa o domínio
    if (qrcode.custom_domains?.verified && qrcode.custom_domains?.mode === 'routing') {
      return `https://${qrcode.custom_domains.domain}/${qrcode.short_id}`;
    }
    // Caso contrário, usa o domínio padrão
    return `${appUrl}/${qrcode.short_id}`;
  };

  // Funções handleCopy e handleDelete
  const handleCopy = (qrcode: QRCodeType) => {
    const shortUrl = getQrCodeUrl(qrcode);
    navigator.clipboard.writeText(shortUrl);
    // Toast notification seria melhor aqui, mas vamos usar alert por enquanto
    const notification = document.createElement('div');
    notification.className =
      'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom-5';
    notification.textContent = '✓ URL copiada!';
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 2000);
  };

  const confirmDelete = (id: number) => {
    setQrToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (qrToDelete === null) return;

    setDeleteConfirmOpen(false);
    try {
      const response = await fetch(`/api/qrcodes/${qrToDelete}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCodes((currentCodes) => currentCodes.filter((code) => code.id !== qrToDelete));
        toast({
          title: 'QR Code apagado!',
          description: 'QR Code removido com sucesso',
          variant: 'success',
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: data.error || 'Falha ao apagar o QR Code.',
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro de comunicação com o servidor.',
        variant: 'destructive',
      });
    } finally {
      setQrToDelete(null);
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
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o QR Code para download.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenEditModal = (qr: QRCodeType) => {
    setEditingQr(qr); // Define qual QR Code estamos editando
    setNewUrl(qr.original_url); // Preenche o input com a URL atual
    setSelectedDomainId(qr.custom_domain_id); // Preenche o domínio atual
  };

  const handleUpdateLink = async () => {
    if (!editingQr || !newUrl) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/qrcodes/${editingQr.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_url: newUrl,
          custom_domain_id: selectedDomainId,
        }),
      });

      if (response.ok) {
        const updatedQr = await response.json();

        // Atualiza a lista na tela sem precisar recarregar a página
        setCodes((currentCodes) => currentCodes.map((code) => (code.id === updatedQr.id ? updatedQr : code)));
        toast({
          title: 'URL atualizada!',
          description: 'URL do QR Code atualizada com sucesso',
          variant: 'success',
        });
        setEditingQr(null); // Fecha o modal
      } else {
        const data = await response.json();
        toast({
          title: 'Erro',
          description: `Falha ao atualizar: ${data.error || 'Erro desconhecido'}`,
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro de comunicação com o servidor.',
        variant: 'destructive',
      });
    }
    setIsUpdating(false);
  };

  return (
    <Dialog open={!!editingQr} onOpenChange={(open) => !open && setEditingQr(null)}>
      <div className="w-full">
        {/* ===== LAYOUT DA TABELA PARA DESKTOP (md e acima) ===== */}
        <div className="hidden md:block">
          <div className="w-full overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Link Encurtado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Destino
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Analytics
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                {codes.map((qr) => (
                  <tr key={qr.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="p-2 bg-white dark:bg-slate-900 inline-block border-2 border-slate-200 dark:border-slate-600 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <QRCodeComponent value={getQrCodeUrl(qr)} size={64} quietZone={2} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={getQrCodeUrl(qr)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-mono text-sm transition-colors"
                        >
                          <span className="font-medium">
                            {qr.custom_domains?.mode === 'routing'
                              ? `${qr.custom_domains.domain}/${qr.short_id}`
                              : qr.short_id}
                          </span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          onClick={() => handleCopy(qr)}
                          title="Copiar URL"
                        >
                          <Copy className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {qr.custom_domains?.verified && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${
                              qr.custom_domains.mode === 'routing'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                            }`}
                          >
                            {qr.custom_domains.mode === 'routing' ? '🌐' : '🏷️'}
                            {qr.custom_domains.domain}
                          </span>
                        )}
                        {!qr.custom_domains && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {appUrl.replace('https://', '').replace('http://', '')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <a
                        href={qr.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={qr.original_url}
                        className="text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 truncate block transition-colors"
                      >
                        {qr.original_url}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-bold text-blue-700 dark:text-blue-300">
                            {qr.scan_count.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {qr.scan_count === 0 ? 'Nenhum scan' : qr.scan_count === 1 ? '1 scan' : 'scans'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {new Date(qr.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(qr.created_at).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={() => handleOpenEditModal(qr)}
                            title="Editar destino"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400"
                          onClick={() => handleDownload(qr.short_id)}
                          title="Baixar QR Code"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                          onClick={() => confirmDelete(qr.id)}
                          title="Excluir QR Code"
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
            <div
              key={qr.id}
              className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
            >
              {/* Header do Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-4 py-3 border-b border-blue-100 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {qr.scan_count.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {qr.scan_count === 0 ? 'nenhum scan' : qr.scan_count === 1 ? 'scan' : 'scans'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {new Date(qr.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(qr.created_at).getFullYear()}</div>
                  </div>
                </div>
              </div>

              {/* Corpo do Card */}
              <div className="p-4">
                <div className="flex gap-4">
                  {/* QR Code */}
                  <div className="shrink-0">
                    <div className="p-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 rounded-lg shadow-md">
                      <QRCodeComponent value={getQrCodeUrl(qr)} size={80} quietZone={2} />
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Link Encurtado */}
                    <div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        Link Encurtado
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={getQrCodeUrl(qr)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                        >
                          {qr.custom_domains?.mode === 'routing' ? `${qr.custom_domains.domain}/${qr.short_id}` : qr.short_id}
                        </a>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleCopy(qr)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {qr.custom_domains?.verified && (
                        <div className="mt-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${
                              qr.custom_domains.mode === 'routing'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                            }`}
                          >
                            {qr.custom_domains.mode === 'routing' ? '🌐' : '🏷️'}
                            {qr.custom_domains.domain}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* URL Original */}
                    <div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Destino</div>
                      <a
                        href={qr.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2"
                      >
                        {qr.original_url}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer com Ações */}
              <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300"
                      onClick={() => handleOpenEditModal(qr)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 hover:border-green-300"
                    onClick={() => handleDownload(qr.short_id)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Baixar
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300"
                    onClick={() => confirmDelete(qr.id)}
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

          {/* Seleção de Domínio Customizado (Pro/Enterprise) */}
          {customDomains.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-custom-domain" className="text-right">
                Domínio
              </Label>
              <select
                id="edit-custom-domain"
                value={selectedDomainId || ''}
                onChange={(e) => setSelectedDomainId(e.target.value ? Number(e.target.value) : null)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Domínio padrão</option>
                {customDomains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domain}
                  </option>
                ))}
              </select>
            </div>
          )}
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

      {/* ===== DIALOG DE CONFIRMAÇÃO DE EXCLUSÃO ===== */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>Tem certeza que deseja apagar este QR Code? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 md:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setQrToDelete(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
