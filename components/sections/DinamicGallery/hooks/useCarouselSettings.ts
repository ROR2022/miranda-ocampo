'use client'

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useCarouselPreferences } from '../hooks/useCarouselPreferences';

export interface CarouselUserPreferences {
  // Reproducción
  autoPlayEnabled: boolean;
  playbackSpeed: number;
  loopEnabled: boolean;
  
  // Gestos táctiles
  swipeEnabled: boolean;
  swipeSensitivity: 'low' | 'medium' | 'high';
  hapticFeedbackEnabled: boolean;
  
  // Interfaz
  showProgressBar: boolean;
  showSlideIndicators: boolean;
  feedbackStyle: 'minimal' | 'vibrant' | 'elegant';
  controlsVariant: 'default' | 'compact' | 'minimal';
  showHints: boolean;
  autoHideHints: boolean;
  hasSeenTutorial: boolean;
  
  // Accesibilidad
  reducedMotion: boolean;
  highContrast: boolean;
  keyboardNavigationEnabled: boolean;
  screenReaderOptimized: boolean;
  
  // Rendimiento
  preloadImages: boolean;
  imageQuality: 'thumbnail' | 'compressed' | 'original';
  enableAnalytics: boolean;
  
  // Tema
  themeVariant: 'aurora' | 'minimal' | 'elegant';
  animationDuration: number;
}

// Configuración por defecto
const DEFAULT_PREFERENCES: CarouselUserPreferences = {
  // Reproducción
  autoPlayEnabled: false,
  playbackSpeed: 2,
  loopEnabled: true,
  
  // Gestos táctiles
  swipeEnabled: true,
  swipeSensitivity: 'medium',
  hapticFeedbackEnabled: true,
  
  // Interfaz
  showProgressBar: true,
  showSlideIndicators: true,
  feedbackStyle: 'elegant',
  controlsVariant: 'default',
  showHints: true,
  autoHideHints: true,
  hasSeenTutorial: false,
  
  // Accesibilidad
  reducedMotion: false,
  highContrast: false,
  keyboardNavigationEnabled: true,
  screenReaderOptimized: false,
  
  // Rendimiento
  preloadImages: true,
  imageQuality: 'compressed',
  enableAnalytics: false,
  
  // Tema
  themeVariant: 'aurora',
  animationDuration: 300
};

export interface UseCarouselSettingsReturn {
  // Estado actual
  preferences: CarouselUserPreferences;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  
  // Acciones de configuración
  updatePreference: <K extends keyof CarouselUserPreferences>(
    key: K,
    value: CarouselUserPreferences[K]
  ) => void;
  updateMultiple: (updates: Partial<CarouselUserPreferences>) => void;
  saveChanges: () => Promise<void>;
  resetToDefaults: () => void;
  
  // Presets
  applyPreset: (preset: 'beginner' | 'standard' | 'advanced' | 'accessibility') => void;
  
  // Utilidades
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
  getPreferenceValue: <K extends keyof CarouselUserPreferences>(key: K) => CarouselUserPreferences[K];
  
  // Estado de la UI
  isSettingsModalOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
}

