'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Search, Shield, ShieldOff } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  display_name: string | null;
  role: 'user' | 'admin';
  subscription_tier: string;
  created_at: string;
  avatar_url: string | null;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter((user) => user.email.toLowerCase().includes(query) || user.display_name?.toLowerCase().includes(query))
      );
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');

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
        throw new Error(data.error || 'Erro ao carregar usuários');
      }

      const data = await response.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar usuários',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'usuário' : 'admin';
    const confirmed = window.confirm(`Tem certeza que deseja tornar este usuário ${newRole}?`);

    if (!confirmed) return;

    setTogglingUserId(userId);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Erro',
          description: data.error || 'Erro ao atualizar permissões',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: data.user.role } : user)));

      toast({
        title: 'Sucesso!',
        description: 'Permissões atualizadas com sucesso',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error toggling role:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar permissões',
        variant: 'destructive',
      });
    } finally {
      setTogglingUserId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-700';
      case 'pro':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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
        <h1 className="text-3xl font-bold mb-2">Gerenciar Usuários</h1>
        <p className="text-muted-foreground">Visualize e gerencie permissões de usuários</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por email ou nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total de Usuários</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Admins</p>
          <p className="text-2xl font-bold">{users.filter((u) => u.role === 'admin').length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Plano Pro</p>
          <p className="text-2xl font-bold">{users.filter((u) => u.subscription_tier === 'pro').length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Plano Enterprise</p>
          <p className="text-2xl font-bold">{users.filter((u) => u.subscription_tier === 'enterprise').length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissão</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Cadastro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full mr-3" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <span className="text-purple-600 font-medium text-sm">{user.email[0].toUpperCase()}</span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{user.display_name || 'Sem nome'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierBadgeColor(
                          user.subscription_tier
                        )}`}
                      >
                        {user.subscription_tier === 'enterprise'
                          ? 'Enterprise'
                          : user.subscription_tier === 'pro'
                          ? 'Pro'
                          : 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.role === 'admin' ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          'Usuário'
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleRole(user.id, user.role)}
                        disabled={togglingUserId === user.id}
                      >
                        {togglingUserId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : user.role === 'admin' ? (
                          <>
                            <ShieldOff className="h-4 w-4 mr-1" />
                            Remover Admin
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4 mr-1" />
                            Tornar Admin
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
