'use client'

import { useState, useCallback, useEffect, useRef } from 'react';

// Configuración del carrusel manual
const CAROUSEL_CONFIG = {
  playbackInterval: 2000,        // 2 segundos por foto (solo cuando se activa)
  initialState: 'stopped',      // SIEMPRE inicia detenido
  requireUserAction: true,      // Usuario DEBE presionar play para iniciar
  pauseOnHover: false,          // NO pausa automáticamente (control manual total)
  pauseOnFocus: false,          // NO pausa automáticamente
  loop: true,                   // Loop infinito durante reproducción
  animationDuration: 300,       // Duración de transiciones
};

interface UseCarouselManualPlayProps {
  totalItems: number;
  onSlideChange?: (index: number) => void;
  initialIndex?: number;
}

interface CarouselManualPlayState {
  isPlaying: boolean;           // Estado de reproducción (false por defecto)
  currentIndex: number;         // Índice actual
  progress: number;             // Progreso del timer actual (0-100)
  userHasStartedPlayback: boolean; // Track si el usuario ha iniciado reproducción alguna vez
}

export const useCarouselManualPlay = ({
  totalItems,
  onSlideChange,
  initialIndex = 0
}: UseCarouselManualPlayProps) => {
  // Estado principal
  const [state, setState] = useState<CarouselManualPlayState>({
    isPlaying: false,             // IMPORTANTE: Inicia detenido
    currentIndex: initialIndex,
    progress: 0,
    userHasStartedPlayback: false
  });

  // Referencias para el timer y control
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  /**
   * 🎮 Inicia la reproducción automática (SOLO cuando usuario lo solicita)
   */
  const startPlayback = useCallback(() => {
    if (totalItems <= 1) return; // No reproducir si hay 1 o menos fotos

    setState(prev => ({
      ...prev,
      isPlaying: true,
      userHasStartedPlayback: true,
      progress: 0
    }));

    // Limpiar timers existentes
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    startTimeRef.current = Date.now();

    // Timer principal - avanza a la siguiente foto cada 2 segundos
    intervalRef.current = setInterval(() => {
      setState(prev => {
        const nextIndex = CAROUSEL_CONFIG.loop 
          ? (prev.currentIndex + 1) % totalItems
          : Math.min(prev.currentIndex + 1, totalItems - 1);

        // Si no es loop y llegamos al final, detener reproducción
        if (!CAROUSEL_CONFIG.loop && nextIndex === totalItems - 1) {
          // Ejecutar la función de cambio y luego detener
          setTimeout(() => stopPlayback(), 100);
        }

        // Notificar cambio de slide
        if (onSlideChange) {
          onSlideChange(nextIndex);
        }

        return {
          ...prev,
          currentIndex: nextIndex,
          progress: 0 // Reset progress para la nueva foto
        };
      });

      startTimeRef.current = Date.now(); // Reset timer de progreso
    }, CAROUSEL_CONFIG.playbackInterval);

    // Timer de progreso - actualiza la barra de progreso cada 50ms
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progressPercent = Math.min((elapsed / CAROUSEL_CONFIG.playbackInterval) * 100, 100);
      
      setState(prev => ({
        ...prev,
        progress: progressPercent
      }));
    }, 50);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, onSlideChange]);

  /**
   * ⏸️ Detiene la reproducción automática
   */
  const stopPlayback = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      progress: 0
    }));

    // Limpiar todos los timers
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  /**
   * 🔄 Toggle entre reproducir y pausar
   */
  const togglePlayback = useCallback(() => {
    if (state.isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }, [state.isPlaying, startPlayback, stopPlayback]);

  /**
   * ⏭️ Ir a la siguiente foto (navegación manual)
   */
  const goToNext = useCallback(() => {
    if (totalItems <= 1) return;

    const nextIndex = (state.currentIndex + 1) % totalItems;
    
    setState(prev => ({
      ...prev,
      currentIndex: nextIndex,
      progress: 0 // Reset progress cuando se navega manualmente
    }));

    // Notificar cambio
    if (onSlideChange) {
      onSlideChange(nextIndex);
    }

    // Si está reproduciendo, reiniciar el timer
    if (state.isPlaying) {
      startTimeRef.current = Date.now();
    }
  }, [state.currentIndex, state.isPlaying, totalItems, onSlideChange]);

  /**
   * ⏮️ Ir a la foto anterior (navegación manual)
   */
  const goToPrevious = useCallback(() => {
    if (totalItems <= 1) return;

    const prevIndex = state.currentIndex === 0 ? totalItems - 1 : state.currentIndex - 1;
    
    setState(prev => ({
      ...prev,
      currentIndex: prevIndex,
      progress: 0 // Reset progress cuando se navega manualmente
    }));

    // Notificar cambio
    if (onSlideChange) {
      onSlideChange(prevIndex);
    }

    // Si está reproduciendo, reiniciar el timer
    if (state.isPlaying) {
      startTimeRef.current = Date.now();
    }
  }, [state.currentIndex, state.isPlaying, totalItems, onSlideChange]);

  /**
   * 🎯 Ir a una foto específica (navegación directa)
   */
  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= totalItems) return;

    setState(prev => ({
      ...prev,
      currentIndex: index,
      progress: 0 // Reset progress cuando se navega manualmente
    }));

    // Notificar cambio
    if (onSlideChange) {
      onSlideChange(index);
    }

    // Si está reproduciendo, reiniciar el timer
    if (state.isPlaying) {
      startTimeRef.current = Date.now();
    }
  }, [state.isPlaying, totalItems, onSlideChange]);

  /**
   * 🎹 Handler para teclas del teclado
   */
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        goToNext();
        break;
      case ' ': // Spacebar
        event.preventDefault();
        togglePlayback();
        break;
    }
  }, [goToPrevious, goToNext, togglePlayback]);

  // Cleanup de timers al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Event listener para teclado
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return {
    // Estado actual
    isPlaying: state.isPlaying,
    currentIndex: state.currentIndex,
    progress: state.progress,
    userHasStartedPlayback: state.userHasStartedPlayback,
    
    // Controles de reproducción
    startPlayback,
    stopPlayback,
    togglePlayback,
    
    // Navegación manual
    goToNext,
    goToPrevious,
    goToSlide,
    
    // Información útil
    totalItems,
    hasNext: state.currentIndex < totalItems - 1,
    hasPrevious: state.currentIndex > 0,
    isFirstSlide: state.currentIndex === 0,
    isLastSlide: state.currentIndex === totalItems - 1,
    
    // Configuración
    config: CAROUSEL_CONFIG
  };
};
