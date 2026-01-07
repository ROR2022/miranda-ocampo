// 🪄 Hook para animaciones mágicas del TimelineSection
import { useState, useEffect, useRef, useCallback } from 'react';

export const useMagicalAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [sparklePositions, setSparklePositions] = useState([]);
  const sectionRef = useRef(null);
  const itemRefs = useRef([]);

  // Generar posiciones aleatorias para partículas sparkle
  const generateSparkles = useCallback(() => {
    const sparkles = [];
    for (let i = 0; i < 15; i++) {
      sparkles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 4,
        size: Math.random() * 8 + 4,
      });
    }
    return sparkles;
  }, []);

  // Configurar IntersectionObserver para la sección principal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Generar sparkles cuando la sección se vuelve visible
            if (sparklePositions.length === 0) {
              setSparklePositions(generateSparkles());
            }
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-50px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [generateSparkles, sparklePositions.length]);

  // Configurar IntersectionObserver para elementos individuales
  useEffect(() => {
    if (!isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.dataset.index);
          if (entry.isIntersecting) {
            setVisibleItems(prev => new Set([...prev, index]));
          }
        });
      },
      {
        threshold: 0.6,
        rootMargin: '-20px',
      }
    );

    // Observar cada elemento con un pequeño retraso
    itemRefs.current.forEach((ref, index) => {
      if (ref) {
        setTimeout(() => {
          observer.observe(ref);
        }, index * 100);
      }
    });

    return () => {
      itemRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [isVisible]);

  // Función para obtener ref de elementos
  const getItemRef = useCallback((index) => {
    return (el) => {
      if (el) {
        itemRefs.current[index] = el;
        el.dataset.index = index;
      }
    };
  }, []);

  // Función para verificar si un item está visible
  const isItemVisible = useCallback((index) => {
    return visibleItems.has(index);
  }, [visibleItems]);

  // Función para obtener el delay de animación
  const getAnimationDelay = useCallback((index) => {
    return `${index * 0.2}s`;
  }, []);

  // Generar nuevas sparkles si es necesario
  const refreshSparkles = useCallback(() => {
    setSparklePositions(generateSparkles());
  }, [generateSparkles]);

  return {
    sectionRef,
    isVisible,
    isItemVisible,
    getItemRef,
    getAnimationDelay,
    sparklePositions,
    refreshSparkles,
  };
};