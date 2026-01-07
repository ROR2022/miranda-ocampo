"use client"

import React, { useState, useEffect, useMemo } from "react";



function shuffle(array) {
  const arr = [...array]; // copia para no mutar el original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Sistema de animaciones pareadas (entrada + salida)
const animations = [
  // 1. Izquierda → Derecha
  {
    entry: 'opacity-0 -translate-x-full',
    exit: 'opacity-0 translate-x-full',
    visible: 'opacity-100 translate-x-0'
  },
  // 2. Derecha → Izquierda
  {
    entry: 'opacity-0 translate-x-full',
    exit: 'opacity-0 -translate-x-full',
    visible: 'opacity-100 translate-x-0'
  },
  // 3. Arriba → Abajo
  {
    entry: 'opacity-0 -translate-y-full',
    exit: 'opacity-0 translate-y-full',
    visible: 'opacity-100 translate-y-0'
  },
  // 4. Abajo → Arriba
  {
    entry: 'opacity-0 translate-y-full',
    exit: 'opacity-0 -translate-y-full',
    visible: 'opacity-100 translate-y-0'
  },
  // 5. Arriba → Derecha
  {
    entry: 'opacity-0 -translate-y-full',
    exit: 'opacity-0 translate-x-full',
    visible: 'opacity-100 translate-x-0 translate-y-0'
  },
  // 6. Arriba → Izquierda
  {
    entry: 'opacity-0 -translate-y-full',
    exit: 'opacity-0 -translate-x-full',
    visible: 'opacity-100 translate-x-0 translate-y-0'
  },
  // 7. Abajo → Derecha
  {
    entry: 'opacity-0 translate-y-full',
    exit: 'opacity-0 translate-x-full',
    visible: 'opacity-100 translate-x-0 translate-y-0'
  },
  // 8. Abajo → Izquierda
  {
    entry: 'opacity-0 translate-y-full',
    exit: 'opacity-0 -translate-x-full',
    visible: 'opacity-100 translate-x-0 translate-y-0'
  },
  // 9. Izquierda → Abajo
  {
    entry: 'opacity-0 -translate-x-full',
    exit: 'opacity-0 translate-y-full',
    visible: 'opacity-100 translate-x-0 translate-y-0'
  },
  // 10. Derecha → Abajo
  {
    entry: 'opacity-0 translate-x-full',
    exit: 'opacity-0 translate-y-full',
    visible: 'opacity-100 translate-x-0 translate-y-0'
  },
  // 11. Fade simple
  {
    entry: 'opacity-0',
    exit: 'opacity-0',
    visible: 'opacity-100'
  },
  // 12. Zoom In → Fade Out
  {
    entry: 'opacity-0 scale-50',
    exit: 'opacity-0 scale-100',
    visible: 'opacity-100 scale-100'
  },
  // 13. Fade In → Zoom Out
  {
    entry: 'opacity-0 scale-100',
    exit: 'opacity-0 scale-150',
    visible: 'opacity-100 scale-100'
  },
  // 14. Diagonal: Superior Derecha → Inferior Izquierda
  {
    entry: 'opacity-0 translate-x-full -translate-y-full',
    exit: 'opacity-0 -translate-x-full translate-y-full',
    visible: 'opacity-100 translate-x-0 translate-y-0'
  },
  // 15. Diagonal: Superior Izquierda → Inferior Derecha
  {
    entry: 'opacity-0 -translate-x-full -translate-y-full',
    exit: 'opacity-0 translate-x-full translate-y-full',
    visible: 'opacity-100 translate-x-0 translate-y-0'
  },
];

const getRandomAnimation = () => {
  const randomIndex = Math.floor(Math.random() * animations.length);
  return animations[randomIndex];
};


const BackgroundCarrousel = ({images}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentAnimation, setCurrentAnimation] = useState(getRandomAnimation());
  const [animationState, setAnimationState] = useState('entry'); // 'entry', 'visible', 'exit'

  // Mezclar imágenes solo una vez al montar el componente
  const shuffledImages = useMemo(() => shuffle(images), [images]);

  // Auto-avance del carrusel con animación
  useEffect(() => {
    // Fase 1: Entrada (0-2500ms) - Animación de entrada más lenta
    setAnimationState('entry');
    
    const entryTimer = setTimeout(() => {
      setAnimationState('visible');
    }, 100);

    // Fase 2: Visible (2500ms-6500ms) - Imagen totalmente visible
    const visibleTimer = setTimeout(() => {
      setAnimationState('exit');
    }, 6500);

    // Fase 3: Salida (6500ms-9000ms) - Animación de salida más lenta y cambio de imagen
    const exitTimer = setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % shuffledImages.length);
      setCurrentAnimation(getRandomAnimation());
      setAnimationState('entry');
    }, 9000);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(visibleTimer);
      clearTimeout(exitTimer);
    };
  }, [currentImageIndex, shuffledImages.length]);

  if(typeof window === 'undefined') {
    return null; // Evita renderizado en el servidor
  }

  // Determinar qué clases aplicar según el estado
  const getAnimationClasses = () => {
    switch(animationState) {
      case 'entry':
        return currentAnimation.entry;
      case 'visible':
        return currentAnimation.visible;
      case 'exit':
        return currentAnimation.exit;
      default:
        return currentAnimation.entry;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
      {/* Imagen actual del carrusel con animación aleatoria */}
      <div
        key={currentImageIndex}
        className={`absolute inset-0 transition-all duration-[2500ms] ease-in-out ${getAnimationClasses()}`}
        style={{
          backgroundImage: `url('${shuffledImages[currentImageIndex]}')`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
};

export default BackgroundCarrousel;
