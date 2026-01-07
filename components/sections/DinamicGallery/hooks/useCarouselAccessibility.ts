'use client'

import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * ♿ Hook para gestión completa de accesibilidad en carrusel
 * Maneja navegación por teclado, lectores de pantalla, y ARIA labels
 */

interface AccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  keyboardNavigation: boolean;
  screenReaderOptimized: boolean;
  announceChanges: boolean;
  focusManagement: boolean;
}

interface CarouselAccessibilityProps {
  totalItems: number;
  currentIndex: number;
  isPlaying: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onTogglePlayback: () => void;
  onGoToSlide: (index: number) => void;
  config: AccessibilityConfig;
  photoTitles?: string[];
}

export const useCarouselAccessibility = ({
  totalItems,
  currentIndex,
  isPlaying,
  onNext,
  onPrevious,
  onTogglePlayback,
  onGoToSlide,
  config,
  photoTitles = []
}: CarouselAccessibilityProps) => {

  // Referencias para manejo de foco
  const carouselRef = useRef<HTMLDivElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  // Estado de navegación por teclado
  const [keyboardActive, setKeyboardActive] = useState(false);
  const [focusedElementIndex, setFocusedElementIndex] = useState(-1);
  const [announcements, setAnnouncements] = useState<string[]>([]);

  /**
   * 📢 Función para anunciar cambios a lectores de pantalla
   */
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    console.log('priority:', priority);

    if (!config.announceChanges) return;

    setAnnouncements(prev => {
      const newAnnouncements = [...prev, message];
      
      // Mantener solo los últimos 3 anuncios
      if (newAnnouncements.length > 3) {
        return newAnnouncements.slice(-3);
      }
      return newAnnouncements;
    });

    // Limpiar anuncio después de 5 segundos
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a !== message));
    }, 5000);
  }, [config.announceChanges]);

  /**
   * ⌨️ Handler principal para navegación por teclado
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!config.keyboardNavigation) return;

    // Activar modo teclado
    setKeyboardActive(true);

    const { key, ctrlKey, shiftKey, altKey } = event;

    // Navegación básica
    switch (key) {
      case 'ArrowLeft':
      case 'h': // Vim-style
        event.preventDefault();
        onPrevious();
        announce(`Foto ${currentIndex} de ${totalItems}: ${photoTitles[currentIndex - 1] || 'Sin título'}`);
        break;

      case 'ArrowRight':
      case 'l': // Vim-style
        event.preventDefault();
        onNext();
        announce(`Foto ${currentIndex + 2} de ${totalItems}: ${photoTitles[currentIndex + 1] || 'Sin título'}`);
        break;

      case 'Home':
        event.preventDefault();
        onGoToSlide(0);
        announce(`Primera foto: ${photoTitles[0] || 'Sin título'}`);
        break;

      case 'End':
        event.preventDefault();
        onGoToSlide(totalItems - 1);
        announce(`Última foto: ${photoTitles[totalItems - 1] || 'Sin título'}`);
        break;

      case ' ':
      case 'Enter':
        if (event.target === carouselRef.current || carouselRef.current?.contains(event.target as Node)) {
          event.preventDefault();
          onTogglePlayback();
          announce(isPlaying ? 'Presentación pausada' : 'Presentación iniciada', 'assertive');
        }
        break;

      case 'Escape':
        event.preventDefault();
        if (isPlaying) {
          onTogglePlayback();
          announce('Presentación detenida', 'assertive');
        }
        break;

      // Navegación numérica
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        if (!ctrlKey && !altKey) {
          const slideIndex = parseInt(key) - 1;
          if (slideIndex < totalItems) {
            event.preventDefault();
            onGoToSlide(slideIndex);
            announce(`Foto ${slideIndex + 1}: ${photoTitles[slideIndex] || 'Sin título'}`);
          }
        }
        break;

      // Ayuda
      case '?':
      case 'h':
        if (shiftKey) {
          event.preventDefault();
          showKeyboardHelp();
        }
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.keyboardNavigation, onPrevious, onNext, onTogglePlayback, onGoToSlide, currentIndex, totalItems, isPlaying, photoTitles, announce]);

  /**
   * 🖱️ Handler para detectar uso de mouse (desactivar modo teclado)
   */
  const handleMouseInteraction = useCallback(() => {
    setKeyboardActive(false);
    setFocusedElementIndex(-1);
  }, []);

  /**
   * 🎯 Gestión de foco para elementos interactivos
   */
  const updateFocusableElements = useCallback(() => {
    if (!carouselRef.current) return;

    const focusableSelectors = [
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])'
    ].join(', ');

    const elements = Array.from(carouselRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[];
    focusableElementsRef.current = elements;
  }, []);

  /**
   * ➡️ Navegación de foco con Tab personalizada
   */
  const handleTabNavigation = useCallback((event: KeyboardEvent) => {
    if (!config.focusManagement || !keyboardActive) return;

    const { key, shiftKey } = event;
    if (key !== 'Tab') return;

    event.preventDefault();
    
    const elements = focusableElementsRef.current;
    if (elements.length === 0) return;

    let nextIndex;
    if (shiftKey) {
      // Tab hacia atrás
      nextIndex = focusedElementIndex <= 0 ? elements.length - 1 : focusedElementIndex - 1;
    } else {
      // Tab hacia adelante
      nextIndex = focusedElementIndex >= elements.length - 1 ? 0 : focusedElementIndex + 1;
    }

    setFocusedElementIndex(nextIndex);
    elements[nextIndex]?.focus();
  }, [config.focusManagement, keyboardActive, focusedElementIndex]);

  /**
   * ❓ Mostrar ayuda de teclado
   */
  const showKeyboardHelp = useCallback(() => {
    const helpText = `
Atajos de teclado del carrusel:
← / h: Foto anterior
→ / l: Foto siguiente
Espacio/Enter: Play/Pausa
Home: Primera foto
End: Última foto
1-9: Ir a foto específica
Esc: Parar presentación
Shift+?: Esta ayuda
`;
    announce(helpText, 'assertive');
  }, [announce]);

  /**
   * 🏷️ Generar ARIA labels dinámicos
   */
  const getAriaLabels = useCallback(() => {
    const currentPhotoTitle = photoTitles[currentIndex] || `Foto ${currentIndex + 1}`;
    
    return {
      carousel: `Carrusel de fotos, ${totalItems} fotos en total, foto actual: ${currentIndex + 1}`,
      currentSlide: `${currentPhotoTitle}, foto ${currentIndex + 1} de ${totalItems}`,
      nextButton: `Siguiente foto${totalItems > currentIndex + 1 ? `: ${photoTitles[currentIndex + 1] || `Foto ${currentIndex + 2}`}` : ''}`,
      prevButton: `Foto anterior${currentIndex > 0 ? `: ${photoTitles[currentIndex - 1] || `Foto ${currentIndex}`}` : ''}`,
      playButton: isPlaying ? 'Pausar presentación de fotos' : 'Iniciar presentación automática de fotos',
      slideIndicator: (index: number) => `Ir a foto ${index + 1}${photoTitles[index] ? `: ${photoTitles[index]}` : ''}`,
      progressBar: `Progreso de presentación: ${isPlaying ? 'reproduciéndose' : 'pausada'}`
    };
  }, [photoTitles, currentIndex, totalItems, isPlaying]);

  /**
   * 📊 Obtener estado de progreso para lectores de pantalla
   */
  const getProgressDescription = useCallback((progress: number) => {
    if (!isPlaying) return '';
    
    const percentage = Math.round(progress);
    if (percentage % 25 === 0 && percentage > 0) {
      return `${percentage}% completado hasta la siguiente foto`;
    }
    return '';
  }, [isPlaying]);

  /**
   * 🎨 Obtener estilos de accesibilidad
   */
  const getAccessibilityStyles = useCallback(() => {
    return {
      // Focus visible para navegación por teclado
      focusVisible: keyboardActive ? {
        outline: '3px solid #FFB3D9',
        outlineOffset: '2px',
        borderRadius: '4px'
      } : {},
      
      // Alto contraste
      highContrast: config.highContrast ? {
        filter: 'contrast(1.5)',
        border: '2px solid #000'
      } : {},
      
      // Movimiento reducido
      reducedMotion: config.reducedMotion ? {
        transition: 'none',
        animation: 'none'
      } : {
        transition: 'all 0.3s ease'
      }
    };
  }, [keyboardActive, config.highContrast, config.reducedMotion]);

  // Configurar event listeners
  useEffect(() => {
    if (!config.keyboardNavigation) return;

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleTabNavigation);
    document.addEventListener('click', handleMouseInteraction);
    document.addEventListener('mousedown', handleMouseInteraction);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleTabNavigation);
      document.removeEventListener('click', handleMouseInteraction);
      document.removeEventListener('mousedown', handleMouseInteraction);
    };
  }, [handleKeyDown, handleTabNavigation, handleMouseInteraction, config.keyboardNavigation]);

  // Actualizar elementos enfocables cuando cambia el contenido
  useEffect(() => {
    updateFocusableElements();
  }, [updateFocusableElements, currentIndex]);

  // Anunciar cambios de slide automáticos
  useEffect(() => {
    if (isPlaying && config.announceChanges) {
      const title = photoTitles[currentIndex] || `Foto ${currentIndex + 1}`;
      announce(`Mostrando: ${title}`, 'polite');
    }
  }, [currentIndex, isPlaying, config.announceChanges, photoTitles, announce]);

  return {
    // Referencias
    carouselRef,
    announcementRef,
    
    // Estado
    keyboardActive,
    focusedElementIndex,
    announcements,
    
    // Funciones
    announce,
    showKeyboardHelp,
    getAriaLabels,
    getProgressDescription,
    getAccessibilityStyles,
    updateFocusableElements,
    
    // Configuración
    isAccessibilityEnabled: Object.values(config).some(Boolean),
    supportsScreenReader: config.screenReaderOptimized,
    supportsKeyboard: config.keyboardNavigation
  };
};
