"use client"
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, RefreshCw, Heart, Sparkles, Grid3X3, Table2, ChevronDown, MoreHorizontal } from 'lucide-react';
import { useGuests } from './hooks/useGuests';
import { useGuestStats } from './hooks/useGuestStats';
import { Guest, GuestFormData } from './types/guests.types';
import StatsCards from './components/StatsCards';
import SearchAndFilters from './components/SearchAndFilters';
import GuestCard from './components/GuestCard';
import GuestsTable from './components/GuestsTable';
import AddGuestForm from './components/AddGuestForm';
import EditGuestForm from './components/EditGuestForm';
import DeleteConfirmation from './components/DeleteConfirmation';

/**
 * Componente para gestionar los invitados
 * Dashboard básico para administrar invitaciones y confirmaciones de asistencia
 * para la quinceañera de Fernanda
 */

const GuestsManagement = () => {
  const {
    guests,
    loading,
    error,
    tempFilters,          // ✅ Filtros temporales (UI)
    appliedFilters,       // ✅ Filtros aplicados (API)
    updateTempFilters,    // ✅ Para actualizar UI
    applyFilters,         // ✅ Para ejecutar búsqueda
    clearFilters,         // ✅ Para limpiar filtros
    hasUnappliedChanges,  // ✅ Para indicador visual
    refresh,
    clearError,
    createGuest,
    updateGuest,
    deleteGuest,
    // 🚀 NUEVOS: Estados y funciones Load More
    currentPage,
    hasMoreGuests,
    loadingMore,
    totalGuests,
    loadedGuests,
    loadMoreGuests
  } = useGuests();

  // Hook para estadísticas
  const {
    refresh: refreshStats,
    loading: statsLoading,
    error: statsError,
    totalGuests: statsTotalGuests,
    totalConfirmed: statsTotalConfirmed,
    totalPending: statsTotalPending,
    confirmationRate: statsConfirmationRate,
    totalGuestCount: statsTotalGuestCount
  } = useGuestStats();

  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const router = useRouter();


  //necesito ejecutar una carga inicial solo cuando el usuario
  // entra por primera vez a la página
  useEffect(() => {
    refresh(); // Cargar invitados inicialmente
    refreshStats({ search: '', status: 'all', relation: 'all' }); // Cargar estadísticas inicialmente
  }, []);

  // ✅ Función combinada para actualizar invitados y estadísticas CON FILTROS
  const handleRefreshAll = useCallback(async () => {
    console.log('🔄 Refreshing data with applied filters:', appliedFilters);
    refresh(); // Actualizar lista de invitados (ya usa appliedFilters)
    refreshStats(appliedFilters); // ✅ Actualizar estadísticas con mismos filtros
  }, [refresh, refreshStats, appliedFilters]);

  // ✅ CARGA MANUAL: Usuario controla cuándo cargar datos
  // No hay useEffect automático - el usuario debe usar el botón "Cargar Invitados"
  // o aplicar filtros para ejecutar búsquedas

  // ✅ Función para aplicar filtros Y actualizar estadísticas
  const handleApplyFilters = useCallback(() => {
    console.log('🚀 Applying filters and updating stats:', tempFilters);
    applyFilters(); // Aplicar filtros a la lista
    
    // ✅ Actualizar estadísticas manualmente DESPUÉS de aplicar filtros
    setTimeout(() => {
      refreshStats(tempFilters);
    }, 100); // Pequeño delay para asegurar que appliedFilters se actualice
  }, [applyFilters, tempFilters, refreshStats]);

  // ✅ Función para limpiar filtros Y actualizar estadísticas  
  const handleClearFilters = useCallback(() => {
    console.log('🧹 Clearing filters and updating stats');
    clearFilters(); // Limpiar filtros
    
    // ✅ Actualizar estadísticas manualmente DESPUÉS de limpiar filtros
    setTimeout(() => {
      refreshStats({ search: '', status: 'all', relation: 'all' });
    }, 100);
  }, [clearFilters, refreshStats]);

  // ❌ REMOVIDO: useEffect que causaba loop infinito
  // Las estadísticas se actualizan manualmente en las funciones específicas
 
  // 🚀 MEJORADO: Determinar estados de loading (principal vs Load More)
  const isLoading = loading || statsLoading;
  const isLoadingAny = isLoading || loadingMore;

  const handleViewGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    // TODO: Abrir modal de detalles expandido
    console.log('Ver detalles de:', guest);
    router.push(`/invitados/${guest._id}`);
  };

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowEditForm(true);
  };

  const handleDeleteGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowDeleteConfirmation(true);
  };

  const handleAddGuest = () => {
    setShowAddForm(true);
  };

  // Handlers para los modales con actualización de estadísticas
  const handleAddSubmit = async (data: GuestFormData): Promise<boolean> => {
    try {
      const result = await createGuest(data);
      // 🚀 NUEVO: Actualizar estadísticas después de crear invitado
      if (result !== null) {
        refreshStats(appliedFilters);
      }
      return result !== null;
    } catch (error) {
      console.error('Error al agregar invitado:', error);
      return false;
    }
  };

  const handleEditSubmit = async (id: string, data: Partial<GuestFormData>): Promise<boolean> => {
    try {
      const result = await updateGuest(id, data);
      // 🚀 NUEVO: Actualizar estadísticas después de editar invitado
      if (result !== null) {
        refreshStats(appliedFilters);
      }
      return result !== null;
    } catch (error) {
      console.error('Error al actualizar invitado:', error);
      return false;
    }
  };

  const handleDeleteConfirm = async (id: string): Promise<boolean> => {
    try {
      const result = await deleteGuest(id);
      // 🚀 NUEVO: Actualizar estadísticas después de eliminar invitado
      if (result) {
        refreshStats(appliedFilters);
      }
      return result;
    } catch (error) {
      console.error('Error al eliminar invitado:', error);
      return false;
    }
  };

  return (
    <section className="relative min-h-screen py-12 px-4">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-10 w-32 h-32 opacity-15 animate-vip-float-aurora"
          style={{ color: 'var(--color-aurora-rosa)' }}
        >
          <Heart className="w-full h-full" />
        </div>
        <div 
          className="absolute bottom-20 right-16 w-24 h-24 opacity-10 animate-vip-pulse-aurora"
          style={{ color: 'var(--color-aurora-lavanda)' }}
        >
          <Sparkles className="w-full h-full" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-lg animate-vip-pulse-aurora"
               style={{ 
                 background: "linear-gradient(135deg, var(--color-aurora-lavanda), var(--color-aurora-rosa))",
               }}>
            <Users className="w-10 h-10 text-black" />
          </div>
          
          <h1
            className="text-4xl text-purple-600 md:text-5xl font-bold mb-4 leading-tight"
            style={{ 
              background: "linear-gradient(135deg, var(--color-aurora-lavanda), var(--color-aurora-rosa))",
              WebkitBackgroundClip: "text",
              //WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            🎉 Gestión de Invitados
          </h1>
          
          <p className="text-xl leading-relaxed max-w-2xl mx-auto mb-8" 
             style={{ color: "var(--color-aurora-rosa)" }}>
            Administra las invitaciones y confirmaciones de tus Invitados.
            {/* <span className="font-bold"> Fernanda Pérez Benítez</span> */}
          </p>

          {/* Botón de actualización manual */}
          <div className="flex justify-center mb-8">
            <button
              onClick={handleRefreshAll}
              disabled={isLoading}
              className="inline-flex text-purple-900 items-center gap-3 px-8 py-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
              style={{
                background: isLoading 
                  ? 'rgba(230, 217, 255, 0.2)' 
                  : 'linear-gradient(135deg, var(--color-aurora-oro), #f59e0b)',
                borderColor: 'var(--color-aurora-oro)',
                //color: loading ? 'var(--color-aurora-oro)' : 'white'
              }}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-lg font-semibold">
                {isLoading ? 'Actualizando...' : guests.length === 0 ? 'Cargar Invitados' : 'Actualizar Lista'}
              </span>
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <StatsCards 
          totalGuests={statsTotalGuests}
          totalConfirmed={statsTotalConfirmed}
          totalPending={statsTotalPending}
          confirmationRate={statsConfirmationRate}
          totalGuestCount={statsTotalGuestCount}
          loading={statsLoading}
          error={statsError}
        />

        {/* Mensaje de error */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl border-2 border-red-200 bg-red-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-red-600">❌</span>
              <p className="text-red-600">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Búsqueda y filtros */}
        <SearchAndFilters
          filters={tempFilters}           // ✅ Pasar filtros temporales
          onFiltersChange={updateTempFilters}  // ✅ Usar función temporal
          onApplyFilters={handleApplyFilters}   // ✅ Usar nueva función sincronizada
          onClearFilters={handleClearFilters}   // ✅ Usar nueva función sincronizada
          hasUnappliedChanges={hasUnappliedChanges} // ✅ Para indicador visual
          totalResults={guests.length}
          loading={loading}
        />

        {/* Acciones principales */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddGuest}
              disabled={loading}
              className="inline-flex text-slate-600 items-center gap-3 px-6 py-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--color-aurora-lavanda), var(--color-aurora-rosa))',
                borderColor: 'var(--color-aurora-rosa)',
                //color: 'white'
              }}
            >
              <UserPlus className="w-5 h-5" />
              <span className="font-semibold">Agregar Invitado</span>
            </button>
          </div>

          {/* Toggle de Vista */}
          <div className="flex items-center gap-2">
            <div 
              className="flex items-center rounded-xl border-2 p-1"
              style={{
                background: 'rgba(230, 217, 255, 0.1)',
                borderColor: 'var(--color-aurora-lavanda)'
              }}
            >
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'cards' 
                    ? 'text-slate-600 shadow-lg' 
                    : 'text-purple-600 hover:bg-white/50'
                }`}
                style={{
                  background: viewMode === 'cards' 
                    ? 'linear-gradient(135deg, var(--color-aurora-lavanda), var(--color-aurora-rosa))'
                    : 'transparent'
                }}
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="text-sm font-medium">Tarjetas</span>
              </button>
              
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'table' 
                    ? 'text-slate-600 shadow-lg' 
                    : 'text-purple-600 hover:bg-white/50'
                }`}
                style={{
                  background: viewMode === 'table' 
                    ? 'linear-gradient(135deg, var(--color-aurora-lavanda), var(--color-aurora-rosa))'
                    : 'transparent'
                }}
              >
                <Table2 className="w-4 h-4" />
                <span className="text-sm font-medium">Tabla</span>
              </button>
            </div>
          </div>
        </div>

