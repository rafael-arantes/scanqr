'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Feedback {
  id: string;
  user_id: string;
  category: 'bug' | 'suggestion' | 'praise' | 'other';
  message: string;
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
  users: {
    email: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

const categoryLabels: Record<string, string> = {
  bug: 'Bug / Erro',
  suggestion: 'Sugestão',
  praise: 'Elogio',
  other: 'Outro',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  in_review: 'Em Análise',
  resolved: 'Resolvido',
  dismissed: 'Descartado',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_review: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-gray-100 text-gray-700',
};

export default function AdminFeedbacksPage() {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFeedbacks(feedbacks);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredFeedbacks(
        feedbacks.filter(
          (feedback) =>
            feedback.message.toLowerCase().includes(query) ||
            feedback.users.email.toLowerCase().includes(query) ||
            feedback.users.display_name?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, feedbacks]);

  const fetchFeedbacks = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await fetch(`/api/admin/feedbacks?${params}`);

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 403) {
          toast({
            title: 'Acesso negado',
            description: 'Você não tem permissão para acessar esta página',
            variant: 'destructive',
          });
          window.location.href = '/dashboard';
          return;
        }
        throw new Error(data.error || 'Erro ao carregar feedbacks');
      }

      const data = await response.json();
      setFeedbacks(data.feedbacks);
      setFilteredFeedbacks(data.feedbacks);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar feedbacks',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (feedbackId: string, newStatus: string) => {
    setUpdatingId(feedbackId);

    try {
      const response = await fetch('/api/admin/feedbacks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedbackId, status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao atualizar feedback',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setFeedbacks((prev) =>
        prev.map((feedback) =>
          feedback.id === feedbackId
            ? { ...feedback, status: newStatus as 'pending' | 'in_review' | 'resolved' | 'dismissed' }
            : feedback
        )
      );

      toast({
        title: 'Sucesso!',
        description: 'Status atualizado com sucesso',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar feedback',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar ao Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Feedbacks dos Usuários</h1>
        <p className="text-muted-foreground">Visualize e gerencie feedbacks enviados pelos usuários</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por mensagem, email ou nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background cursor-pointer"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendente</option>
              <option value="in_review">Em Análise</option>
              <option value="resolved">Resolvido</option>
              <option value="dismissed">Descartado</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Categoria</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background cursor-pointer"
            >
              <option value="all">Todas</option>
              <option value="bug">Bug / Erro</option>
              <option value="suggestion">Sugestão</option>
              <option value="praise">Elogio</option>
              <option value="other">Outro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{feedbacks.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-bold">{feedbacks.filter((f) => f.status === 'pending').length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Em Análise</p>
          <p className="text-2xl font-bold">{feedbacks.filter((f) => f.status === 'in_review').length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Resolvidos</p>
          <p className="text-2xl font-bold">{feedbacks.filter((f) => f.status === 'resolved').length}</p>
        </div>
      </div>

      {/* Feedbacks List */}
      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center text-muted-foreground">Nenhum feedback encontrado</div>
        ) : (
          filteredFeedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {feedback.users.avatar_url ? (
                    <img src={feedback.users.avatar_url} alt="" className="h-10 w-10 rounded-full" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 font-medium">
                        {feedback.users.email ? feedback.users.email[0].toUpperCase() : '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{feedback.users.display_name || 'Sem nome'}</p>
                    <p className="text-sm text-muted-foreground">{feedback.users.email}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                    {categoryLabels[feedback.category]}
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[feedback.status]}`}
                  >
                    {statusLabels[feedback.status]}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{feedback.message}</p>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Enviado em {formatDate(feedback.created_at)}</span>

                <div className="flex gap-2">
                  {feedback.status !== 'in_review' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(feedback.id, 'in_review')}
                      disabled={updatingId === feedback.id}
                    >
                      {updatingId === feedback.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Em Análise'}
                    </Button>
                  )}
                  {feedback.status !== 'resolved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(feedback.id, 'resolved')}
                      disabled={updatingId === feedback.id}
                      className="text-green-600 hover:text-green-700"
                    >
                      {updatingId === feedback.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resolver'}
                    </Button>
                  )}
                  {feedback.status !== 'dismissed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(feedback.id, 'dismissed')}
                      disabled={updatingId === feedback.id}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      {updatingId === feedback.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Descartar'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
