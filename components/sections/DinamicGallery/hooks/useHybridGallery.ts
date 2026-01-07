// 🖼️ useHybridGallery - Hook híbrido para mostrar fotos desde MongoDB
// Migrado para usar MongoDB como fuente única de verdad manteniendo la misma interfaz

import { useState, useCallback, useEffect } from 'react';

// Interface para la respuesta de la API de MongoDB
interface MongoDBPhotoResponse {
  _id: string;
  originalName: string;
  uploader: {
    name: string;
  };
  uploadedAt: string;
  fileSize: number;
  eventMoment: string;
  comment?: string;
  displayUrl?: string;
  cloudinaryUrl?: string;
  localPath?: string;
  optimizedThumbnailUrl?: string;
  thumbnailUrl?: string;
  uploadSource: 'cloudinary' | 'original';
  filename: string;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
  };
  viewCount: number;
  status: string;
  isPublic: boolean;
}

// Interface para el sistema de fallback
interface FallbackPhotoResponse {
  id: string;
  originalName: string;
  uploaderName?: string;
  uploadedAt: string;
  size: number;
  eventMoment?: string;
  comment?: string;
  paths?: {
    original: string;
    compressed?: string;
    thumbnail?: string;
  };
}

// Interfaces para la galería híbrida (actualizadas para MongoDB)
interface HybridPhoto {
  id: string;
  originalName: string;
  uploaderName: string;
  uploadedAt: string;
  size: number;
  eventMoment: string;
  comment?: string;
  // URLs optimizadas desde MongoDB
  displayUrl: string;        // URL principal para mostrar
  thumbnailUrl?: string;     // URL del thumbnail
  source: 'cloudinary' | 'local'; // Fuente de storage
  // Datos adicionales de MongoDB
  filename: string;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
  };
  viewCount?: number;
  status: string;
  isPublic: boolean;
}

interface HybridGalleryStats {
  totalPhotos: number;
  uploaders: string[];
  eventMoments: string[];
  sourceBreakdown: {
    cloudinary: number;
    local: number;
  };
  totalViews: number;
}

interface HybridGalleryFilters {
  eventMoment: string;
  uploader: string;
  source: 'all' | 'cloudinary' | 'local';
  sortBy: 'uploadedAt' | 'viewCount' | 'originalName';
  sortOrder: 'asc' | 'desc';
}

interface HybridGalleryPagination {
  page: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
  total: number;
}

interface HybridGalleryState {
  photos: HybridPhoto[];
  loading: boolean;
  error: string | null;
  stats: HybridGalleryStats | null;
  pagination: HybridGalleryPagination | null;
  filters: HybridGalleryFilters;
  // 🗑️ Estados para eliminación de fotos
  deletingPhotos: string[]; // IDs de fotos siendo eliminadas
  deleteError: string | null;
  // 🆕 Estados para Load More y refresh manual
  loadingMore: boolean;        // Cargando más fotos
  hasMorePhotos: boolean;      // Hay más fotos disponibles
  currentPage: number;         // Página actual
  totalPhotos: number;         // Total de fotos en la galería
  lastRefreshTime: number;     // Timestamp del último refresh
  newPhotosAvailable: number;  // Fotos nuevas detectadas
}

/**
 * Hook para manejar galería híbrida desde MongoDB
 * Migrado para usar MongoDB como fuente única de verdad
 */
