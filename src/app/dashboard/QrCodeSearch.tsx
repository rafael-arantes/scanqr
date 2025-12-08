'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type SearchFilters = {
  searchTerm: string;
  dateFrom: string;
  dateTo: string;
};

type QrCodeSearchProps = {
  onSearchChange: (filters: SearchFilters) => void;
};

export default function QrCodeSearch({ onSearchChange }: QrCodeSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Debounce para não fazer busca a cada tecla digitada
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange({ searchTerm, dateFrom, dateTo });
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchTerm || dateFrom || dateTo;

  return (
    <div className="space-y-3 max-w-full">
      {/* Barra de Busca Principal */}
      <div className="flex gap-2 max-w-full">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por nome, URL destino ou URL curta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 w-full"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          title="Filtros avançados"
          className="shrink-0"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filtros Avançados (Expansível) */}
      {showFilters && (
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Filtros de Data</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                <X className="h-3 w-3 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="date-from" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                De:
              </label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="date-to" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Até:
              </label>
              <Input id="date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-sm" />
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            💡 Dica: Use a busca para filtrar por nome ou URL, e os filtros de data para encontrar QR Codes criados em períodos
            específicos
          </div>
        </div>
      )}
    </div>
  );
}
