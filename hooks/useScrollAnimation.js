// 🎬 useScrollAnimation Hook - Animaciones activadas por scroll

import { useState, useEffect, useRef } from 'react'

/**
 * Hook para activar animaciones cuando el elemento entra en viewport
 * @param {Object} options - Configuración del Intersection Observer
 * @param {string} animationType - Tipo de animación a aplicar
 * @param {number} delay - Delay opcional en ms antes de activar la animación
 * @returns {Object} ref y estado de animación
 */
export const useScrollAnimation = (options = {}, animationType = 'fadeIn', delay = 0, immediateLoad = false) => {
  const [isVisible, setIsVisible] = useState(immediateLoad) // Permitir carga inmediata
  const [hasAnimated, setHasAnimated] = useState(immediateLoad)
  const elementRef = useRef(null)

  // Detectar si es móvil
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  // Configuración por defecto del Intersection Observer (optimizada para móviles)
  const defaultOptions = {
    threshold: isMobile ? 0.05 : 0.1, // Más sensible en móviles
    rootMargin: isMobile ? '0px 0px -50px 0px' : '0px 0px -100px 0px', // Menos agresivo en móviles
    ...options
  }

  useEffect(() => {
    const currentElement = elementRef.current
    if (!currentElement) return

    // Verificar si el usuario prefiere animaciones reducidas
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setIsVisible(true)
      setHasAnimated(true)
      return
    }

    // Si ya está configurado para carga inmediata, no usar observer
    if (immediateLoad) {
      if (delay > 0) {
        setTimeout(() => {
          setIsVisible(true)
          setHasAnimated(true)
        }, delay)
      } else {
        setIsVisible(true)
        setHasAnimated(true)
      }
      return
    }

    // Verificar si el elemento ya está en viewport al montar
    const rect = currentElement.getBoundingClientRect()
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
    
    if (isInViewport && !hasAnimated) {
      if (delay > 0) {
        setTimeout(() => {
          setIsVisible(true)
          setHasAnimated(true)
        }, delay)
      } else {
        setIsVisible(true)
        setHasAnimated(true)
      }
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            // Aplicar delay si se especifica
            if (delay > 0) {
              setTimeout(() => {
                setIsVisible(true)
                setHasAnimated(true)
              }, delay)
            } else {
              setIsVisible(true)
              setHasAnimated(true)
            }
          }
        })
      },
      defaultOptions
    )

    observer.observe(currentElement)

    // Fallback timeout para casos donde el observer no funcione
    const fallbackTimeout = setTimeout(() => {
      if (!hasAnimated) {
        setIsVisible(true)
        setHasAnimated(true)
      }
    }, 3000) // 3 segundos de fallback

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
      clearTimeout(fallbackTimeout)
    }
  }, [hasAnimated, delay, immediateLoad, defaultOptions.threshold, defaultOptions.rootMargin])

  // Generar estilos de animación basados en el tipo
  const getAnimationStyle = () => {
    const baseStyle = {
      willChange: 'transform, opacity', // Optimización para móviles
    }

    if (!isVisible) {
      // Estados iniciales antes de la animación
      switch (animationType) {
        case 'fadeIn':
          return {
            ...baseStyle,
            opacity: 0,
            transform: 'translateY(20px)', // Menos agresivo
            transition: 'all 0.6s ease-out' // Más rápido
          }
        case 'slideUp':
          return {
            ...baseStyle,
            opacity: 0,
            transform: 'translateY(30px)', // Menos agresivo
            transition: 'all 0.5s ease-out'
          }
        case 'slideLeft':
          return {
            ...baseStyle,
            opacity: 0,
            transform: 'translateX(30px)', // Menos agresivo
            transition: 'all 0.6s ease-out'
          }
        case 'slideRight':
          return {
            ...baseStyle,
            opacity: 0,
            transform: 'translateX(-30px)', // Menos agresivo
            transition: 'all 0.6s ease-out'
          }
        case 'zoom':
          return {
            ...baseStyle,
            opacity: 0,
            transform: 'scale(0.9)', // Menos agresivo
            transition: 'all 0.5s ease-out'
          }
        case 'background':
          return {
            ...baseStyle,
            backgroundSize: '100%',
            transition: 'background-size 1.5s ease-out' // Más rápido
          }
        case 'bounce':
          return {
            ...baseStyle,
            opacity: 0,
            transform: 'translateY(-20px)', // Menos agresivo
            transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          }
        default:
          return {
            ...baseStyle,
            opacity: 0,
            transition: 'opacity 0.5s ease-out'
          }
      }
    } else {
      // Estados finales después de la animación
      switch (animationType) {
        case 'fadeIn':
        case 'slideUp':
        case 'slideLeft':
        case 'slideRight':
        case 'bounce':
          return {
            ...baseStyle,
            opacity: 1,
            transform: 'translateY(0) translateX(0)',
            transition: 'all 0.6s ease-out'
          }
        case 'zoom':
          return {
            ...baseStyle,
            opacity: 1,
            transform: 'scale(1)',
            transition: 'all 0.5s ease-out'
          }
        case 'background':
          return {
            ...baseStyle,
            backgroundSize: '120%', // Menos agresivo
            transition: 'background-size 1.5s ease-out'
          }
        default:
          return {
            ...baseStyle,
            opacity: 1,
            transition: 'opacity 0.5s ease-out'
          }
      }
    }
  }

  return {
    ref: elementRef,
    isVisible,
    hasAnimated,
    style: getAnimationStyle(),
    // Clases de animación CSS si prefieres usarlas
    className: isVisible ? `animate-${animationType}-visible` : `animate-${animationType}-hidden`
  }
}