export const useHybridGallery = () => {
  const [state, setState] = useState<HybridGalleryState>({
    photos: [],
    loading: false,
    error: null,
    stats: null,
    pagination: null,
    filters: {
      eventMoment: 'all',
      uploader: 'all',
      source: 'all',
      sortBy: 'uploadedAt',
      sortOrder: 'desc'
    },
    // 🗑️ Estados iniciales para eliminación
    deletingPhotos: [],
    deleteError: null,
    // 🆕 Estados iniciales para Load More y refresh manual
    loadingMore: false,
    hasMorePhotos: true,
    currentPage: 1,
    totalPhotos: 0,
    lastRefreshTime: Date.now(),
    newPhotosAvailable: 0
  });

  /**
   * 🔄 Fallback al sistema anterior si MongoDB no está disponible
   */
  const fallbackToOriginalSystems = useCallback(async (): Promise<{ photos: HybridPhoto[], pagination: HybridGalleryPagination }> => {
    console.warn('📁 MongoDB unavailable, using original system fallback');
    
    try {
      // Intentar obtener del sistema original
      const response = await fetch('/api/fotos-galeria', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const photos: HybridPhoto[] = (data.photos || []).map((photo: FallbackPhotoResponse): HybridPhoto => ({
          id: `fallback-${photo.id}`,
          originalName: photo.originalName,
          uploaderName: photo.uploaderName || 'Invitado',
          uploadedAt: photo.uploadedAt,
          size: photo.size,
          eventMoment: photo.eventMoment || 'general',
          comment: photo.comment,
          displayUrl: photo.paths?.compressed || photo.paths?.original || '/placeholder.jpg',
          thumbnailUrl: photo.paths?.thumbnail,
          source: 'local',
          filename: photo.originalName,
          mimeType: 'image/jpeg', // Default fallback
          dimensions: { width: 0, height: 0 }, // Unknown dimensions
          viewCount: 0,
          status: 'ready',
          isPublic: true
        }));

        return {
          photos,
          pagination: {
            page: 1,
            pages: 1,
            hasNext: false,
            hasPrev: false,
            total: photos.length
          }
        };
      }
    } catch (error) {
      console.error('Fallback also failed:', error);
    }

    // Si todo falla, retornar vacío
    return {
      photos: [],
      pagination: {
        page: 1,
        pages: 1,
        hasNext: false,
        hasPrev: false,
        total: 0
      }
    };
  }, []);

  /**
   * 🆕 Obtiene fotos desde MongoDB API
   */
  const fetchPhotosFromMongoDB = useCallback(async (page = 1, limit = 20): Promise<{ photos: HybridPhoto[], pagination: HybridGalleryPagination }> => {
    try {
      // Construir query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: state.filters.sortBy,
        sortOrder: state.filters.sortOrder,
        isPublic: 'true',
        status: 'ready'
      });

      // Filtros opcionales
      if (state.filters.eventMoment !== 'all') {
        queryParams.append('eventMoment', state.filters.eventMoment);
      }
      if (state.filters.uploader !== 'all') {
        queryParams.append('uploaderName', state.filters.uploader);
      }
      if (state.filters.source !== 'all') {
        queryParams.append('uploadSource', state.filters.source === 'local' ? 'original' : state.filters.source);
      }

      const response = await fetch(`/api/photos?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Convertir respuesta de MongoDB a formato híbrido
      const photos: HybridPhoto[] = (data.photos || []).map((photo: MongoDBPhotoResponse): HybridPhoto => ({
        id: photo._id,
        originalName: photo.originalName,
        uploaderName: photo.uploader?.name || 'Invitado',
        uploadedAt: photo.uploadedAt,
        size: photo.fileSize,
        eventMoment: photo.eventMoment || 'general',
        comment: photo.comment,
        displayUrl: photo.displayUrl || photo.cloudinaryUrl || photo.localPath || '/placeholder.jpg',
        thumbnailUrl: photo.optimizedThumbnailUrl || photo.thumbnailUrl,
        source: photo.uploadSource === 'original' ? 'local' : 'cloudinary',
        filename: photo.filename,
        mimeType: photo.mimeType,
        dimensions: photo.dimensions,
        viewCount: photo.viewCount || 0,
        status: photo.status,
        isPublic: photo.isPublic
      }));

      const pagination: HybridGalleryPagination = {
        page: data.pagination?.page || 1,
        pages: data.pagination?.totalPages || 1,
        hasNext: data.pagination?.hasNext || false,
        hasPrev: data.pagination?.hasPrev || false,
        total: data.pagination?.total || photos.length
      };

      return { photos, pagination };

    } catch (error) {
      console.error('Error fetching photos from MongoDB:', error);
      // 🔄 Fallback: Intentar sistema anterior si MongoDB falla
      return await fallbackToOriginalSystems();
    }
  }, [state.filters.sortBy, state.filters.sortOrder, state.filters.eventMoment, state.filters.uploader, state.filters.source, fallbackToOriginalSystems]);

  /**
   * 🆕 Obtiene estadísticas desde MongoDB
   */
  const fetchStatsFromMongoDB = useCallback(async (): Promise<HybridGalleryStats> => {
    try {
      const response = await fetch('/api/photos/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        totalPhotos: data.totalPhotos || 0,
        uploaders: data.uploaders || [],
        eventMoments: data.eventMoments || [],
        sourceBreakdown: {
          cloudinary: data.sourceBreakdown?.cloudinary || 0,
          local: data.sourceBreakdown?.local || 0
        },
        totalViews: data.totalViews || 0
      };

    } catch (error) {
      console.error('Error fetching stats from MongoDB:', error);
      // Fallback stats
      return {
        totalPhotos: 0,
        uploaders: [],
        eventMoments: [],
        sourceBreakdown: { cloudinary: 0, local: 0 },
        totalViews: 0
      };
    }
  }, []);

  /**
   * 🆕 Carga fotos desde MongoDB (página inicial o refresh completo)
   */
  const loadPhotos = useCallback(async (page = 1) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Obtener fotos y estadísticas en paralelo
      const [{ photos, pagination }, stats] = await Promise.all([
        fetchPhotosFromMongoDB(page),
        fetchStatsFromMongoDB()
      ]);

      setState(prev => ({
        ...prev,
        photos, // ✅ Replace completo (no append)
        stats,
        pagination,
        loading: false,
        // 🆕 Actualizar estados de Load More
        currentPage: page,
        totalPhotos: pagination.total,
        hasMorePhotos: pagination.hasNext,
        lastRefreshTime: Date.now(),
        newPhotosAvailable: 0 // Reset después de cargar
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido al cargar fotos'
      }));
    }
  }, [fetchPhotosFromMongoDB, fetchStatsFromMongoDB]);

  /**
   * 🆕 Carga más fotos (Load More functionality)
   */
  const loadMorePhotos = useCallback(async () => {
    // Validaciones de seguridad
    if (state.loadingMore || !state.hasMorePhotos || state.loading) {
      console.warn('Load More aborted:', { 
        loadingMore: state.loadingMore, 
        hasMorePhotos: state.hasMorePhotos, 
        loading: state.loading 
      });
      return;
    }

    setState(prev => ({ ...prev, loadingMore: true, error: null }));

    try {
      const nextPage = state.currentPage + 1;
      console.log('🔄 Loading more photos - page:', nextPage);

      const { photos: newPhotos, pagination } = await fetchPhotosFromMongoDB(nextPage);

      setState(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos], // ✅ Append nuevas fotos
        loadingMore: false,
        currentPage: nextPage,
        hasMorePhotos: pagination.hasNext,
        pagination: {
          ...pagination,
          // Mantener el total de fotos cargadas hasta ahora
          displayedTotal: prev.photos.length + newPhotos.length
        }
      }));

      console.log('✅ More photos loaded successfully:', { 
        newCount: newPhotos.length, 
        totalLoaded: state.photos.length + newPhotos.length,
        hasMore: pagination.hasNext 
      });

    } catch (error) {
      console.error('❌ Error loading more photos:', error);
      setState(prev => ({
        ...prev,
        loadingMore: false,
        error: error instanceof Error ? error.message : 'Error cargando más fotos'
      }));
    }
  }, [state.loadingMore, state.hasMorePhotos, state.loading, state.currentPage, state.photos.length, fetchPhotosFromMongoDB]);

  /**
   * Actualiza filtros y recarga fotos
   */
  const setFilters = useCallback((newFilters: Partial<HybridGalleryFilters>) => {
    setState(prev => {
      const updatedFilters = { ...prev.filters, ...newFilters };
      return { ...prev, filters: updatedFilters };
    });
  }, []);

  /**
   * 🆕 Verifica si hay fotos nuevas (refresh manual)
   */
  const checkForNewPhotos = useCallback(async () => {
    if (state.photos.length === 0) return { hasNew: false, count: 0 };

    try {
      // Usar la fecha de la foto más reciente como referencia
      const latestPhotoDate = state.photos[0]?.uploadedAt;
      if (!latestPhotoDate) return { hasNew: false, count: 0 };

      const response = await fetch(`/api/photos/check-new?since=${latestPhotoDate}`);
      if (!response.ok) throw new Error('Error verificando fotos nuevas');

      const data = await response.json();
      console.log('🔍 Check new photos result:', data);

      if (data.success && data.hasNew) {
        setState(prev => ({ 
          ...prev, 
          newPhotosAvailable: data.count 
        }));
      }

      return {
        hasNew: data.hasNew || false,
        count: data.count || 0,
        recentPhotos: data.recentPhotos || []
      };

    } catch (error) {
      console.error('❌ Error checking for new photos:', error);
      return { hasNew: false, count: 0 };
    }
  }, [state.photos]);

  /**
   * 🔄 Refresca la galería completa (manual refresh)
   */
  const refresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    
    // Reset a página 1 y cargar desde el inicio
    await loadPhotos(1);
    
    // También actualizar stats
    try {
      const stats = await fetchStatsFromMongoDB();
      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      console.warn('Could not update stats during refresh:', error);
    }
  }, [loadPhotos, fetchStatsFromMongoDB]);

  /**
   * 🔄 Refresh suave - solo agrega fotos nuevas al inicio
   */
  const softRefresh = useCallback(async () => {
    const newPhotosCheck = await checkForNewPhotos();
    
    if (newPhotosCheck.hasNew) {
      // Cargar página 1 y prepend las nuevas fotos
      const { photos: latestPhotos } = await fetchPhotosFromMongoDB(1);
      
      setState(prev => {
        // Filtrar fotos que ya no están para evitar duplicados
        const existingIds = new Set(prev.photos.map(p => p.id));
        const trulyNewPhotos = latestPhotos.filter(photo => !existingIds.has(photo.id));
        
        return {
          ...prev,
          photos: [...trulyNewPhotos, ...prev.photos], // Prepend nuevas fotos
          newPhotosAvailable: 0, // Reset contador
          lastRefreshTime: Date.now()
        };
      });
      
      console.log('✅ Soft refresh completed, added new photos:', newPhotosCheck.count);
    }
    
    return newPhotosCheck;
  }, [checkForNewPhotos, fetchPhotosFromMongoDB]);

  /**
   * Cambia a página específica
   */
  const goToPage = useCallback((page: number) => {
    loadPhotos(page);
  }, [loadPhotos]);

  /**
   * 🆕 Obtiene la URL optimizada para mostrar una foto (desde MongoDB)
   */
  const getPhotoDisplayUrl = useCallback((photo: HybridPhoto, size: 'thumbnail' | 'compressed' | 'original' = 'compressed'): string => {
    // Si tenemos thumbnail y pedimos thumbnail, usarlo
    if (size === 'thumbnail' && photo.thumbnailUrl) {
      return photo.thumbnailUrl;
    }

    // Para fotos de Cloudinary, generar transformaciones dinámicas
    if (photo.source === 'cloudinary' && photo.displayUrl && photo.displayUrl.includes('cloudinary.com')) {
      const transformations = {
        thumbnail: 'w_200,h_200,c_fill,q_auto:good,f_auto',
        compressed: 'w_800,h_600,c_fit,q_auto:good,f_auto',
        original: 'q_auto:best,f_auto'
      };

      // Insertar transformaciones en la URL de Cloudinary
      return photo.displayUrl.replace('/upload/', `/upload/${transformations[size]}/`);
    }

    // Para fotos locales o fallback, usar la URL base
    return photo.displayUrl || '/placeholder.jpg';
  }, []);

  /**
   * 🆕 Incrementa el contador de vistas de una foto
   */
  const incrementPhotoView = useCallback(async (photoId: string) => {
    try {
      await fetch(`/api/photos/${photoId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.warn('Failed to increment photo view:', error);
      // No mostrar error al usuario, es una métrica opcional
    }
  }, []);

  /**
   * 🗑️ Elimina una foto específica
   */
  const deletePhoto = useCallback(async (photoId: string): Promise<boolean> => {
    // Agregar el ID a la lista de fotos siendo eliminadas
    setState(prev => ({
      ...prev,
      deletingPhotos: [...prev.deletingPhotos, photoId],
      deleteError: null
    }));

    try {
      console.log('🗑️ Deleting photo:', photoId);

      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Photo deleted successfully:', result);

      // Actualizar estado local removiendo la foto
      setState(prev => ({
        ...prev,
        photos: prev.photos.filter(photo => photo.id !== photoId),
        deletingPhotos: prev.deletingPhotos.filter(id => id !== photoId),
        deleteError: null,
        // Actualizar estadísticas si están disponibles
        stats: prev.stats ? {
          ...prev.stats,
          totalPhotos: prev.stats.totalPhotos - 1,
          sourceBreakdown: {
            ...prev.stats.sourceBreakdown,
            // Decrementar el tipo de fuente correspondiente
            [result.deletedPhoto?.uploadSource === 'cloudinary' ? 'cloudinary' : 'local']: 
              Math.max(0, prev.stats.sourceBreakdown[result.deletedPhoto?.uploadSource === 'cloudinary' ? 'cloudinary' : 'local'] - 1)
          }
        } : null
      }));

      return true;

    } catch (error) {
      console.error('❌ Error deleting photo:', error);
      
      // Remover del estado de eliminación y mostrar error
      setState(prev => ({
        ...prev,
        deletingPhotos: prev.deletingPhotos.filter(id => id !== photoId),
        deleteError: error instanceof Error ? error.message : 'Error desconocido al eliminar foto'
      }));

      return false;
    }
  }, []);

  /**
   * 🗑️ Verifica si una foto específica está siendo eliminada
   */
  const isPhotoDeleting = useCallback((photoId: string): boolean => {
    return state.deletingPhotos.includes(photoId);
  }, [state.deletingPhotos]);

  /**
   * 🗑️ Limpia el error de eliminación
   */
  const clearDeleteError = useCallback(() => {
    setState(prev => ({ ...prev, deleteError: null }));
  }, []);

  // Cargar fotos al montar y cuando cambien los filtros
  useEffect(() => {
    loadPhotos(1);
  }, [loadPhotos, state.filters.eventMoment, state.filters.uploader, state.filters.source, state.filters.sortBy, state.filters.sortOrder]);

  return {
    // 📸 Estados principales
    photos: state.photos,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    pagination: state.pagination,
    filters: state.filters,
    
    // 🔧 Funciones básicas
    setFilters,
    refresh,
    goToPage,
    getPhotoDisplayUrl,
    incrementPhotoView,
    
    // 🗑️ Funciones de eliminación
    deletePhoto,
    isPhotoDeleting,
    deletingPhotos: state.deletingPhotos,
    deleteError: state.deleteError,
    clearDeleteError,
    
    // 🆕 Funciones Load More y refresh manual
    loadMorePhotos,
    loadingMore: state.loadingMore,
    hasMorePhotos: state.hasMorePhotos,
    currentPage: state.currentPage,
    totalPhotos: state.totalPhotos,
    checkForNewPhotos,
    softRefresh,
    newPhotosAvailable: state.newPhotosAvailable,
    lastRefreshTime: state.lastRefreshTime
  };
};
