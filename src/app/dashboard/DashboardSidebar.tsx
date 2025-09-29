import { User } from 'lucide-react'; // Ícone de usuário
import LogoutButton from './LogoutButton';

// Definimos o tipo de usuário que o componente espera
type UserProps = {
  user: {
    email?: string;
  };
};

export default function DashboardSidebar({ user }: UserProps) {
  return (
    <aside className="w-full h-full bg-slate-50 p-6 flex flex-col">
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-6">Minha Conta</h2>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-slate-200 text-slate-600">
            <User size={20} />
          </div>
          <span className="text-sm text-slate-700 truncate">{user.email}</span>
        </div>
        {/* Você pode adicionar mais links aqui no futuro */}
        {/* Ex: <a href="/dashboard/settings">Configurações</a> */}
      </div>

      <div className="mt-auto">
        <LogoutButton />
      </div>
    </aside>
  );
}
