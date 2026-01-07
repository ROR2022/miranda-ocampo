'use client'

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { X } from 'lucide-react';
import TheaterImage from './TheaterImage';
import TheaterControls from './TheaterControls';

// Tipos importados del hook híbrido
interface HybridPhoto {
  id: string;
  originalName: string;
  uploaderName: string;
  uploadedAt: string;
  size: number;
  eventMoment: string;
  comment?: string;
  displayUrl: string;
  thumbnailUrl?: string;
  source: 'cloudinary' | 'local';
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

// Colores específicos para Modo Teatro
const THEATER_COLORS = {
  background: '#000000',           // Negro puro
  overlay: 'rgba(0,0,0,0.95)',   // Overlay semi-transparente
  controls: 'rgba(255,255,255,0.1)', // Controles sutiles
  accent: '#E91E63',             // Rosa Aurora para activos
  text: '#FFFFFF',               // Texto blanco puro
  counter: 'rgba(255,255,255,0.7)' // Contador sutil
};

interface TheaterModeModalProps {
  photos: HybridPhoto[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  getPhotoDisplayUrl: (photo: HybridPhoto, quality?: 'original' | 'compressed' | 'thumbnail') => string;
}

const TheaterModeModal: React.FC<TheaterModeModalProps> = ({
  photos,
  initialIndex,
  isOpen,
  onClose,
  getPhotoDisplayUrl
}) => {
  // 🔍 DEBUG: Asegurar que el índice esté en rango válido
  const safeInitialIndex = Math.max(0, Math.min(initialIndex, photos.length - 1));
  const [currentIndex, setCurrentIndex] = useState(safeInitialIndex);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  
  // 🎭 FASE 5: Estado de transición y animaciones
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ✅ useRef para manejar interval sin causar re-renders
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🔍 DEBUG: Log para verificar datos
  useEffect(() => {
    /* console.log('🎭 TheaterModeModal Debug:', {
      photos: photos.length,
      initialIndex,
      safeInitialIndex,
      currentIndex,
      currentPhoto: photos[currentIndex]
    }); */
  }, [photos, initialIndex, safeInitialIndex, currentIndex]);

  // ✅ Auto-hide de controles simplificado - sin ciclos
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (controlsVisible) {
      timer = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [controlsVisible]);

  // ✅ Auto-play mejorado sin ciclos infinitos usando useRef
  useEffect(() => {
    // Limpiar interval anterior si existe
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
    }

    // Solo crear nuevo interval si autoPlay está activo
    if (autoPlay && photos.length > 1) {
      const interval = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex(prev => (prev + 1) % photos.length);
          setIsTransitioning(false);
        }, 200);
      }, 4000);
      
      autoPlayIntervalRef.current = interval;
    }

    // Cleanup function
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    };
  }, [autoPlay, photos.length]); // Solo depende de autoPlay y photos.length

  // Navegación con transiciones
  const goToPrevious = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev === 0 ? photos.length - 1 : prev - 1);
      setIsTransitioning(false);
    }, 150);
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev === photos.length - 1 ? 0 : prev + 1);
      setIsTransitioning(false);
    }, 150);
  }, [photos.length]);

  // ✅ Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
    };
  }, []);

  // Manejar teclas con auto-play
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'ArrowLeft') {
      if (autoPlay) setAutoPlay(false); // Pausar auto-play al navegar manualmente
      goToPrevious();
    } else if (event.key === 'ArrowRight') {
      if (autoPlay) setAutoPlay(false); // Pausar auto-play al navegar manualmente
      goToNext();
    } else if (event.key === ' ') {
      event.preventDefault();
      setAutoPlay(prev => !prev); // Spacebar para toggle auto-play
    }
    // Mostrar controles al interactuar
    setControlsVisible(true);
  }, [onClose, goToPrevious, goToNext, autoPlay]);

  // Actualizar índice cuando cambie el inicial
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevenir scroll del body cuando modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  // Preload de imágenes adyacentes
  useEffect(() => {
    if (!isOpen || photos.length === 0) return;

    const preloadNext = () => {
      const nextIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
      const img = new Image();
      img.src = getPhotoDisplayUrl(photos[nextIndex], 'original');
    };

    const preloadPrev = () => {
      const prevIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
      const img = new Image();
      img.src = getPhotoDisplayUrl(photos[prevIndex], 'original');
    };

    preloadNext();
    preloadPrev();
  }, [currentIndex, photos, isOpen, getPhotoDisplayUrl]);

  // Handlers para controles
  /* const handleShowInfo = useCallback(() => {
    // TODO: Implementar en siguiente fase
    console.log('Mostrar información de foto');
  }, []);

  const handleShowSettings = useCallback(() => {
    // TODO: Implementar en siguiente fase
    console.log('Mostrar configuración');
  }, []); */

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ 
        backgroundColor: THEATER_COLORS.overlay,
        backdropFilter: 'blur(1px)'
      }}
      onMouseMove={() => setControlsVisible(true)}
      onClick={onClose} // Click fuera para cerrar
    >
      {/* Contenedor principal del modal */}
      <div 
        className="relative w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevenir cierre al click dentro
      >
        {/* Botón de cierre - Solo visible cuando controles están activos */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-[10000] p-3 rounded-full transition-all duration-300 hover:scale-110 ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ 
            backgroundColor: THEATER_COLORS.controls,
            color: THEATER_COLORS.text 
          }}
          aria-label="Cerrar modo teatro"
        >
          <X size={24} />
        </button>

        {/* 🎭 ÁREA PRINCIPAL PARA IMAGEN - COMPLETAMENTE LIMPIA */}
        <div 
          className={`flex-1 relative transition-opacity duration-300 ${
            isTransitioning ? 'opacity-50' : 'opacity-100'
          }`}
          style={{ 
            minHeight: '85vh',
            backgroundColor: THEATER_COLORS.background 
          }}
        >
          {/* Renderizar solo la imagen actual para máxima performance */}
          {photos.length > 0 && currentIndex >= 0 && currentIndex < photos.length && (
            <TheaterImage
              photo={photos[currentIndex]}
              getPhotoDisplayUrl={getPhotoDisplayUrl}
              isActive={true}
            />
          )}

          {/* 🔍 DEBUG: Mostrar info si no hay imagen */}
          {(!photos.length || currentIndex < 0 || currentIndex >= photos.length) && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-xl">
              <div className="text-center">
                <p>⚠️ No se puede mostrar la imagen</p>
                <p className="text-sm mt-2">Fotos: {photos.length}, Índice: {currentIndex}</p>
              </div>
            </div>
          )}
        </div>

        {/* Controles de navegación */}
        {/* 🎮 CONTROLES - AUTO-HIDE MEJORADO */}
        <div className={`transition-opacity duration-500 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <TheaterControls
            currentIndex={currentIndex}
            totalPhotos={photos.length}
            onPrevious={goToPrevious}
            onNext={goToNext}
            autoPlay={autoPlay}
            onToggleAutoPlay={() => setAutoPlay(prev => !prev)}
          />
        </div>

        {/* 📊 INDICADOR DE PROGRESO AUTO-PLAY */}
        {autoPlay && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 animate-pulse"
              style={{ 
                width: '100%',
                animation: 'theaterProgress 4s linear infinite'
              }}
            />
          </div>
        )}
      </div>

      {/* 🎨 ESTILOS DE ANIMACIÓN */}
      <style jsx>{`
        @keyframes theaterProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default TheaterModeModal;
