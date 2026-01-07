import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { GuestFilters, STATUS_OPTIONS, RELATION_OPTIONS } from '../types/guests.types';

interface SearchAndFiltersProps {
  filters: GuestFilters;
  onFiltersChange: (filters: Partial<GuestFilters>) => void;
  onApplyFilters?: () => void;        // ✅ Nueva prop para aplicar filtros
  onClearFilters?: () => void;        // ✅ Nueva prop para limpiar filtros
  hasUnappliedChanges?: boolean;      // ✅ Para indicador visual
  totalResults: number;
  loading?: boolean;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,           // ✅ Nueva prop
  onClearFilters,           // ✅ Nueva prop
  hasUnappliedChanges = false, // ✅ Nueva prop
  totalResults,
  loading = false
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ status: e.target.value as GuestFilters['status'] });
  };

  const handleRelationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ relation: e.target.value as GuestFilters['relation'] });
  };

  const clearFilters = () => {
    // ✅ Usar la función del hook si está disponible, sino usar la local
    if (onClearFilters) {
      onClearFilters();
    } else {
      onFiltersChange({
        search: '',
        status: 'all',
        relation: 'all'
      });
    }
  };

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.relation !== 'all';

  return (
    <div className="mb-8">
      {/* Contenedor principal */}
      <div 
        className="rounded-2xl p-6 border-2 shadow-lg backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(253, 252, 252, 0.95) 0%, rgba(248, 246, 240, 0.95) 100%)',
          borderColor: 'rgba(230, 217, 255, 0.4)'
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="p-2 rounded-xl shadow-md animate-vip-pulse-aurora"
            style={{ backgroundColor: 'var(--color-aurora-lavanda)' }}
          >
            <Filter className="w-5 h-5 text-black" />
          </div>
          <h3 
            className="text-lg text-purple-600 font-semibold"
            //style={{ color: 'var(--color-aurora-lavanda)' }}
          >
            Buscar y Filtrar Invitados
          </h3>
          
          {/* Contador de resultados */}
          <div className="ml-auto">
            <span 
              className="text-sm text-pink-600 font-medium px-3 py-1 rounded-full"
              style={{ 
                backgroundColor: 'rgba(230, 217, 255, 0.3)',
                //color: 'var(--color-aurora-lavanda)'
              }}
            >
              {loading ? 'Cargando...' : `${totalResults} resultados`}
            </span>
          </div>
        </div>

        {/* Controles de filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda por nombre */}
          <div className="relative">
            <label 
              className="block text-purple-500 text-sm font-medium mb-2"
              //style={{ color: 'var(--color-aurora-lavanda)' }}
            >
              Buscar por nombre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 opacity-60" style={{ color: 'var(--color-aurora-lavanda)' }} />
              </div>
              <input
                type="text"
                value={filters.search}
                onChange={handleSearchChange}
                placeholder="Buscar invitado..."
                disabled={loading}
                className="w-full text-black pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none disabled:opacity-50"
                style={{
                  background: 'rgba(253, 252, 252, 0.8)',
                  borderColor: 'rgba(230, 217, 255, 0.4)',
                  //color: 'var(--color-aurora-lavanda)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-aurora-rosa)';
                  e.target.style.boxShadow = '0 0 20px rgba(255, 179, 217, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(230, 217, 255, 0.4)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div>
            <label 
              className="block text-purple-500 text-sm font-medium mb-2"
              //style={{ color: 'var(--color-aurora-lavanda)' }}
            >
              Estado
            </label>
            <select
              value={filters.status}
              onChange={handleStatusChange}
              disabled={loading}
              className="w-full text-black px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none disabled:opacity-50"
              style={{
                background: 'rgba(253, 252, 252, 0.8)',
                borderColor: 'rgba(230, 217, 255, 0.4)',
                //color: 'var(--color-aurora-lavanda)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-aurora-rosa)';
                e.target.style.boxShadow = '0 0 20px rgba(255, 179, 217, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(230, 217, 255, 0.4)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por relación */}
          <div>
            <label 
              className="block text-purple-500 text-sm font-medium mb-2"
              //style={{ color: 'var(--color-aurora-lavanda)' }}
            >
              Relación
            </label>
            <select
              value={filters.relation}
              onChange={handleRelationChange}
              disabled={loading}
              className="w-full text-black px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none disabled:opacity-50"
              style={{
                background: 'rgba(253, 252, 252, 0.8)',
                borderColor: 'rgba(230, 217, 255, 0.4)',
                //color: 'var(--color-aurora-lavanda)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-aurora-rosa)';
                e.target.style.boxShadow = '0 0 20px rgba(255, 179, 217, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(230, 217, 255, 0.4)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="all">Todas las relaciones</option>
              {RELATION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-4 flex justify-between items-center gap-4">
          {/* Indicador de cambios pendientes */}
          {hasUnappliedChanges && onApplyFilters && (
            <div className="text-sm text-amber-600 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              Hay cambios sin aplicar
            </div>
          )}
          
          {/* Spacer para centrar botones cuando no hay indicador */}
          {(!hasUnappliedChanges || !onApplyFilters) && <div></div>}

          {/* Botones */}
          <div className="flex gap-3">
            {/* Botón Aplicar Filtros */}
            {onApplyFilters && (
              <button
                onClick={onApplyFilters}
                disabled={loading || !hasUnappliedChanges}
                className={`inline-flex items-center gap-2 px-6 py-2 rounded-xl border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none font-medium ${
                  hasUnappliedChanges 
                    ? 'text-black shadow-lg' 
                    : 'text-purple-600'
                }`}
                style={{
                  backgroundColor: '#ffb3d9',
                  borderColor: '#ffb3d9'
                }}
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Aplicar filtros</span>
              </button>
            )}

            {/* Botón limpiar filtros */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                disabled={loading}
                className="inline-flex text-blue-700 items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none"
                style={{
                  background: 'rgba(255, 179, 217, 0.1)',
                  borderColor: 'var(--color-aurora-rosa)',
                }}
              >
                <X className="w-4 h-4" />
                <span className="text-sm font-medium">Limpiar filtros</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilters;