export const useCarouselSettings = (): UseCarouselSettingsReturn => {
  // Estados locales
  const [localPreferences, setLocalPreferences] = useState<CarouselUserPreferences>(DEFAULT_PREFERENCES);
  const [savedPreferences, setSavedPreferences] = useState<CarouselUserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Hook de persistencia
  const { 
    preferences: persistedPreferences, 
    updatePreference: updatePersistedPreference,
    resetToDefaults: resetPersistedPreferences
  } = useCarouselPreferences();

  // Detectar preferencias del sistema
  const [isSystemDarkMode, setIsSystemDarkMode] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detectar cambios en las preferencias del sistema
  useEffect(() => {
    // Dark mode del sistema
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsSystemDarkMode(darkModeQuery.matches);
    
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setIsSystemDarkMode(e.matches);
    };
    
    darkModeQuery.addEventListener('change', handleDarkModeChange);
    
    // Reduced motion del sistema
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(reducedMotionQuery.matches);
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    
    return () => {
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  // Inicialización
  useEffect(() => {
    try {
      // Combinar preferencias persistidas con valores por defecto
      const mergedPreferences = {
        ...DEFAULT_PREFERENCES,
        ...persistedPreferences,
        // Aplicar preferencias del sistema si corresponde
        reducedMotion: prefersReducedMotion || persistedPreferences.reducedMotion,
        themeVariant: persistedPreferences.themeVariant || (isSystemDarkMode ? 'minimal' : 'aurora')
      };
      
      setLocalPreferences(mergedPreferences);
      setSavedPreferences(mergedPreferences);
    } catch (error) {
      console.warn('Error loading carousel preferences:', error);
      setLocalPreferences(DEFAULT_PREFERENCES);
      setSavedPreferences(DEFAULT_PREFERENCES);
    } finally {
      setIsLoading(false);
    }
  }, [persistedPreferences, isSystemDarkMode, prefersReducedMotion]);

  // Detectar cambios no guardados
  const hasUnsavedChanges = JSON.stringify(localPreferences) !== JSON.stringify(savedPreferences);

  // Actualizar una preferencia específica
  const updatePreference = useCallback(<K extends keyof CarouselUserPreferences>(
    key: K,
    value: CarouselUserPreferences[K]
  ) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Actualizar múltiples preferencias
  const updateMultiple = useCallback((updates: Partial<CarouselUserPreferences>) => {
    setLocalPreferences(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Guardar cambios
  const saveChanges = useCallback(async () => {
    try {
      // Actualizar preferencias persistidas
      Object.entries(localPreferences).forEach(([key, value]) => {
        updatePersistedPreference(key as keyof CarouselUserPreferences, value);
      });
      
      setSavedPreferences({ ...localPreferences });
      
      // Opcional: Mostrar notificación de guardado exitoso
      if (typeof window !== 'undefined' && 
          'gtag' in window && 
          localPreferences.enableAnalytics) {
        const gtag = (window as { gtag?: (command: string, eventName: string, parameters: Record<string, string>) => void }).gtag;
        gtag?.('event', 'carousel_settings_saved', {
          event_category: 'user_interaction',
          event_label: 'settings_management'
        });
      }
      
    } catch (error) {
      console.error('Error saving carousel preferences:', error);
      throw error;
    }
  }, [localPreferences, updatePersistedPreference]);

  // Resetear a valores por defecto
  const resetToDefaults = useCallback(() => {
    setLocalPreferences(DEFAULT_PREFERENCES);
    resetPersistedPreferences();
  }, [resetPersistedPreferences]);

  // Presets de configuración
  const PRESETS = useMemo((): Record<string, Partial<CarouselUserPreferences>> => ({
    beginner: {
      autoPlayEnabled: false,
      playbackSpeed: 3,
      swipeSensitivity: 'low' as const,
      showHints: true,
      controlsVariant: 'default' as const,
      reducedMotion: true,
      showProgressBar: true,
      showSlideIndicators: true,
      feedbackStyle: 'elegant' as const
    },
    standard: {
      autoPlayEnabled: false,
      playbackSpeed: 2,
      swipeSensitivity: 'medium' as const,
      showHints: true,
      controlsVariant: 'default' as const,
      reducedMotion: false,
      showProgressBar: true,
      showSlideIndicators: true,
      feedbackStyle: 'elegant' as const
    },
    advanced: {
      autoPlayEnabled: false,
      playbackSpeed: 1,
      swipeSensitivity: 'high' as const,
      showHints: false,
      controlsVariant: 'minimal' as const,
      reducedMotion: false,
      showProgressBar: false,
      showSlideIndicators: false,
      feedbackStyle: 'minimal' as const
    },
    custom: {
      autoPlayEnabled: false,
      playbackSpeed: 2,
      swipeSensitivity: 'medium' as const,
      showHints: false,
      controlsVariant: 'default' as const,
      reducedMotion: false,
      showProgressBar: true,
      showSlideIndicators: true,
      feedbackStyle: 'vibrant' as const
    }
  }), []);

  const applyPreset = useCallback((preset: keyof typeof PRESETS) => {
    const presetConfig = PRESETS[preset];
    if (presetConfig) {
      updateMultiple(presetConfig);
    }
  }, [updateMultiple, PRESETS]);

  // Exportar configuración
  const exportSettings = useCallback(() => {
    try {
      const settingsWithMetadata = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        preferences: localPreferences
      };
      return JSON.stringify(settingsWithMetadata, null, 2);
    } catch (error) {
      console.error('Error exporting settings:', error);
      return '';
    }
  }, [localPreferences]);

  // Importar configuración
  const importSettings = useCallback((settingsJson: string): boolean => {
    try {
      const parsed = JSON.parse(settingsJson);
      
      if (parsed.preferences && typeof parsed.preferences === 'object') {
        // Validar que las claves sean válidas
        const validPreferences: Partial<CarouselUserPreferences> = {};
        Object.keys(DEFAULT_PREFERENCES).forEach(key => {
          if (key in parsed.preferences) {
            validPreferences[key as keyof CarouselUserPreferences] = parsed.preferences[key];
          }
        });
        
        updateMultiple(validPreferences);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }, [updateMultiple]);

  // Obtener valor específico
  const getPreferenceValue = useCallback(<K extends keyof CarouselUserPreferences>(
    key: K
  ): CarouselUserPreferences[K] => {
    return localPreferences[key];
  }, [localPreferences]);

  // Gestión del modal de configuración
  const openSettings = useCallback(() => {
    setIsSettingsModalOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsModalOpen(false);
  }, []);

  const toggleSettings = useCallback(() => {
    setIsSettingsModalOpen(prev => !prev);
  }, []);

  // Auto-guardado cada 30 segundos si hay cambios
  useEffect(() => {
    if (hasUnsavedChanges) {
      const autoSaveTimer = setTimeout(() => {
        saveChanges().catch(console.error);
      }, 30000); // 30 segundos
      
      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, saveChanges]);

  return {
    // Estado actual
    preferences: localPreferences,
    isLoading,
    hasUnsavedChanges,
    
    // Acciones de configuración
    updatePreference,
    updateMultiple,
    saveChanges,
    resetToDefaults,
    
    // Presets
    applyPreset,
    
    // Utilidades
    exportSettings,
    importSettings,
    getPreferenceValue,
    
    // Estado de la UI
    isSettingsModalOpen,
    openSettings,
    closeSettings,
    toggleSettings
  };
};
