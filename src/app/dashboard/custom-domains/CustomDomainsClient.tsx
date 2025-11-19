'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SubscriptionTier } from '@/lib/subscriptionTiers';
import { canAddCustomDomain, getCustomDomainLimitMessage, getTierLimits } from '@/lib/subscriptionTiers';
import type { CustomDomainStats } from '@/types/customDomains';
import { AlertCircle, Check, CheckCircle2, Clock, Copy, ExternalLink, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CustomDomainsPageProps {
  tier: SubscriptionTier;
  userId: string;
}

export default function CustomDomainsPage({ tier, userId }: CustomDomainsPageProps) {
  const router = useRouter();
  const [domains, setDomains] = useState<CustomDomainStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newDomainMode, setNewDomainMode] = useState<'branding' | 'routing'>('branding');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<CustomDomainStats | null>(null);

  const limits = getTierLimits(tier);
  const canAdd = canAddCustomDomain(tier, domains.length);
  const limitMessage = getCustomDomainLimitMessage(tier, domains.length);
  const isRoutingAllowed = tier === 'pro' || tier === 'enterprise';

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/custom-domains');
      const data = await response.json();
      if (response.ok) {
        setDomains(data.domains || []);
      }
    } catch (error) {
      console.error('Erro ao buscar domínios:', error);
    }
    setLoading(false);
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch('/api/custom-domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain, mode: newDomainMode }),
      });

      const data = await response.json();

      if (response.ok) {
        setDomains([data.domain, ...domains]);
        setShowAddDialog(false);
        setNewDomain('');
        setNewDomainMode('branding');
        alert('Domínio adicionado! Configure os registros DNS para verificação.');
      } else if (response.status === 403 && data.upgrade_required) {
        if (confirm(`${data.message}\n\nDeseja fazer upgrade agora?`)) {
          router.push('/upgrade');
        }
      } else {
        alert(data.error || 'Falha ao adicionar domínio');
      }
    } catch (error) {
      alert('Erro ao comunicar com o servidor');
    }
    setIsAdding(false);
  };

  const handleVerifyDomain = async (domainId: number) => {
    try {
      const response = await fetch(`/api/custom-domains/${domainId}/verify`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Domínio verificado com sucesso!');
        fetchDomains();
      } else {
        // Mostrar mensagem detalhada da API
        const errorMsg = data.message || data.error || 'Falha na verificação';

        if (data.expected_record) {
          // Mostrar detalhes do registro esperado
          alert(
            `❌ ${errorMsg}\n\n` +
              `Configure o registro DNS:\n` +
              `Tipo: ${data.expected_record.type}\n` +
              `Nome: ${data.expected_record.name}\n` +
              `Valor: ${data.expected_record.value}\n\n` +
              `Dica: A propagação DNS pode levar de 15 minutos a 48 horas.`
          );
        } else {
          alert(`❌ ${errorMsg}`);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar domínio:', error);
      alert('❌ Erro de comunicação com o servidor. Tente novamente.');
    }
  };

  const handleDeleteDomain = async (domainId: number, domainName: string) => {
    if (
      !confirm(
        `Tem certeza que deseja remover o domínio "${domainName}"?\n\nTodos os QR Codes usando este domínio voltarão a usar o domínio padrão.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/custom-domains/${domainId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDomains(domains.filter((d) => d.id !== domainId));
        alert('Domínio removido com sucesso');
      } else {
        alert('Falha ao remover domínio');
      }
    } catch (error) {
      alert('Erro ao remover domínio');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  if (tier === 'free') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Domínios Customizados</h2>
          <p className="text-slate-600 mb-6">Esta funcionalidade está disponível apenas para usuários Pro e Enterprise.</p>
          <Link href="/upgrade">
            <Button size="lg">Fazer Upgrade</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Domínios Customizados</h1>
          <p className="text-slate-600 mt-1">{limitMessage}</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} disabled={!canAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Domínio
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Como funcionam os domínios customizados?</p>
            <p>
              Configure seu próprio domínio (ex: qr.suaempresa.com) para usar nos seus QR Codes. Após adicionar, você precisará
              configurar registros DNS e verificar a propriedade.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Domínios */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Carregando...</div>
      ) : domains.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed">
          <p className="text-slate-500 mb-4">Nenhum domínio customizado configurado</p>
          <Button onClick={() => setShowAddDialog(true)} variant="outline" disabled={!canAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeiro Domínio
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <div key={domain.id} className="bg-white border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{domain.domain}</h3>
                    {domain.verified ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        <CheckCircle2 className="h-3 w-3" />
                        Verificado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                        <Clock className="h-3 w-3" />
                        Aguardando Verificação
                      </span>
                    )}
                    <span
                      className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                        domain.mode === 'routing' ? 'text-blue-700 bg-blue-100' : 'text-slate-700 bg-slate-100'
                      }`}
                    >
                      {domain.mode === 'routing' ? '🌐 Routing' : '🏷️ Branding'}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-600">
                    <span>📊 {domain.qr_codes_count || 0} QR Codes</span>
                    <span>👁️ {(domain.total_scans || 0).toLocaleString('pt-BR')} scans</span>
                    <span>📅 Adicionado em {new Date(domain.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!domain.verified && (
                    <Button variant="outline" size="sm" onClick={() => handleVerifyDomain(domain.id)}>
                      Verificar
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setSelectedDomain(domain)}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDomain(domain.id, domain.domain)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {!domain.verified && (
                <div className="bg-slate-50 rounded p-4 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    Configure {domain.mode === 'routing' ? 'os registros' : 'o registro'} DNS:
                  </p>
                  <div className="space-y-2 text-sm">
                    {/* Registro TXT - sempre necessário */}
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <div className="font-mono text-xs">
                        <span className="text-slate-500">Tipo:</span> <span className="font-semibold">TXT</span>
                      </div>
                      <div className="font-mono text-xs flex-1 mx-4">
                        <span className="text-slate-500">Nome:</span>{' '}
                        <span className="font-semibold">_scanqr-verification.{domain.domain}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`_scanqr-verification.${domain.domain}`)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between bg-white p-2 rounded border">
                      <div className="font-mono text-xs flex-1">
                        <span className="text-slate-500">Valor:</span>{' '}
                        <span className="font-semibold break-all">{domain.verification_token || 'Gerando token...'}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(domain.verification_token)}
                        disabled={!domain.verification_token}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Registro CNAME - apenas para modo routing */}
                    {domain.mode === 'routing' && (
                      <>
                        <div className="border-t border-slate-300 my-3 pt-3">
                          <p className="text-xs font-semibold text-blue-700 mb-2">⚡ Configuração adicional para Routing:</p>
                        </div>
                        <div className="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200">
                          <div className="font-mono text-xs">
                            <span className="text-slate-500">Tipo:</span> <span className="font-semibold">CNAME</span>
                          </div>
                          <div className="font-mono text-xs flex-1 mx-4">
                            <span className="text-slate-500">Nome:</span>{' '}
                            <span className="font-semibold">{domain.domain}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(domain.domain)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-200">
                          <div className="font-mono text-xs flex-1">
                            <span className="text-slate-500">Valor:</span>{' '}
                            <span className="font-semibold">
                              {process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'seu-app.vercel.app'}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'seu-app.vercel.app'
                              )
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Após configurar, aguarde a propagação DNS (pode levar até 48h) e clique em &quot;Verificar&quot;.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dialog Adicionar Domínio */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Domínio Customizado</DialogTitle>
            <DialogDescription>
              Digite o domínio que você deseja usar para seus QR Codes. Exemplo: qr.suaempresa.com
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="domain">Domínio</Label>
              <Input
                id="domain"
                placeholder="qr.suaempresa.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
              />
              <p className="text-xs text-slate-500 mt-1">Apenas letras minúsculas, números, pontos e hífens</p>
            </div>

            <div>
              <Label htmlFor="mode">Modo de Funcionamento</Label>
              <select
                id="mode"
                value={newDomainMode}
                onChange={(e) => setNewDomainMode(e.target.value as 'branding' | 'routing')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!isRoutingAllowed}
              >
                <option value="branding">🏷️ Branding - Apenas organização (recomendado)</option>
                <option value="routing" disabled={!isRoutingAllowed}>
                  🌐 Routing - QR code usa o domínio customizado {!isRoutingAllowed ? '(Pro/Enterprise)' : ''}
                </option>
              </select>
              <div className="mt-2 text-xs text-slate-500 space-y-1">
                {newDomainMode === 'branding' ? (
                  <>
                    <p className="font-semibold">✅ Modo Branding (Simples):</p>
                    <p>• QR code usa o domínio padrão do app</p>
                    <p>• Domínio serve apenas para organização</p>
                    <p>• Requer apenas registro TXT no DNS</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">⚡ Modo Routing (Avançado - Pro/Enterprise):</p>
                    <p>• QR code usa SEU domínio customizado</p>
                    <p>• Exemplo: qr.suaempresa.com/abc123</p>
                    <p>• Requer registros TXT + CNAME no DNS</p>
                    {!isRoutingAllowed && (
                      <p className="text-amber-600 font-semibold mt-2">
                        ⚠️ Faça upgrade para Pro ou Enterprise para usar este recurso
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddDomain} disabled={isAdding || !newDomain.trim()}>
              {isAdding ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalhes do Domínio */}
      <Dialog open={!!selectedDomain} onOpenChange={() => setSelectedDomain(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedDomain?.domain}</DialogTitle>
            <DialogDescription>Detalhes e configuração do domínio</DialogDescription>
          </DialogHeader>
          {selectedDomain && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Status:</span>
                  <p className="font-semibold">
                    {selectedDomain.verified ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <Check className="h-4 w-4" /> Verificado
                      </span>
                    ) : (
                      <span className="text-yellow-600 flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Pendente
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">QR Codes usando este domínio:</span>
                  <p className="font-semibold">{selectedDomain.qr_codes_count || 0}</p>
                </div>
                <div>
                  <span className="text-slate-500">Total de scans:</span>
                  <p className="font-semibold">{(selectedDomain.total_scans || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <span className="text-slate-500">Adicionado em:</span>
                  <p className="font-semibold">{new Date(selectedDomain.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {selectedDomain.verified && selectedDomain.verified_at && (
                <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                  <p className="text-green-800">
                    ✅ Verificado em {new Date(selectedDomain.verified_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
