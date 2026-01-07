'use client'

import { useState, useRef, useCallback } from 'react';

// Configuración de gestos táctiles
const TOUCH_CONFIG = {
  minSwipeDistance: 50,        // Distancia mínima para considerar un swipe (px)
  maxSwipeTime: 300,           // Tiempo máximo para un swipe válido (ms)
  velocityThreshold: 0.3,      // Velocidad mínima para trigger swipe
  verticalTolerance: 100,      // Tolerancia para movimiento vertical (px)
  touchStartDelay: 150,        // Delay antes de iniciar detección de swipe
  feedbackDuration: 200,       // Duración del feedback visual (ms)
  preventScrollThreshold: 30,  // Umbral para prevenir scroll vertical
};

interface TouchPosition {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGestureState {
  isActive: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
  velocity: number;
  startPosition: TouchPosition | null;
  currentPosition: TouchPosition | null;
}

interface UseSwipeGesturesProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeStart?: (direction: 'left' | 'right') => void;
  onSwipeEnd?: () => void;
  enabled?: boolean;
  preventScroll?: boolean;
}

export const useSwipeGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeStart,
  onSwipeEnd,
  enabled = true,
  preventScroll = true
}: UseSwipeGesturesProps) => {
  
  const [swipeState, setSwipeState] = useState<SwipeGestureState>({
    isActive: false,
    direction: null,
    distance: 0,
    velocity: 0,
    startPosition: null,
    currentPosition: null
  });

  const [feedbackState, setFeedbackState] = useState({
    showLeftFeedback: false,
    showRightFeedback: false,
    feedbackIntensity: 0 // 0-1 para indicar qué tan fuerte es el swipe
  });

  // Referencias para tracking
  const touchStartRef = useRef<TouchPosition | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const preventScrollRef = useRef<boolean>(false);
  const swipeActiveRef = useRef<boolean>(false);

  /**
   * 📱 Handler para inicio de touch
   */
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    const touch = e.touches[0];
    const startPosition: TouchPosition = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    touchStartRef.current = startPosition;
    touchStartTimeRef.current = Date.now();
    preventScrollRef.current = false;
    swipeActiveRef.current = false;

    setSwipeState(prev => ({
      ...prev,
      startPosition,
      currentPosition: startPosition,
      isActive: false,
      direction: null,
      distance: 0
    }));

    // Reset feedback
    setFeedbackState({
      showLeftFeedback: false,
      showRightFeedback: false,
      feedbackIntensity: 0
    });

  }, [enabled]);

  /**
   * 👆 Handler para movimiento de touch
   */
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStartRef.current) return;

    const touch = e.touches[0];
    const currentPosition: TouchPosition = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    const startPos = touchStartRef.current;
    const deltaX = currentPosition.x - startPos.x;
    const deltaY = currentPosition.y - startPos.y;
    //const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determinar si es un swipe horizontal válido
    const isHorizontalSwipe = absX > absY && absX > TOUCH_CONFIG.minSwipeDistance / 2;
    const shouldPreventScroll = preventScroll && isHorizontalSwipe && absX > TOUCH_CONFIG.preventScrollThreshold;

    // Prevenir scroll si es necesario
    if (shouldPreventScroll && !preventScrollRef.current) {
      preventScrollRef.current = true;
      e.preventDefault();
    }

    if (preventScrollRef.current) {
      e.preventDefault();
    }

    // Calcular dirección y estado del swipe
    let direction: 'left' | 'right' | null = null;
    if (isHorizontalSwipe) {
      direction = deltaX < 0 ? 'left' : 'right';
      
      // Activar swipe si cumple condiciones
      if (!swipeActiveRef.current && absX > TOUCH_CONFIG.minSwipeDistance / 3) {
        swipeActiveRef.current = true;
        if (onSwipeStart) {
          onSwipeStart(direction);
        }
      }
    }

    // Calcular intensidad del feedback (0-1)
    const maxFeedbackDistance = 150;
    const feedbackIntensity = Math.min(absX / maxFeedbackDistance, 1);

    // Actualizar estado
    setSwipeState(prev => ({
      ...prev,
      currentPosition,
      isActive: swipeActiveRef.current,
      direction,
      distance: absX,
      velocity: absX / Math.max(currentPosition.timestamp - startPos.timestamp, 1)
    }));

    // Actualizar feedback visual
    if (isHorizontalSwipe && absX > 20) {
      setFeedbackState({
        showLeftFeedback: direction === 'left',
        showRightFeedback: direction === 'right',
        feedbackIntensity
      });
    }

  }, [enabled, preventScroll, onSwipeStart]);

  /**
   * 🎯 Handler para fin de touch
   */
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStartRef.current) return;

    const endTime = Date.now();
    const swipeTime = endTime - touchStartTimeRef.current;
    const startPos = touchStartRef.current;

    // Obtener posición final
    const touch = e.changedTouches[0];
    const endPosition: TouchPosition = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: endTime
    };

    const deltaX = endPosition.x - startPos.x;
    const deltaY = endPosition.y - startPos.y;
    const distance = Math.abs(deltaX);
    const velocity = distance / Math.max(swipeTime, 1);

    // Validar si es un swipe válido
    const isValidSwipe = 
      distance >= TOUCH_CONFIG.minSwipeDistance &&
      swipeTime <= TOUCH_CONFIG.maxSwipeTime &&
      velocity >= TOUCH_CONFIG.velocityThreshold &&
      Math.abs(deltaY) <= TOUCH_CONFIG.verticalTolerance;

    if (isValidSwipe) {
      const direction = deltaX < 0 ? 'left' : 'right';
      
      // Ejecutar callback correspondiente
      if (direction === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (direction === 'right' && onSwipeRight) {
        onSwipeRight();
      }

      // Mostrar feedback de confirmación
      setFeedbackState(prev => ({
        ...prev,
        feedbackIntensity: 1
      }));

      // Ocultar feedback después de un tiempo
      setTimeout(() => {
        setFeedbackState({
          showLeftFeedback: false,
          showRightFeedback: false,
          feedbackIntensity: 0
        });
      }, TOUCH_CONFIG.feedbackDuration);
    } else {
      // Swipe no válido - reset feedback gradualmente
      setFeedbackState(prev => ({
        ...prev,
        feedbackIntensity: Math.max(prev.feedbackIntensity - 0.3, 0)
      }));

      setTimeout(() => {
        setFeedbackState({
          showLeftFeedback: false,
          showRightFeedback: false,
          feedbackIntensity: 0
        });
      }, 100);
    }

    // Ejecutar callback de fin
    if (onSwipeEnd) {
      onSwipeEnd();
    }

    // Reset estado
    setSwipeState({
      isActive: false,
      direction: null,
      distance: 0,
      velocity: 0,
      startPosition: null,
      currentPosition: null
    });

    // Reset referencias
    touchStartRef.current = null;
    preventScrollRef.current = false;
    swipeActiveRef.current = false;

  }, [enabled, onSwipeLeft, onSwipeRight, onSwipeEnd]);

  /**
   * 🎭 Ref callback para adjuntar eventos al elemento
   */
  const attachSwipeListeners = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    // Configurar eventos touch con opciones pasivas apropiadas
    const touchStartOptions = { passive: false };
    const touchMoveOptions = { passive: false };
    const touchEndOptions = { passive: true };

    element.addEventListener('touchstart', handleTouchStart, touchStartOptions);
    element.addEventListener('touchmove', handleTouchMove, touchMoveOptions);
    element.addEventListener('touchend', handleTouchEnd, touchEndOptions);

    // Cleanup function
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  /**
   * 🎨 Generar estilos para feedback visual
   */
  const getFeedbackStyles = useCallback(() => {
    const { showLeftFeedback, showRightFeedback, feedbackIntensity } = feedbackState;
    
    if (!showLeftFeedback && !showRightFeedback) {
      return null;
    }

    const opacity = feedbackIntensity * 0.3;
    const scale = 1 + (feedbackIntensity * 0.05);

    return {
      position: 'absolute' as const,
      top: '50%',
      [showLeftFeedback ? 'left' : 'right']: '20px',
      transform: `translateY(-50%) scale(${scale})`,
      backgroundColor: showLeftFeedback ? 'rgba(255, 179, 217, 0.8)' : 'rgba(230, 217, 255, 0.8)',
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
      transition: 'all 0.1s ease-out',
      pointerEvents: 'none' as const,
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 255, 255, 0.5)'
    };
  }, [feedbackState]);

  /**
   * 📊 Información de debug para desarrollo
   */
  const getDebugInfo = useCallback(() => {
    return {
      swipeState,
      feedbackState,
      config: TOUCH_CONFIG,
      isActive: swipeState.isActive,
      currentDirection: swipeState.direction,
      currentDistance: swipeState.distance,
      currentVelocity: swipeState.velocity
    };
  }, [swipeState, feedbackState]);

  return {
    // Estado del swipe
    swipeState,
    feedbackState,
    
    // Attachment para elementos
    attachSwipeListeners,
    
    // Estilos para feedback
    getFeedbackStyles,
    
    // Utilidades
    getDebugInfo,
    isSwipeActive: swipeState.isActive,
    swipeDirection: swipeState.direction,
    swipeDistance: swipeState.distance,
    
    // Configuración
    config: TOUCH_CONFIG
  };
};
