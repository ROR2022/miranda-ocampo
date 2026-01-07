// 🖼️ Hook para la galería de Cloudinary
// Maneja el estado y lógica de la galería colaborativa con Cloudinary

import { useState, useEffect, useCallback } from 'react';

// Interfaces
export interface CloudinaryPhoto {
  id: string;
  originalName: string;
  cloudinaryId: string;
  uploadedAt: string;
  uploaderName: string;
  eventMoment: string;
  comment: string;
  size: number;
  type: string;
  urls: {
    original: string;
    compressed: string;
    thumbnail: string;
    gallery: string;
    modal: string;
  };
  metadata: {
    width: number;
    height: number;
    format: string;
  };
}

export interface CloudinaryGalleryStats {
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
  totalSize: number;
}

export interface CloudinaryPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CloudinaryGalleryState {
  photos: CloudinaryPhoto[];
  loading: boolean;
  error: string | null;
  stats: CloudinaryGalleryStats | null;
  pagination: CloudinaryPagination | null;
  filters: {
    eventMoment: string;
    uploader: string;
    page: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

export const useCloudinaryGallery = () => {
  const [state, setState] = useState<CloudinaryGalleryState>({
    photos: [],
    loading: false,
    error: null,
    stats: null,
    pagination: null,
    filters: {
      eventMoment: 'all',
      uploader: 'all',
      page: 1,
      sortBy: 'created_at',
      sortOrder: 'desc',
    }
  });

  // Función para cargar fotos desde Cloudinary
  const loadPhotos = useCallback(async (newFilters?: Partial<typeof state.filters>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const currentFilters = { ...state.filters, ...newFilters };
      
      // Construir URL con parámetros
      const params = new URLSearchParams({
        page: currentFilters.page.toString(),
        limit: '20',
        sortBy: currentFilters.sortBy,
        sortOrder: currentFilters.sortOrder,
      });

      if (currentFilters.eventMoment !== 'all') {
        params.append('eventMoment', currentFilters.eventMoment);
      }

      if (currentFilters.uploader !== 'all') {
        params.append('uploader', currentFilters.uploader);
      }

      console.log('🖼️ Loading Cloudinary gallery with filters:', currentFilters);

      const response = await fetch(`/api/fotos-galeria-cloudinary?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Error loading gallery');
      }

      console.log('✅ Cloudinary gallery loaded:', {
        photos: result.data.photos.length,
        total: result.data.pagination.total
      });

      setState(prev => ({
        ...prev,
        photos: result.data.photos || [],
        stats: result.data.stats || null,
        pagination: result.data.pagination || null,
        filters: currentFilters,
        loading: false,
        error: null
      }));

      return result.data;

    } catch (error) {
      console.error('❌ Error loading Cloudinary gallery:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error cargando galería';

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      throw error;
    }
  }, [state]);

  // Función para obtener detalles de una foto específica
  const getPhotoDetails = useCallback(async (publicId: string) => {
    try {
      const response = await fetch('/api/fotos-galeria-cloudinary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Error getting photo details');
      }

      return result.data;
    } catch (error) {
      console.error('❌ Error getting photo details:', error);
      throw error;
    }
  }, []);

  // Función para cambiar filtros
  const setFilters = useCallback((newFilters: Partial<typeof state.filters>) => {
    setState(prev => {
      const updatedFilters = { ...prev.filters, ...newFilters };
      
      // Si cambian filtros que no sean página, resetear a página 1
      if (newFilters.eventMoment || newFilters.uploader || newFilters.sortBy || newFilters.sortOrder) {
        updatedFilters.page = 1;
      }

      return { ...prev, filters: updatedFilters };
    });
  }, [state]);

  // Función para cambiar página
  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, page } }));
  }, []);

  // Función para refrescar la galería
  const refresh = useCallback(() => {
    setState(prev => {
      loadPhotos();
      return prev;
    });
  }, [loadPhotos]);

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {
        eventMoment: 'all',
        uploader: 'all',
        page: 1,
        sortBy: 'created_at',
        sortOrder: 'desc',
      }
    }));
  }, []);

  // Función para limpiar error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Cargar fotos inicialmente y cuando cambien los filtros
  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  return {
    // Estado
    photos: state.photos,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    pagination: state.pagination,
    filters: state.filters,

    // Acciones
    loadPhotos,
    getPhotoDetails,
    setFilters,
    setPage,
    refresh,
    clearFilters,
    clearError,

    // Estado computado
    hasPhotos: state.photos.length > 0,
    isEmpty: !state.loading && state.photos.length === 0,
    isFirstPage: state.pagination?.page === 1,
    isLastPage: state.pagination ? state.pagination.page >= state.pagination.pages : true,
  };
};
