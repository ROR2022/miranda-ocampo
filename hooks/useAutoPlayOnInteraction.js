// 🎵 useAutoPlayOnInteraction Hook - Detecta primera interacción del usuario

"use client"

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook para detectar la primera interacción del usuario y habilitar auto-play
 * Características:
 * - Detecta múltiples tipos de interacción (click, scroll, touch, keypress)
 * - Cumple con políticas de auto-play de navegadores modernos
 * - Callback único por sesión
 * - Cleanup automático después de la primera interacción
 */
function useAutoPlayOnInteraction() {
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isWaitingForInteraction, setIsWaitingForInteraction] = useState(true)

  // Función para manejar la primera interacción
  const handleFirstInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true)
      setIsWaitingForInteraction(false)
      
      // Log para debugging
      console.log('🎵 Primera interacción detectada - Auto-play habilitado')
    }
  }, [hasInteracted])

  // Configurar listeners de eventos
  useEffect(() => {
    if (hasInteracted) {
      return // Ya no necesitamos listeners
    }

    // Lista de eventos que indican interacción del usuario
    const interactionEvents = [
      'click',
      'touchstart',
      'touchend', 
      'keydown',
    ]

    // Agregar listeners
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { 
        once: true, // Solo se ejecuta una vez
        passive: true // No bloquea el scroll
      })
    })

    // Cleanup - remover listeners
    return () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction)
      })
    }
  }, [hasInteracted, handleFirstInteraction])

  // Función para intentar auto-play después de interacción
  const tryAutoPlay = useCallback((audioElement) => {
    if (!audioElement || !hasInteracted) {
      return Promise.reject('No hay interacción del usuario aún')
    }

    // Intentar reproducir
    return audioElement.play().then(() => {
      console.log('🎵 Auto-play exitoso')
      return true
    }).catch((error) => {
      console.warn('🎵 Auto-play falló:', error.message)
      return false
    })
  }, [hasInteracted])

  return {
    hasInteracted,
    isWaitingForInteraction,
    tryAutoPlay,
    // Función para marcar manualmente como interactuado (útil para testing)
    markAsInteracted: () => setHasInteracted(true)
  }
}

export { useAutoPlayOnInteraction }