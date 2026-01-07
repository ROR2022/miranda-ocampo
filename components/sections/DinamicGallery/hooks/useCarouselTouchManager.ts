'use client'

import { useState, useCallback, useEffect } from 'react';

/**
 * 🎯 Hook para gestión avanzada de gestos táctiles en carrusel
 * Combina useSwipeGestures con lógica específica del carrusel
 */

interface TouchGestureSettings {
  swipeEnabled: boolean;
  swipeSensitivity: 'low' | 'medium' | 'high';
  hapticFeedback: boolean;
  preventScroll: boolean;
  showVisualFeedback: boolean;
  autoHideHints: boolean;
}

interface CarouselTouchManagerProps {
  onNext: () => void;
  onPrevious: () => void;
  onTogglePlayback?: () => void;
  isPlaying?: boolean;
  totalItems: number;
  currentIndex: number;
}

export const useCarouselTouchManager = ({
  onNext,
  onPrevious,
  onTogglePlayback,
  isPlaying = false,
  totalItems,
  currentIndex
}: CarouselTouchManagerProps) => {

  // Configuración de gestos (puede ser personalizable por usuario)
  const [settings, setSettings] = useState<TouchGestureSettings>({
    swipeEnabled: true,
    swipeSensitivity: 'medium',
    hapticFeedback: true,
    preventScroll: true,
    showVisualFeedback: true,
    autoHideHints: true
  });

  // Estado de interacción táctil
  const [touchState, setTouchState] = useState({
    isActive: false,
    hasInteracted: false,
    showHints: false,
    gestureCount: 0
  });

  // Detectar si es dispositivo táctil
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouch = 'ontouchstart' in window || 
                       navigator.maxTouchPoints > 0 || 
                       /Mobi|Android/i.test(navigator.userAgent);
      setIsTouchDevice(hasTouch);
      
      // Mostrar hints solo en dispositivos táctiles y primera vez
      if (hasTouch && !localStorage.getItem('carouselTouchHintSeen') && totalItems > 1) {
        setTouchState(prev => ({ ...prev, showHints: true }));
      }
    };

    checkTouchDevice();
  }, [totalItems]);

  /**
   * 📱 Handler para swipe hacia la izquierda (siguiente)
   */
  const handleSwipeLeft = useCallback(() => {
    if (!settings.swipeEnabled) return;

    // Haptic feedback
    if (settings.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }

    onNext();

    // Actualizar estadísticas de uso
    setTouchState(prev => ({
      ...prev,
      hasInteracted: true,
      gestureCount: prev.gestureCount + 1,
      showHints: false // Ocultar hints después de interacción
    }));

    // Guardar que el usuario ya interactuó
    if (settings.autoHideHints) {
      localStorage.setItem('carouselTouchHintSeen', 'true');
    }
  }, [settings.swipeEnabled, settings.hapticFeedback, settings.autoHideHints, onNext]);

  /**
   * 📱 Handler para swipe hacia la derecha (anterior)
   */
  const handleSwipeRight = useCallback(() => {
    if (!settings.swipeEnabled) return;

    // Haptic feedback
    if (settings.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }

    onPrevious();

    // Actualizar estadísticas de uso
    setTouchState(prev => ({
      ...prev,
      hasInteracted: true,
      gestureCount: prev.gestureCount + 1,
      showHints: false
    }));

    // Guardar que el usuario ya interactuó
    if (settings.autoHideHints) {
      localStorage.setItem('carouselTouchHintSeen', 'true');
    }
  }, [settings.swipeEnabled, settings.hapticFeedback, settings.autoHideHints, onPrevious]);

  /**
   * 📱 Handler para inicio de gesto (feedback visual)
   */
  const handleSwipeStart = useCallback((direction: 'left' | 'right') => {
    console.log('Swipe start:', direction);
    setTouchState(prev => ({ ...prev, isActive: true }));

    // Haptic feedback suave al inicio
    if (settings.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(5);
    }
  }, [settings.hapticFeedback]);

  /**
   * 📱 Handler para fin de gesto
   */
  const handleSwipeEnd = useCallback(() => {
    setTouchState(prev => ({ ...prev, isActive: false }));
  }, []);

  /**
   * 👆 Handler para tap doble (toggle playback)
   */
  const handleDoubleTap = useCallback(() => {
    if (onTogglePlayback && totalItems > 1) {
      onTogglePlayback();
      
      // Haptic feedback más fuerte para doble tap
      if (settings.hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    }
  }, [onTogglePlayback, totalItems, settings.hapticFeedback]);

  /**
   * 🎯 Handler para ocultar hints manualmente
   */
  const handleDismissHints = useCallback(() => {
    setTouchState(prev => ({ ...prev, showHints: false }));
    localStorage.setItem('carouselTouchHintSeen', 'true');
  }, []);

  /**
   * ⚙️ Actualizar configuración de gestos
   */
  const updateSettings = useCallback((newSettings: Partial<TouchGestureSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  /**
   * 📊 Obtener configuración de sensibilidad
   */
  const getSensitivityConfig = useCallback(() => {
    const configs = {
      low: {
        minSwipeDistance: 80,
        maxSwipeTime: 500,
        velocityThreshold: 0.2
      },
      medium: {
        minSwipeDistance: 50,
        maxSwipeTime: 300,
        velocityThreshold: 0.3
      },
      high: {
        minSwipeDistance: 30,
        maxSwipeTime: 200,
        velocityThreshold: 0.4
      }
    };

    return configs[settings.swipeSensitivity];
  }, [settings.swipeSensitivity]);

  /**
   * 🎨 Obtener configuración visual basada en el contexto
   */
  const getVisualConfig = useCallback(() => {
    return {
      showFeedback: settings.showVisualFeedback,
      feedbackStyle: isPlaying ? 'vibrant' : 'elegant',
      feedbackSize: isTouchDevice ? 'md' : 'sm',
      showHints: touchState.showHints && !touchState.hasInteracted,
      hintAutoHide: settings.autoHideHints
    };
  }, [settings.showVisualFeedback, settings.autoHideHints, isPlaying, isTouchDevice, touchState.showHints, touchState.hasInteracted]);

  /**
   * 🔄 Auto-ocultar hints después de tiempo
   */
  useEffect(() => {
    if (touchState.showHints && settings.autoHideHints) {
      const timer = setTimeout(() => {
        handleDismissHints();
      }, 6000); // 6 segundos
      
      return () => clearTimeout(timer);
    }
  }, [touchState.showHints, settings.autoHideHints, handleDismissHints]);

  /**
   * 📱 Configuración optimizada para móviles
   */
  const getMobileOptimizations = useCallback(() => {
    return {
      touchAction: settings.preventScroll ? 'pan-y' : 'auto',
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const,
      WebkitTouchCallout: 'none' as const,
      WebkitTapHighlightColor: 'transparent'
    };
  }, [settings.preventScroll]);

  return {
    // Estado
    settings,
    touchState,
    isTouchDevice,
    
    // Handlers de gestos
    handleSwipeLeft,
    handleSwipeRight,
    handleSwipeStart,
    handleSwipeEnd,
    handleDoubleTap,
    handleDismissHints,
    
    // Configuración
    updateSettings,
    getSensitivityConfig,
    getVisualConfig,
    getMobileOptimizations,
    
    // Información útil
    canSwipeNext: currentIndex < totalItems - 1,
    canSwipePrevious: currentIndex > 0,
    gestureSupported: isTouchDevice,
    
    // Métricas de uso
    gestureCount: touchState.gestureCount,
    hasUserInteracted: touchState.hasInteracted
  };
};
