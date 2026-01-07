'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * ⚡ Hook para optimización de rendimiento del carrusel
 * Gestiona preload de imágenes, lazy loading, y optimizaciones
 */

interface HybridPhoto {
  id: string;
  originalName: string;
  displayUrl: string;
  thumbnailUrl?: string;
  dimensions: {
    width: number;
    height: number;
  };
  size: number;
}

interface PerformanceConfig {
  preloadImages: boolean;
  lazyLoadThumbnails: boolean;
  imageQuality: 'thumbnail' | 'compressed' | 'original';
  preloadDistance: number; // Número de imágenes a precargar hacia adelante/atrás
  virtualScrolling: boolean;
  enableWebP: boolean;
  enableAVIF: boolean;
  compressQuality: number; // 0-100
}

interface CarouselPerformanceProps {
  photos: HybridPhoto[];
  currentIndex: number;
  getPhotoDisplayUrl: (photo: HybridPhoto, size: 'thumbnail' | 'compressed' | 'original') => string;
  config: PerformanceConfig;
}

interface LoadingState {
  loaded: Set<string>;
  loading: Set<string>;
  errors: Set<string>;
  preloaded: Set<string>;
}

export const useCarouselPerformance = ({
  photos,
  currentIndex,
  getPhotoDisplayUrl,
  config
}: CarouselPerformanceProps) => {

  // Estado de carga de imágenes
  const [loadingState, setLoadingState] = useState<LoadingState>({
    loaded: new Set(),
    loading: new Set(),
    errors: new Set(),
    preloaded: new Set()
  });

  // Cache de imágenes
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  //const preloadQueue = useRef<string[]>([]);
  const loadingPromises = useRef<Map<string, Promise<HTMLImageElement>>>(new Map());

  // Métricas de rendimiento
  const [metrics, setMetrics] = useState({
    totalLoadTime: 0,
    averageLoadTime: 0,
    cacheHitRate: 0,
    imagesLoaded: 0,
    imagesFailed: 0,
    bytesLoaded: 0
  });

  /**
   * 🔍 Detectar soporte de formatos modernos
   */
  const formatSupport = useMemo(() => {
    const canvas = document.createElement('canvas');
    //const ctx = canvas.getContext('2d');
    
    return {
      webp: canvas.toDataURL('image/webp').startsWith('data:image/webp'),
      avif: canvas.toDataURL('image/avif').startsWith('data:image/avif'),
      heic: false // Generalmente no soportado en web
    };
  }, []);

  /**
   * 🎯 Optimizar URL de imagen según capacidades del navegador
   */
  const getOptimizedImageUrl = useCallback((photo: HybridPhoto, quality: 'thumbnail' | 'compressed' | 'original') => {
    const baseUrl = getPhotoDisplayUrl(photo, quality);
    
    // Agregar parámetros de optimización si es posible
    const url = new URL(baseUrl, window.location.origin);
    
    // Formato preferido
    if (config.enableAVIF && formatSupport.avif) {
      url.searchParams.set('f', 'avif');
    } else if (config.enableWebP && formatSupport.webp) {
      url.searchParams.set('f', 'webp');
    }
    
    // Calidad de compresión
    if (quality !== 'original' && config.compressQuality < 100) {
      url.searchParams.set('q', config.compressQuality.toString());
    }
    
    // Optimización responsiva
    const devicePixelRatio = window.devicePixelRatio || 1;
    if (devicePixelRatio > 1) {
      url.searchParams.set('dpr', Math.min(devicePixelRatio, 2).toString());
    }
    
    return url.toString();
  }, [getPhotoDisplayUrl, config, formatSupport]);

  /**
   * 📦 Precargar imagen individual
   */
  const preloadImage = useCallback((photo: HybridPhoto, quality: 'thumbnail' | 'compressed' | 'original' = config.imageQuality): Promise<HTMLImageElement> => {
    const url = getOptimizedImageUrl(photo, quality);
    const cacheKey = `${photo.id}-${quality}`;
    
    // Verificar cache
    if (imageCache.current.has(cacheKey)) {
      const cachedImage = imageCache.current.get(cacheKey)!;
      setLoadingState(prev => ({
        ...prev,
        loaded: new Set([...prev.loaded, cacheKey])
      }));
      return Promise.resolve(cachedImage);
    }
    
    // Verificar si ya está cargando
    if (loadingPromises.current.has(cacheKey)) {
      return loadingPromises.current.get(cacheKey)!;
    }
    
    // Crear nueva promesa de carga
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const startTime = performance.now();
      const img = new Image();
      
      // Configurar crossOrigin si es necesario
      if (url.startsWith('http') && !url.startsWith(window.location.origin)) {
        img.crossOrigin = 'anonymous';
      }
      
      img.onload = () => {
        const loadTime = performance.now() - startTime;
        
        // Cachear imagen
        imageCache.current.set(cacheKey, img);
        
        // Actualizar estado
        setLoadingState(prev => ({
          ...prev,
          loaded: new Set([...prev.loaded, cacheKey]),
          loading: new Set([...prev.loading].filter(k => k !== cacheKey)),
          preloaded: new Set([...prev.preloaded, cacheKey])
        }));
        
        // Actualizar métricas
        setMetrics(prev => {
          const newImagesLoaded = prev.imagesLoaded + 1;
          const newTotalLoadTime = prev.totalLoadTime + loadTime;
          
          return {
            ...prev,
            imagesLoaded: newImagesLoaded,
            totalLoadTime: newTotalLoadTime,
            averageLoadTime: newTotalLoadTime / newImagesLoaded,
            bytesLoaded: prev.bytesLoaded + (photo.size || 0),
            cacheHitRate: imageCache.current.size / (newImagesLoaded + prev.imagesFailed)
          };
        });
        
        resolve(img);
      };
      
      img.onerror = () => {
        setLoadingState(prev => ({
          ...prev,
          errors: new Set([...prev.errors, cacheKey]),
          loading: new Set([...prev.loading].filter(k => k !== cacheKey))
        }));
        
        setMetrics(prev => ({
          ...prev,
          imagesFailed: prev.imagesFailed + 1
        }));
        
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      // Marcar como cargando
      setLoadingState(prev => ({
        ...prev,
        loading: new Set([...prev.loading, cacheKey])
      }));
      
      img.src = url;
    });
    
    loadingPromises.current.set(cacheKey, loadPromise);
    return loadPromise;
  }, [getOptimizedImageUrl, config.imageQuality]);

  /**
   * 🎯 Precargar imágenes adyacentes
   */
  const preloadAdjacentImages = useCallback(() => {
    if (!config.preloadImages) return;
    
    const { preloadDistance } = config;
    const indicesToPreload: number[] = [];
    
    // Calcular índices para precargar
    for (let i = -preloadDistance; i <= preloadDistance; i++) {
      const index = currentIndex + i;
      if (index >= 0 && index < photos.length && index !== currentIndex) {
        indicesToPreload.push(index);
      }
    }
    
    // Precargar en orden de prioridad (más cerca = mayor prioridad)
    indicesToPreload
      .sort((a, b) => Math.abs(a - currentIndex) - Math.abs(b - currentIndex))
      .forEach((index, priority) => {
        const photo = photos[index];
        if (photo) {
          // Usar setTimeout para no bloquear la UI
          setTimeout(() => {
            preloadImage(photo, config.imageQuality).catch(console.warn);
          }, priority * 100); // Escalonar la carga
        }
      });
  }, [photos, currentIndex, config, preloadImage]);

  /**
   * 📱 Configurar Intersection Observer para lazy loading
   */
  const setupIntersectionObserver = useCallback(() => {
    if (!config.lazyLoadThumbnails || intersectionObserver.current) return;
    
    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const photoId = entry.target.getAttribute('data-photo-id');
            const photo = photos.find(p => p.id === photoId);
            
            if (photo) {
              preloadImage(photo, 'thumbnail').catch(console.warn);
              intersectionObserver.current?.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );
  }, [config.lazyLoadThumbnails, photos, preloadImage]);

  /**
   * 🧹 Limpiar cache cuando sea necesario
   */
  const cleanupCache = useCallback((maxCacheSize = 50) => {
    if (imageCache.current.size <= maxCacheSize) return;
    
    // Convertir a array para ordenar por último uso
    const cacheEntries = Array.from(imageCache.current.entries());
    
    // Mantener solo las imágenes más recientes
    const toKeep = cacheEntries.slice(-maxCacheSize);
    
    imageCache.current.clear();
    toKeep.forEach(([key, img]) => {
      imageCache.current.set(key, img);
    });
    
    // Actualizar estado de loading
    const keptKeys = new Set(toKeep.map(([key]) => key));
    setLoadingState(prev => ({
      ...prev,
      loaded: new Set([...prev.loaded].filter(key => keptKeys.has(key))),
      preloaded: new Set([...prev.preloaded].filter(key => keptKeys.has(key)))
    }));
  }, []);

  /**
   * 📊 Obtener estadísticas de rendimiento
   */
  const getPerformanceStats = useCallback(() => {
    return {
      ...metrics,
      cacheSize: imageCache.current.size,
      loadingCount: loadingState.loading.size,
      errorCount: loadingState.errors.size,
      hitRate: `${(metrics.cacheHitRate * 100).toFixed(1)}%`,
      avgLoadTime: `${metrics.averageLoadTime.toFixed(0)}ms`,
      totalSize: `${(metrics.bytesLoaded / 1024 / 1024).toFixed(2)}MB`
    };
  }, [metrics, loadingState]);

  /**
   * 🎨 Obtener estado de carga para una imagen
   */
  const getImageLoadingState = useCallback((photo: HybridPhoto, quality: 'thumbnail' | 'compressed' | 'original' = config.imageQuality) => {
    const cacheKey = `${photo.id}-${quality}`;
    
    return {
      isLoaded: loadingState.loaded.has(cacheKey),
      isLoading: loadingState.loading.has(cacheKey),
      hasError: loadingState.errors.has(cacheKey),
      isPreloaded: loadingState.preloaded.has(cacheKey),
      cacheKey
    };
  }, [loadingState, config.imageQuality]);

  /**
   * 🚀 Obtener URL optimizada para renderizado
   */
  const getOptimizedUrl = useCallback((photo: HybridPhoto, quality: 'thumbnail' | 'compressed' | 'original' = config.imageQuality) => {
    return getOptimizedImageUrl(photo, quality);
  }, [getOptimizedImageUrl, config.imageQuality]);

  // Precargar imágenes adyacentes cuando cambia el índice
  useEffect(() => {
    preloadAdjacentImages();
  }, [preloadAdjacentImages]);

  // Configurar intersection observer
  useEffect(() => {
    setupIntersectionObserver();
    
    return () => {
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
        intersectionObserver.current = null;
      }
    };
  }, [setupIntersectionObserver]);

  // Cleanup periódico del cache
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupCache(50);
    }, 60000); // Cada minuto
    
    return () => clearInterval(interval);
  }, [cleanupCache]);

  // Precargar imagen actual inmediatamente
  useEffect(() => {
    if (photos[currentIndex]) {
      preloadImage(photos[currentIndex], config.imageQuality).catch(console.warn);
    }
  }, [photos, currentIndex, config.imageQuality, preloadImage]);

  return {
    // Estado de carga
    loadingState,
    
    // Funciones principales
    preloadImage,
    getImageLoadingState,
    getOptimizedUrl,
    
    // Utilidades
    getPerformanceStats,
    cleanupCache,
    
    // Referencias para lazy loading
    intersectionObserver: intersectionObserver.current,
    
    // Configuración de formatos
    formatSupport,
    
    // Métricas
    metrics,
    
    // Cache info
    cacheSize: imageCache.current.size,
    isLoading: loadingState.loading.size > 0
  };
};
