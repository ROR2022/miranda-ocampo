// 📸 useDinamicGallery - Hook para manejar la galería colaborativa

import { useState, useEffect, useCallback } from 'react';

export interface DinamicPhoto {
  id: string;
  originalName: string;
  fileName: string;
  uploadedAt: string;
  uploaderName: string;
  eventMoment: string;
  comment: string;
  size: number;
  type: string;
  paths: {
    original: string;
    compressed: string;
    thumbnail: string;
  };
  uploadId: string;
  uploadDate: string;
  uploadTimestamp: string;
}

export interface GalleryStats {
  totalPhotos: number;
  filteredPhotos: number;
  totalUploads: number;
  uploaders: string[];
  eventMoments: string[];
  lastUpdate: string | null;
  dateRange: {
    first: string | null;
    last: string | null;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UseDinamicGalleryState {
  photos: DinamicPhoto[];
  loading: boolean;
  error: string | null;
  stats: GalleryStats | null;
  pagination: Pagination | null;
  filters: {
    eventMoment: string;
    uploader: string;
    page: number;
  };
}

export const useDinamicGallery = () => {
  const [state, setState] = useState<UseDinamicGalleryState>({
    photos: [],
    loading: false,
    error: null,
    stats: null,
    pagination: null,
    filters: {
      eventMoment: 'all',
      uploader: 'all',
      page: 1
    }
  });

  // Función para cargar fotos
  const loadPhotos = useCallback(async (filters?: Partial<{
    eventMoment: string;
    uploader: string;
    page: number;
  }>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      setState(prev => {
        const currentFilters = { ...prev.filters, ...filters };
        
        // Construir URL con parámetros de query
        const params = new URLSearchParams({
          page: currentFilters.page.toString(),
          limit: '20', // 20 fotos por página
        });

        if (currentFilters.eventMoment !== 'all') {
          params.append('eventMoment', currentFilters.eventMoment);
        }

        if (currentFilters.uploader !== 'all') {
          params.append('uploader', currentFilters.uploader);
        }

        console.log('📸 Loading gallery photos with filters:', currentFilters);

        (async () => {
          try {
            const response = await fetch(`/api/fotos-galeria?${params}`);
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
              throw new Error(result.message || 'Error loading gallery');
            }

            console.log('✅ Gallery loaded:', result.data);

            setState(current => ({
              ...current,
              photos: result.data.photos || [],
              stats: result.data.stats || null,
              pagination: result.data.pagination || null,
              filters: currentFilters,
              loading: false,
              error: null
            }));

          } catch (error) {
            console.error('❌ Error loading gallery:', error);
            
            setState(current => ({
              ...current,
              loading: false,
              error: error instanceof Error ? error.message : 'Error cargando galería'
            }));
          }
        })();
        
        return prev;
      });

    } catch (error) {
      console.error('❌ Error loading gallery:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error cargando galería'
      }));
    }
  }, []);

  // Función para cambiar filtros
  const setFilters = useCallback((newFilters: Partial<{
    eventMoment: string;
    uploader: string;
    page: number;
  }>) => {
    setState(prev => {
      const updatedFilters = { ...prev.filters, ...newFilters };
      
      // Si cambia filtro, resetear a página 1
      if (newFilters.eventMoment || newFilters.uploader) {
        updatedFilters.page = 1;
      }

      return { ...prev, filters: updatedFilters };
    });
  }, []);

  // Función para cambiar página
  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, page } }));
  }, []);

  // Función para refrescar la galería
  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    // Usar el estado actual directamente
    setState(prev => {
      const currentFilters = prev.filters;
      
      // Reutilizar lógica de loadPhotos sin dependencias
      (async () => {
        try {
          const params = new URLSearchParams({
            page: currentFilters.page.toString(),
            limit: '20',
          });

          if (currentFilters.eventMoment !== 'all') {
            params.append('eventMoment', currentFilters.eventMoment);
          }

          if (currentFilters.uploader !== 'all') {
            params.append('uploader', currentFilters.uploader);
          }

          const response = await fetch(`/api/fotos-galeria?${params}`);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.message || 'Error loading gallery');
          }

          setState(current => ({
            ...current,
            photos: result.data.photos || [],
            stats: result.data.stats || null,
            pagination: result.data.pagination || null,
            loading: false,
            error: null
          }));

        } catch (error) {
          setState(current => ({
            ...current,
            loading: false,
            error: error instanceof Error ? error.message : 'Error cargando galería'
          }));
        }
      })();
      
      return prev;
    });
  }, []);

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {
        eventMoment: 'all',
        uploader: 'all',
        page: 1
      }
    }));
  }, []);

  // Cargar inicialmente
  useEffect(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    // Cargar fotos iniciales
    (async () => {
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '20',
        });

        const response = await fetch(`/api/fotos-galeria?${params}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Error loading gallery');
        }

        setState(prev => ({
          ...prev,
          photos: result.data.photos || [],
          stats: result.data.stats || null,
          pagination: result.data.pagination || null,
          loading: false,
          error: null
        }));

      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Error cargando galería'
        }));
      }
    })();
  }, []); // Solo una vez al montar

  // Recargar cuando cambien los filtros
  useEffect(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    setState(prev => {
      const currentFilters = prev.filters;
      
      (async () => {
        try {
          const params = new URLSearchParams({
            page: currentFilters.page.toString(),
            limit: '20',
          });

          if (currentFilters.eventMoment !== 'all') {
            params.append('eventMoment', currentFilters.eventMoment);
          }

          if (currentFilters.uploader !== 'all') {
            params.append('uploader', currentFilters.uploader);
          }

          const response = await fetch(`/api/fotos-galeria?${params}`);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.message || 'Error loading gallery');
          }

          setState(current => ({
            ...current,
            photos: result.data.photos || [],
            stats: result.data.stats || null,
            pagination: result.data.pagination || null,
            loading: false,
            error: null
          }));

        } catch (error) {
          setState(current => ({
            ...current,
            loading: false,
            error: error instanceof Error ? error.message : 'Error cargando galería'
          }));
        }
      })();
      
      return prev;
    });
  }, [state.filters]); // Cuando cambien los filtros

  return {
    photos: state.photos,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    pagination: state.pagination,
    filters: state.filters,
    setFilters,
    setPage,
    refresh,
    clearFilters,
    loadPhotos
  };
};