{/* 🚀 NUEVA SECCIÓN: Load More y Progress Indicators */}
          {guests.length > 0 && (
            <div className="mt-8 space-y-4">
              {/* Load More Button */}
              {hasMoreGuests && !loading && (
                <div className="text-center">
                  <button
                    onClick={loadMoreGuests}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
                    style={{
                      background: loadingMore 
                        ? 'rgba(230, 217, 255, 0.2)' 
                        : 'linear-gradient(135deg, var(--color-aurora-lavanda), var(--color-aurora-rosa))',
                      borderColor: 'var(--color-aurora-lavanda)',
                      color: loadingMore ? 'var(--color-aurora-lavanda)' : 'white'
                    }}
                  >
                    {loadingMore ? (
                      <>
                        <MoreHorizontal className="w-5 h-5 animate-pulse" />
                        <span className="text-lg font-semibold">Cargando más invitados...</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-5 h-5" />
                        <span className="text-lg font-semibold text-black">
                          Ver más invitados ({totalGuests - loadedGuests} restantes)
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Progress Indicator */}
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--color-aurora-lavanda)' }}>
                  Mostrando {loadedGuests} de {totalGuests} invitados
                  {appliedFilters.search || appliedFilters.status !== 'all' || appliedFilters.relation !== 'all' 
                    ? ' (filtrados)' 
                    : ''
                  }
                </p>
                
                {/* Progress Bar */}
                <div 
                  className="w-full max-w-md mx-auto mt-2 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(230, 217, 255, 0.3)' }}
                >
                  <div 
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${totalGuests > 0 ? (loadedGuests / totalGuests) * 100 : 0}%`,
                      background: 'linear-gradient(90deg, var(--color-aurora-lavanda), var(--color-aurora-rosa))'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        {/* Lista de invitados */}
        <div className="space-y-6">
          {loading && guests.length === 0 ? (
            // Skeleton loading
            viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-100 to-gray-200 h-64"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-pulse">
                <div className="rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 h-96"></div>
              </div>
            )
          ) : guests.length > 0 ? (
            // Lista de invitados según el modo de vista
            viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guests.map((guest) => (
                  <GuestCard
                    key={guest._id}
                    guest={guest}
                    onView={handleViewGuest}
                    onEdit={handleEditGuest}
                    onDelete={handleDeleteGuest}
                  />
                ))}
              </div>
            ) : (
              <GuestsTable
                guests={guests}
                onView={handleViewGuest}
                onEdit={handleEditGuest}
                onDelete={handleDeleteGuest}
              />
            )
          ) : (
            // Estado vacío - Diferenciamos entre nunca cargado y sin resultados
            <div className="text-center py-16">
              <div 
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 opacity-50"
                style={{ backgroundColor: 'rgba(230, 217, 255, 0.3)' }}
              >
                <Users className="w-10 h-10" style={{ color: 'var(--color-aurora-lavanda)' }} />
              </div>
              
              <h3 
                className="text-2xl font-bold mb-4"
                style={{ color: 'var(--color-aurora-lavanda)' }}
              >
                {!loading && guests.length === 0 && !appliedFilters.search && appliedFilters.status === 'all' && appliedFilters.relation === 'all'
                  ? 'Lista de Invitados'
                  : 'No hay invitados registrados'
                }
              </h3>
              
              <p className="text-lg mb-8" style={{ color: 'var(--color-aurora-rosa)' }}>
                {!loading && guests.length === 0 && !appliedFilters.search && appliedFilters.status === 'all' && appliedFilters.relation === 'all'
                  ? 'Haz clic en "Cargar Invitados" para ver la lista completa o agrega tu primer invitado'
                  : appliedFilters.search || appliedFilters.status !== 'all' || appliedFilters.relation !== 'all'
                    ? 'No se encontraron invitados con los filtros aplicados'
                    : 'Comienza agregando tu primer invitado para la quinceañera'
                }
              </p>
              
              {(!appliedFilters.search && appliedFilters.status === 'all' && appliedFilters.relation === 'all') && (
                <button
                  onClick={handleAddGuest}
                  className="bg-slate-200 inline-flex items-center gap-3 px-8 py-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{
                    //background: 'linear-gradient(135deg, var(--color-aurora-lavanda), var(--color-aurora-rosa))',
                    //borderColor: 'var(--color-aurora-rosa)',
                    //color: 'white'
                  }}
                >
                  <UserPlus className="w-6 h-6" />
                  <span className="text-lg font-semibold text-black">Agregar Primer Invitado</span>
                </button>
              )}
            </div>
          )}

          {/* 🚀 NUEVA SECCIÓN: Load More y Progress Indicators */}
          {guests.length > 0 && (
            <div className="mt-8 space-y-4">
              {/* Load More Button */}
              {hasMoreGuests && !loading && (
                <div className="text-center">
                  <button
                    onClick={loadMoreGuests}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
                    style={{
                      background: loadingMore 
                        ? 'rgba(230, 217, 255, 0.2)' 
                        : 'linear-gradient(135deg, var(--color-aurora-lavanda), var(--color-aurora-rosa))',
                      borderColor: 'var(--color-aurora-lavanda)',
                      color: loadingMore ? 'var(--color-aurora-lavanda)' : 'white'
                    }}
                  >
                    {loadingMore ? (
                      <>
                        <MoreHorizontal className="w-5 h-5 animate-pulse" />
                        <span className="text-lg font-semibold">Cargando más invitados...</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-5 h-5" />
                        <span className="text-lg font-semibold text-black">
                          Ver más invitados ({totalGuests - loadedGuests} restantes)
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Progress Indicator */}
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--color-aurora-lavanda)' }}>
                  Mostrando {loadedGuests} de {totalGuests} invitados
                  {appliedFilters.search || appliedFilters.status !== 'all' || appliedFilters.relation !== 'all' 
                    ? ' (filtrados)' 
                    : ''
                  }
                </p>
                
                {/* Progress Bar */}
                <div 
                  className="w-full max-w-md mx-auto mt-2 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(230, 217, 255, 0.3)' }}
                >
                  <div 
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${totalGuests > 0 ? (loadedGuests / totalGuests) * 100 : 0}%`,
                      background: 'linear-gradient(90deg, var(--color-aurora-lavanda), var(--color-aurora-rosa))'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales CRUD */}
      <AddGuestForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddSubmit}
        loading={loading}
      />

      <EditGuestForm
        isOpen={showEditForm}
        guest={selectedGuest}
        onClose={() => {
          setShowEditForm(false);
          setSelectedGuest(null);
        }}
        onSubmit={handleEditSubmit}
        loading={loading}
      />

      <DeleteConfirmation
        isOpen={showDeleteConfirmation}
        guest={selectedGuest}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setSelectedGuest(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={loading}
      />
    </section>
  );
};

export default GuestsManagement;