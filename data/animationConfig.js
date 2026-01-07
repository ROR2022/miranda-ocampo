// 🎬 Animation Configuration - Configuración centralizada de animaciones por sección

export const sectionAnimations = {
  hero: {
    type: 'background',
    delay: 0,
    options: {
      threshold: 0.2,
      rootMargin: '0px'
    }
  },
  date: {
    type: 'fadeIn',
    delay: 200,
    options: {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    }
  },
  ceremony: {
    type: 'slideLeft',
    delay: 300,
    options: {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    }
  },
  reception: {
    type: 'slideRight',
    delay: 400,
    options: {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    }
  },
  timeline: {
    type: 'zoom',
    delay: 300,
    options: {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    }
  },
  dressCode: {
    type: 'bounce',
    delay: 200,
    options: {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    }
  },
  gifts: {
    type: 'fadeIn',
    delay: 250,
    options: {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    }
  },
  cta: {
    type: 'slideUp',
    delay: 300,
    options: {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  }
}

// Función helper para obtener configuración de animación
export const getAnimationConfig = (sectionName) => {
  return sectionAnimations[sectionName] || {
    type: 'fadeIn',
    delay: 0,
    options: { threshold: 0.1 }
  }
}
