'use client'

import { useState, useEffect, useCallback } from 'react';

/**
 * 🎛️ Hook para gestión de configuración persistente del carrusel
 * Maneja preferencias del usuario con localStorage y configuración por defecto
 */

interface CarouselUserPreferences {
  // Configuración de reproducción
  autoPlayEnabled: boolean;
  playbackSpeed: number; // en segundos
  loopEnabled: boolean;
  
  // Configuración de gestos táctiles
  swipeEnabled: boolean;
  swipeSensitivity: 'low' | 'medium' | 'high';
  hapticFeedbackEnabled: boolean;
  
  // Configuración visual
  showProgressBar: boolean;
  showSlideIndicators: boolean;
  feedbackStyle: 'minimal' | 'vibrant' | 'elegant';
  controlsVariant: 'default' | 'compact' | 'minimal';
  
  // Configuración de accesibilidad
  reducedMotion: boolean;
  highContrast: boolean;
  keyboardNavigationEnabled: boolean;
  screenReaderOptimized: boolean;
  
  // Configuración de hints y ayuda
  showHints: boolean;
  autoHideHints: boolean;
  hasSeenTutorial: boolean;
  
  // Configuración avanzada
  preloadImages: boolean;
  imageQuality: 'thumbnail' | 'compressed' | 'original';
  enableAnalytics: boolean;
  
  // Tema y personalización
  themeVariant: 'aurora' | 'minimal' | 'elegant';
  animationDuration: number; // en ms
}

const DEFAULT_PREFERENCES: CarouselUserPreferences = {
  // Reproducción
  autoPlayEnabled: false, // Siempre inicia deshabilitado por seguridad
  playbackSpeed: 2, // 2 segundos por defecto
  loopEnabled: true,
  
  // Gestos táctiles
  swipeEnabled: true,
  swipeSensitivity: 'medium',
  hapticFeedbackEnabled: true,
  
  // Visual
  showProgressBar: true,
  showSlideIndicators: true,
  feedbackStyle: 'elegant',
  controlsVariant: 'compact',
  
  // Accesibilidad
  reducedMotion: false,
  highContrast: false,
  keyboardNavigationEnabled: true,
  screenReaderOptimized: false,
  
  // Hints
  showHints: true,
  autoHideHints: true,
  hasSeenTutorial: false,
  
  // Avanzado
  preloadImages: true,
  imageQuality: 'compressed',
  enableAnalytics: false,
  
  // Tema
  themeVariant: 'aurora',
  animationDuration: 300
};

const STORAGE_KEY = 'carouselUserPreferences';
const PREFERENCES_VERSION = '1.0';

