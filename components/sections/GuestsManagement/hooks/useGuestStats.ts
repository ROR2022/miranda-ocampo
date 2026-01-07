import { useState, useCallback } from 'react';
import { GuestStats, StatsResponse, GuestFilters } from '../types/guests.types';

export const useGuestStats = () => {
  const [stats, setStats] = useState<GuestStats | null>(null);
  const [loading, setLoading] = useState(false); // ✅ CAMBIADO: Inicia en false
  const [error, setError] = useState<string | null>(null);

  // ✅ Función para obtener estadísticas con filtros opcionales
  const fetchStats = useCallback(async (filters?: GuestFilters) => {
    try {
      setLoading(true);
      setError(null);

      // 🔄 Construir query parameters igual que en useGuests
      const params = new URLSearchParams();
      if (filters?.search?.trim()) {
        params.append('search', filters.search.trim());
      }
      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters?.relation && filters.relation !== 'all') {
        params.append('relation', filters.relation);
      }

      const url = `/api/guests/stats${params.toString() ? `?${params.toString()}` : ''}`;
      
      console.log('📊 [useGuestStats] Fetching stats with filters:', {
        url,
        filters: filters || 'no filters',
        timestamp: new Date().toISOString()
      });

      const response = await fetch(url);
      const result: StatsResponse = await response.json();

      if (result.success) {
        console.log('✅ [useGuestStats] Stats fetched successfully:', {
          totalGuests: result.data.overview.totalGuests,
          filters: filters || 'no filters'
        });
        setStats(result.data);
      } else {
        setError(result.error || 'Error al cargar estadísticas');
      }
    } catch (err) {
      setError('Error de conexión al cargar estadísticas');
      console.error('❌ [useGuestStats] Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Función para refrescar estadísticas (con filtros opcionales)
  const refresh = (filters?: GuestFilters) => {
    fetchStats(filters);
  };

  // Función para limpiar errores
  const clearError = () => {
    setError(null);
  };

  // ❌ CARGA AUTOMÁTICA ELIMINADA
  // Ya no cargamos estadísticas automáticamente al montar el componente
  
  // ❌ AUTO-REFRESH ELIMINADO
  // Ya no hay actualización automática cada 30 segundos

  return {
    // Estados
    stats,
    loading,
    error,
    
    // Funciones
    refresh,
    clearError,
    
    // Datos derivados para fácil acceso
    totalGuests: stats?.overview.totalGuests || 0,
    totalConfirmed: stats?.overview.totalConfirmed || 0,
    totalPending: stats?.overview.totalPending || 0,
    confirmationRate: stats?.overview.confirmationRate || 0,
    totalGuestCount: stats?.overview.totalGuestCount || 0,
    
    // Indicadores de estado
    hasData: stats !== null,
    isStale: stats ? (Date.now() - new Date(stats.generatedAt).getTime()) > 60000 : false, // Datos > 1 minuto
  };
};
