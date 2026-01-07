// 💒 Wedding Data - Datos centralizados de la boda
export const weddingData = {
  // 👰🤵 Información de la pareja
  couple: {
    bride: "",
    groom: "",
    initials: "Mariam Fernanda",
    quote: "",
    mainImage: "/images/noviosEditado1.png",
    sunsetImage: "/images/quince8.png"
  },

  // 👨‍👩‍👧‍👦 Información de los padres
  
  parents: {
    bride: {
      mother: "Rosa Isela Reyes Izquierdo",
      father: "Antonio García Velázquez"
    },
    groom: {
      mother: "Karen Corpus",
      father: "Hugo Lizagarra"
    },
    message: "A mis queridos padres: Gracias por darme la vida, por cuidarme, guiarme y acompañarme hasta este día tan especial. Su amor incondicional y su ejemplo han sido los pilares fundamentales de mi crecimiento. En mis quince años, ustedes han sido mi fortaleza y mi inspiración. Con ustedes a mi lado, comienzo esta nueva etapa de mi vida llena de ilusión, sueños y esperanzas. Su presencia hace que este momento sea aún más significativo y emotivo. Los amo profundamente."
  },

  // 📅 Información de fecha y evento
  wedding: {
    date: "2025-10-25T19:00:00",
    dayName: "SABADO",
    day: "25",
    month: "OCTUBRE",
    year: "2025",
    title: "Mis XV Años"
  },

  // ⛪ Información de la ceremonia
  ceremony: {
    time: "6:00 p.m",
    name: "Palapa las Margaritas",
    address: "Frente a la universidad del valle del sureste, Convivencia, 86400 Huimanguillo, Tab.",
    type: "Ceremonia",
    ubiLink: "https://maps.app.goo.gl/GQ5xKwnkwXam69Hv8"
  },

  // 🎉 Información de la recepción
  reception: {
    time: "8:00 pm",
    name: "Monarcas Jardin de Eventos",
    address: "Calz de los Monarcas, Mexicali, 21353, BC, MX",
    type: "Recepción",
    ubiLink: "https://maps.app.goo.gl/nEwQ1CXVF7Wa1omEA"
  },

  // ⏰ Timeline del evento
  timeline: [
    {
      id: "ceremonia",
      name: "Ceremonia",
      time: "7:00",
      icon: "🧡", // Anillo de compromiso - símbolo universal del matrimonio
      color: "primary"
    },
    {
      id: "fiesta",
      name: "Fiesta",
      time: "8:00",
      icon: "🎉", // Confeti - celebración y alegría
      color: "secondary"
    },
    {
      id: "cena",
      name: "Cena",
      time: "9:00",
      icon: "🍽️", // Plato con cubiertos - cena elegante
      color: "primary"
    },
    {
      id: "brindis",
      name: "Brindis",
      time: "9:45",
      icon: "🥂", // Copas de champagne - celebración y brindis
      color: "secondary"
    },
    
  ],

  // 👗 Código de vestimenta
  dressCode: {
    type: "Formal",
    note: "Se reserva el color azul para la quinceañera",
    confirmationMessage: "¡Quiero compartir este momento tan esperado contigo! Por favor ayúdanos confirmando tu asistencia"
  },

  // 🎁 Información de regalos
  gifts: {
    type: "Lluvia de sobres",
    message: "Que estés conmigo está noche es lo más importante para nosotros."
  },

  // 📸 Galería de imágenes
  gallery: {
    images: [
      "/images/gallery-1.png",
      "/images/gallery-2.png",
      "/images/couple-sunset.png"
    ]
  },

  // 🏢 Información de la agencia
  agency: {
    name: "Agencia Online",
    message: "Te esperamos"
  },

  // 💬 Mensajes y frases
  messages: {
    timelineQuote: "Es momento de celebrar mis XV, los espero para compartir una noche de alegría y diversión.",
    dateMessage: "¡La cuenta regresiva ha comenzado!",
    countdownTitle: "TAN SÓLO FALTAN"
  },

  // 🎨 Configuraciones de estilo y fondo
  styling: {
    heroSection: {
      backgroundImage: "/images/boda3.png",
      // Opacidad del overlay (0 = transparente, 1 = opaco)
      overlayOpacity: 0.95,
      // Tipo de overlay: 'solid', 'gradient-top', 'gradient-bottom', 'gradient-radial'
      overlayType: "gradient-radial",
      // Color del overlay (usar formato CSS)
      overlayColor: "rgba(255, 255, 255, 1)", // Blanco
      // Color secundario para degradados
      overlayColorSecondary: "rgba(255, 255, 255, 0)", // Transparente
      // Configuración de degradado personalizada
      gradientDirection: "circle at center" // Para radial: 'circle at center', para lineal: 'to bottom'
    },
    dateSection: {
      backgroundImage: "/images/mesaFlores1.jpg",
      overlayOpacity: 0.95,
      overlayType: "gradient-radial",
      overlayColor: "rgba(255, 255, 255, 1)",
      overlayColorSecondary: "rgba(255, 255, 255, 0)",
      gradientDirection: "circle at center"
    },
    ceremonySection: {
      backgroundImage: "/images/boda1.png",
      overlayOpacity: 0.95,
      overlayType: "gradient-radial",
      overlayColor: "rgba(255, 255, 255, 1)",
      overlayColorSecondary: "rgba(255, 255, 255, 0)",
      gradientDirection: "circle at center"
    },
    receptionSection: {
      backgroundImage: "/images/boda1.png",
      overlayOpacity: 0.95,
      overlayType: "gradient-radial",
      overlayColor: "rgba(255, 255, 255, 1)",
      overlayColorSecondary: "rgba(255, 255, 255, 0)",
      gradientDirection: "circle at center"
    },
    timelineSection: {
      backgroundImage: "/images/boda1.png",
      overlayOpacity: 0.95,
      overlayType: "gradient-radial",
      overlayColor: "rgba(255, 255, 255, 1)",
      overlayColorSecondary: "rgba(255, 255, 255, 0)",
      gradientDirection: "circle at center"
    },
    dressCodeSection: {
      backgroundImage: "/images/boda1.png",
      overlayOpacity: 0.95,
      overlayType: "gradient-radial",
      overlayColor: "rgba(255, 255, 255, 1)",
      overlayColorSecondary: "rgba(255, 255, 255, 0)",
      gradientDirection: "circle at center"
    },
    giftsSection: {
      backgroundImage: "/images/boda1.png",
      overlayOpacity: 0.95,
      overlayType: "gradient-radial",
      overlayColor: "rgba(255, 255, 255, 1)",
      overlayColorSecondary: "rgba(255, 255, 255, 0)",
      gradientDirection: "circle at center"
    },
  },

  // 🎵 Configuración de audio
  audio: {
    src: "/audio/musica.mp3",
    fallbacks: [
      "/audio/musica.ogg",
      "/audio/musica.wav"
    ],
    title: "Música de Fondo de Boda",
    startTime: 5,        // 0:13 - Donde empieza la letra
    endTime: 200,          // 1:25 - Final del segmento
    volume: 0.7,          // 60% de volumen
    loop: true,           // Loop en el rango especificado
    preload: "metadata",  // Precargar solo metadatos
    enabled: true,        // Control habilitado
    position: {
      desktop: { bottom: "2rem", right: "2rem" },
      mobile: { bottom: "1rem", right: "1rem" }
    },
    styling: {
      size: {
        desktop: "60px",
        mobile: "50px"
      },
      colors: {
        primary: "var(--secondary)",  // Dorado
        hover: "var(--secondary)/90"
      }
    }
  }
}
