import { useState, useCallback, useEffect } from 'react';
import { Guest, GuestsResponse, GuestResponse, GuestFilters, GuestFormData } from '../types/guests.types';

export const useGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false); // ✅ CAMBIADO: Inicia en false
  const [error, setError] = useState<string | null>(null);
  
  // 🔄 NUEVO: Separar filtros temporales de los aplicados
  const [tempFilters, setTempFilters] = useState<GuestFilters>({
    search: '',
    status: 'all',
    relation: 'all'
  });
  
  const [appliedFilters, setAppliedFilters] = useState<GuestFilters>({
    search: '',
    status: 'all',
    relation: 'all'
  });

  // 🚀 NUEVO: Estados Load More (basado en patrón exitoso de galería)
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreGuests, setHasMoreGuests] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalGuests, setTotalGuests] = useState(0);

  // 🚀 FUNCIÓN MEJORADA: fetchGuests con soporte Load More
  const fetchGuests = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      // Solo mostrar loading principal si es carga inicial (no append)
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      // ✅ Usar appliedFilters para la API con paginación
      const params = new URLSearchParams();
      if (appliedFilters.search.trim()) {
        params.append('search', appliedFilters.search.trim());
      }
      if (appliedFilters.status !== 'all') {
        params.append('status', appliedFilters.status);
      }
      if (appliedFilters.relation !== 'all') {
        params.append('relation', appliedFilters.relation);
      }
      
      // 🚀 NUEVO: Paginación real (sin límite hardcodeado)
      params.append('page', page.toString());
      params.append('limit', '20'); // Límite optimizado para Load More

      // � DEBUG: Log para verificar filtros y paginación
      console.log('🔍 [useGuests] Fetching guests with Load More:', {
        search: appliedFilters.search,
        status: appliedFilters.status,
        relation: appliedFilters.relation,
        page: page,
        append: append,
        url: `/api/guests?${params.toString()}`
      });

      const response = await fetch(`/api/guests?${params.toString()}`);
      const result: GuestsResponse = await response.json();

      if (result.success) {
        // 🚀 NUEVO: Actualizar estados de paginación
        setTotalGuests(result.data.pagination.totalItems);
        setHasMoreGuests(result.data.pagination.hasNext);
        setCurrentPage(result.data.pagination.current);
        
        // 🚀 NUEVO: Append vs Replace basado en parámetro
        if (append) {
          setGuests(prev => [...prev, ...result.data.guests]);
          console.log('✅ [useGuests] More guests appended:', {
            previousCount: guests.length,
            newCount: guests.length + result.data.guests.length,
            addedCount: result.data.guests.length,
            hasMoreGuests: result.data.pagination.hasNext
          });
        } else {
          setGuests(result.data.guests);
          console.log('✅ [useGuests] Guests replaced:', {
            totalFound: result.data.pagination.totalItems,
            loadedCount: result.data.guests.length,
            hasMoreGuests: result.data.pagination.hasNext
          });
        }
      } else {
        setError(result.error || 'Error al cargar invitados');
      }
    } catch (err) {
      setError('Error de conexión al cargar invitados');
      console.error('❌ [useGuests] Error fetching guests:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false); // 🚀 NUEVO: Limpiar loading más también
    }
  }, [appliedFilters]); // ✅ Dependencia cambiada a appliedFilters

  // 🚀 NUEVA FUNCIÓN: Load More Guests (basada en patrón de galería)
  const loadMoreGuests = useCallback(async () => {
    if (loadingMore || !hasMoreGuests || loading) {
      console.log('🛑 [useGuests] Load more cancelled:', { loadingMore, hasMoreGuests, loading });
      return;
    }

    console.log('🚀 [useGuests] Loading more guests, page:', currentPage + 1);
    await fetchGuests(currentPage + 1, true); // append = true
  }, [currentPage, hasMoreGuests, loadingMore, loading, fetchGuests]);

  // Función para crear invitado
  const createGuest = async (guestData: GuestFormData): Promise<Guest | null> => {
    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestData),
      });

      const result: GuestResponse = await response.json();

      if (result.success) {
        // 🚀 MEJORADO: Refrescar la lista con reset de paginación
        setCurrentPage(1);
        setHasMoreGuests(true);
        setGuests([]); // Limpiar antes de recargar
        await fetchGuests(1, false);
        return result.data;
      } else {
        setError(result.error || 'Error al crear invitado');
        return null;
      }
    } catch (err) {
      setError('Error de conexión al crear invitado');
      console.error('Error creating guest:', err);
      return null;
    }
  };

  // Función para actualizar invitado
  const updateGuest = async (id: string, guestData: Partial<GuestFormData>): Promise<Guest | null> => {
    try {
      const response = await fetch(`/api/guests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestData),
      });

      const result: GuestResponse = await response.json();

      if (result.success) {
        // Actualizar la lista local
        setGuests(prev => prev.map(guest => 
          guest._id === id ? result.data : guest
        ));
        return result.data;
      } else {
        setError(result.error || 'Error al actualizar invitado');
        return null;
      }
    } catch (err) {
      setError('Error de conexión al actualizar invitado');
      console.error('Error updating guest:', err);
      return null;
    }
  };

  // Función para eliminar invitado
  const deleteGuest = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/guests/${id}`, {
        method: 'DELETE',
      });

      const result: GuestResponse = await response.json();

      if (result.success) {
        // Remover de la lista local
        setGuests(prev => prev.filter(guest => guest._id !== id));
        return true;
      } else {
        setError(result.error || 'Error al eliminar invitado');
        return false;
      }
    } catch (err) {
      setError('Error de conexión al eliminar invitado');
      console.error('Error deleting guest:', err);
      return false;
    }
  };

  // 🔄 Función para actualizar filtros temporales (UI)
  const updateTempFilters = (newFilters: Partial<GuestFilters>) => {
    console.log('🔄 Updating temp filters:', { 
      previous: tempFilters, 
      new: newFilters, 
      merged: { ...tempFilters, ...newFilters } 
    });
    setTempFilters(prev => ({ ...prev, ...newFilters }));
  };

  // � FUNCIÓN MEJORADA: Aplicar filtros con reset de paginación
  const applyFilters = () => {
    console.log('🚀 [useGuests] Applying filters with pagination reset:', tempFilters);
    setAppliedFilters(tempFilters);
    // � NUEVO: Reset paginación al aplicar filtros
    setCurrentPage(1);
    setHasMoreGuests(true);
    setGuests([]); // Limpiar lista para evitar duplicados
  };

  // 🚀 FUNCIÓN MEJORADA: Limpiar filtros con reset de paginación
  const clearFilters = () => {
    console.log('🧹 [useGuests] Clearing filters with pagination reset');
    const emptyFilters = { search: '', status: 'all' as const, relation: 'all' as const };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    // 🚀 NUEVO: Reset paginación al limpiar filtros
    setCurrentPage(1);
    setHasMoreGuests(true);
    setGuests([]); // Limpiar lista para evitar duplicados
  };

  // Función para limpiar errores
  const clearError = () => {
    setError(null);
  };

  // 🚀 FUNCIÓN MEJORADA: Refrescar datos con reset de paginación
  const refresh = () => {
    console.log('🔄 [useGuests] Refreshing data with pagination reset');
    setCurrentPage(1);
    setHasMoreGuests(true);
    setGuests([]); // Limpiar lista antes de cargar
    fetchGuests(1, false); // Cargar página 1, no append
  };

  // 🚀 MEJORADO: useEffect para ejecutar fetchGuests con Load More cuando appliedFilters cambian
  useEffect(() => {
    // Solo ejecutar si hay filtros aplicados o ya hay invitados cargados
    if (appliedFilters.search.trim() || appliedFilters.status !== 'all' || appliedFilters.relation !== 'all' || guests.length > 0) {
      console.log('🔄 [useGuests] Filters changed, fetching page 1');
      fetchGuests(1, false); // Siempre cargar página 1, no append
    }
  }, [appliedFilters.search, appliedFilters.status, appliedFilters.relation]);

  // ❌ CARGA AUTOMÁTICA ELIMINADA
  // Ya no cargamos datos automáticamente al montar el componente
  // El usuario decide cuándo cargar con el botón manual

  return {
    // Estados básicos
    guests,
    loading,
    error,
    tempFilters,        // ✅ Filtros temporales (UI)
    appliedFilters,     // ✅ Filtros aplicados (API)
    
    // 🚀 NUEVOS: Estados Load More
    currentPage,
    hasMoreGuests,
    loadingMore,
    totalGuests,        // ✅ Total real desde API (no guests.length)
    
    // Funciones CRUD
    createGuest,
    updateGuest,
    deleteGuest,
    
    // Funciones de control
    updateTempFilters,  // ✅ Para actualizar filtros en UI
    applyFilters,       // ✅ Para ejecutar la búsqueda
    clearFilters,       // ✅ Para limpiar filtros
    clearError,
    refresh,
    
    // 🚀 NUEVA: Función Load More
    loadMoreGuests,
    
    // Funciones derivadas (actualizadas)
    filteredGuests: guests, // Ya vienen filtrados del backend
    loadedGuests: guests.length, // ✅ Invitados cargados actualmente
    confirmedGuests: guests.filter(g => g.attendance?.confirmed).length,
    pendingGuests: guests.filter(g => g.status === 'pending').length,
    
    // ✅ Helper para saber si hay filtros pendientes de aplicar
    hasUnappliedChanges: JSON.stringify(tempFilters) !== JSON.stringify(appliedFilters),
  };
};
