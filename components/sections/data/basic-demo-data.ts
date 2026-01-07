// Datos demo para el paquete básico de quinceañera
export const basicDemoData = {
  hero: {
    name: "Edana Ximena",
    subtitle: "¡Mis XV años!",
    backgroundImage: "/images/quince/encantada1.png"
  },
  
  event: {
    celebrant: "Edana Ximena",
    //Padres María de Jesús Gutiérrez y Andres Ramírez
    parents: {
      father: "Andres Ramírez",
      mother: "Maria de Jesús Gutiérrez"
    },
    //Padrino Ma. Asunción Ramirez y Juan Gutiérrez
    godparents: {
      godfather: "Juan Gutiérrez",
      godmother: "Ma. Asunción Ramirez"
    },
    date: {
      full: "Sábado 27 de Diciembre 2025",
      day: "Sábado",
      date: "27 de Diciembre 2025"
    },
    //Misa a la 1pm parroquia Santa fe de Guadalupe, la Sauceda Guanajuato.
    ceremony: {
      time: "13:00 hrs.",
      venue: "Parroquia Santa Fe de Guadalupe",
      address: "Santa fe de Guadalupe, la Sauceda Guanajuato.",
      type: "Misa de Acción de Gracias",
      ubiLink: "https://maps.app.goo.gl/WfeVYukpQg3CWC2T8"
    },
    party: {
      time: "14:00 hrs.",
      venue: "Salón Texano",
      address: "Santa fe de Guadalupe, la Sauceda Guanajuato.",
      type: "Recepción",
      ubiLink: "https://maps.app.goo.gl/qNFsbPPuwyCSMUim9"
    },
    dressCode: "Formal - Rosa solo la quinceañera",
    restrictions: ""
  },

  countdown: {
    targetDate: "December 27, 2025 17:00:00",
    backgroundImage: "/images/countdown-bg.jpg"
  },

  attendance: {
    title: "CONFIRMACIÓN DE ASISTENCIA",
    message: "Respetuosamente",
    subtitle: "Confirmar antes del evento.",
    fields: {
      name: "Nombre completo",
      response: "¿Podrás acompañarme?",
      companions: "Nombre(s) de acompañante(s)",
      phone: "Número de celular",
      responseOptions: {
        yes: "¡Claro, ahí estaré!",
        no: "Lo siento, no podré asistir."
      }
    }
  },

  gifts: {
    title: "OPCIONES DE REGALO",
    message: "Mi mejor regalo es compartir contigo este gran día, si deseas obsequiarme algo, puedo sugerir las siguientes opciones:",
    options: [
      {
        icon: "🎁",
        title: "Regalo Sorpresa",
        description: "¡Sorpréndeme con algo especial!",
        details: "Mi mejor regalo es tu presencia."
      },
      {
        icon: "💰",
        title: "Sobre con efectivo",
        description: "El día del evento",
        details: "Puedes entregarlo en la recepción"
      }
    ]
  },

  demo: {
    badge: "🎭 DEMO - Paquete Básico ($299)",
    description: "Esta es una demostración del paquete básico",
    features: [
      "Cuenta Regresiva",
      "Cuándo y dónde", 
      "Confirmación de asistencia",
      "Opciones de regalo",
      "Código de vestimenta"
    ],
    cta: {
      title: "¿Te gusta este paquete?",
      subtitle: "Incluye todas las características esenciales para tu evento",
      buttonText: "Contratar Paquete Básico - $299",
      link: "/#pricing"
    }
  }
}

export type BasicDemoData = typeof basicDemoData 