export const useCarouselPreferences = () => {
  const [preferences, setPreferences] = useState<CarouselUserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * 💾 Cargar preferencias desde localStorage
   */
  const loadPreferences = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Validar versión y migrar si es necesario
        if (parsed.version === PREFERENCES_VERSION) {
            //eslint-disable-next-line
          setPreferences(prev => ({
            ...DEFAULT_PREFERENCES,
            ...parsed.preferences
          }));
        } else {
          // Migración de versiones antiguas
          console.log('Migrando preferencias a nueva versión...');
          setPreferences(DEFAULT_PREFERENCES);
        }
      }
    } catch (error) {
      console.warn('Error cargando preferencias del carrusel:', error);
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 💾 Guardar preferencias en localStorage
   */
  const savePreferences = useCallback((newPreferences?: CarouselUserPreferences) => {
    try {
      const toSave = newPreferences || preferences;
      const dataToStore = {
        version: PREFERENCES_VERSION,
        preferences: toSave,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
      setHasUnsavedChanges(false);
      
      console.log('Preferencias del carrusel guardadas exitosamente');
    } catch (error) {
      console.error('Error guardando preferencias del carrusel:', error);
    }
  }, [preferences]);

  /**
   * ⚙️ Actualizar una preferencia específica
   */
  const updatePreference = useCallback(<K extends keyof CarouselUserPreferences>(
    key: K,
    value: CarouselUserPreferences[K],
    saveImmediately = false
  ) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      
      if (saveImmediately) {
        setTimeout(() => savePreferences(updated), 0);
      } else {
        setHasUnsavedChanges(true);
      }
      
      return updated;
    });
  }, [savePreferences]);

  /**
   * 🔄 Actualizar múltiples preferencias
   */
  const updateMultiplePreferences = useCallback((
    updates: Partial<CarouselUserPreferences>,
    saveImmediately = false
  ) => {
    setPreferences(prev => {
      const updated = { ...prev, ...updates };
      
      if (saveImmediately) {
        setTimeout(() => savePreferences(updated), 0);
      } else {
        setHasUnsavedChanges(true);
      }
      
      return updated;
    });
  }, [savePreferences]);

  /**
   * 🔄 Resetear a valores por defecto
   */
  const resetToDefaults = useCallback((saveImmediately = true) => {
    setPreferences(DEFAULT_PREFERENCES);
    if (saveImmediately) {
      savePreferences(DEFAULT_PREFERENCES);
    }
  }, [savePreferences]);

  /**
   * 🎯 Detectar preferencias del sistema
   */
  const detectSystemPreferences = useCallback(() => {
    const updates: Partial<CarouselUserPreferences> = {};

    // Detectar preferencia de movimiento reducido
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      updates.reducedMotion = true;
      updates.animationDuration = 150; // Animaciones más rápidas
    }

    // Detectar preferencia de alto contraste
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
      updates.highContrast = true;
      updates.feedbackStyle = 'vibrant'; // Más contraste
    }

    // Detectar si es dispositivo táctil
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) {
      updates.swipeEnabled = false; // Deshabilitar swipe en desktop
      updates.showHints = false;
    }

    // Actualizar si hay cambios
    if (Object.keys(updates).length > 0) {
      updateMultiplePreferences(updates, true);
    }
  }, [updateMultiplePreferences]);

  /**
   * 📊 Obtener configuración para componente específico
   */
  const getCarouselConfig = useCallback(() => {
    return {
      playbackInterval: preferences.playbackSpeed * 1000,
      loop: preferences.loopEnabled,
      showProgressBar: preferences.showProgressBar,
      showSlideIndicators: preferences.showSlideIndicators,
      controlsVariant: preferences.controlsVariant,
      animationDuration: preferences.reducedMotion ? 150 : preferences.animationDuration
    };
  }, [preferences]);

  /**
   * 🎨 Obtener configuración de gestos táctiles
   */
  const getTouchConfig = useCallback(() => {
    return {
      enabled: preferences.swipeEnabled,
      sensitivity: preferences.swipeSensitivity,
      hapticFeedback: preferences.hapticFeedbackEnabled,
      showVisualFeedback: !preferences.reducedMotion,
      feedbackStyle: preferences.feedbackStyle
    };
  }, [preferences]);

  /**
   * ♿ Obtener configuración de accesibilidad
   */
  const getAccessibilityConfig = useCallback(() => {
    return {
      reducedMotion: preferences.reducedMotion,
      highContrast: preferences.highContrast,
      keyboardNavigation: preferences.keyboardNavigationEnabled,
      screenReaderOptimized: preferences.screenReaderOptimized,
      announceChanges: preferences.screenReaderOptimized,
      focusManagement: preferences.keyboardNavigationEnabled
    };
  }, [preferences]);

  /**
   * 🖼️ Obtener configuración de imágenes
   */
  const getImageConfig = useCallback(() => {
    return {
      quality: preferences.imageQuality,
      preload: preferences.preloadImages,
      lazyLoad: !preferences.preloadImages
    };
  }, [preferences]);

  /**
   * 📱 Obtener configuración responsive
   */
  const getResponsiveConfig = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    return {
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      controlsSize: isMobile ? 'sm' : isTablet ? 'md' : 'lg',
      feedbackSize: isMobile ? 'md' : 'lg',
      showHints: preferences.showHints && isMobile && !preferences.hasSeenTutorial
    };
  }, [preferences]);

  // Cargar preferencias al montar
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Detectar preferencias del sistema al cargar
  useEffect(() => {
    if (!isLoading) {
      detectSystemPreferences();
    }
  }, [isLoading, detectSystemPreferences]);

  // Auto-guardado cada 30 segundos si hay cambios
  useEffect(() => {
    if (hasUnsavedChanges) {
      const autoSaveTimer = setTimeout(() => {
        savePreferences();
      }, 30000);
      
      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, savePreferences]);

  // Guardado antes de cerrar la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedChanges) {
        savePreferences();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, savePreferences]);

  return {
    // Estado
    preferences,
    isLoading,
    hasUnsavedChanges,
    
    // Acciones básicas
    updatePreference,
    updateMultiplePreferences,
    savePreferences,
    resetToDefaults,
    loadPreferences,
    detectSystemPreferences,
    
    // Configuraciones específicas
    getCarouselConfig,
    getTouchConfig,
    getAccessibilityConfig,
    getImageConfig,
    getResponsiveConfig,
    
    // Constantes útiles
    defaults: DEFAULT_PREFERENCES,
    version: PREFERENCES_VERSION
  };
};
