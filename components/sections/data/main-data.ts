export const quinceMainData = {
  hero: {
    name: "Miranda",
    subtitle: "¡Mi Bat Mitzvah!",
    backgroundImage: "/images/quince3.jpeg",
    quote:
      "La vida es un viaje mágico, y hoy celebro un capítulo especial lleno de sueños y esperanza.",
    backgroundCarrouselImages: [
      "/images/pao16.jpg",
      "/images/pao17.jpg",
      "/images/pao18.jpg",
      "/images/pao19.jpg",
      "/images/pao20.jpg",
    ],
  },
  welcomeSection: {
    message:
      "Celebremos juntos este día especial para mí, lleno de amor y momentos inolvidables. Espero contar con tu presencia, para compartir esta gran alegría.",
    backgroundImage: "/images/fondoPaola2.jpg",
  },
  event: {
    celebrant: "Miranda",
    /*Los padres de las quinceañera
Laura Liset de la Cruz Ovando
Armando Hernández Mola*/
    parents: {
      father: "Armando Hernández Mola",
      mother: "Laura Lizette Cruz Ovando",
      message: `Con la Bendicion de Dios y de`,
      backgroundImage: "/images/fondoPaola1.png",
    },
    /**
     * Saraí Ramírez Reyes
Ángel González Pascual 
Aurora Chávez Capultitla
     */
    godparents: {
      godfather: "Ángel González Pascual",
      godmother: "Saraí Ramírez Reyes",
      additionalGodmother: "Aurora Chávez Capultitla",
    },
    date: {
      full: "Sábado 30 de Mayo 2026",
      isoDate: "2026-05-30T18:00:00",
      day: "Sábado",
      dayNumber: "30",
      month: "Mayo",
      year: "2026",
      date: "30 de mayo 2026",
      mensaje1: "¡La cuenta regresiva ha comenzado!",
      mensaje2: "TAN SOLO FALTAN",
      backgroundCarrouselImages: [
        "/images/pao16.jpg",
      "/images/pao17.jpg",
      "/images/pao18.jpg",
      "/images/pao19.jpg",
      "/images/pao20.jpg",
      ],
    },
    //Misa a la 1pm parroquia Santa fe de Guadalupe, la Sauceda Guanajuato.
    ceremony: {
      time: "11:00 hrs.",
      venue: "Comunidad Am Israel",
      address: "Ayecatl s/n barrio la Asunción, Xochimilco, CDMX C.P 16040",
      type: "Ceremonia de Acción de Gracias",
      ubiLink: "https://maps.app.goo.gl/TsX6SuZoAm48YEfy7",
      ceremonyImage: "/images/paola02.jpeg",
    },
    party: {
      time: "18:00 hrs.",
      venue: "Gran Salón de Hemofilia",
      address: "Av Universidad 322, Casa Blanca 1ra Secc, Villahermosa, Tabasco",
      type: "Recepción",
      ubiLink: "https://maps.app.goo.gl/H9LHYx4J7xQ2LRAU6",
    },
    dressCode: "Formal - Rosa solo la quinceañera",
    restrictions: "",
  },
  
  timeline: {
    title: "Itinerario del Evento",
    timelineImage: "/images/paola04.jpeg",
    mensaje: `Cada momento de este día especial ha sido cuidadosamente planeado 
    para crear recuerdos inolvidables. 
    Desde la ceremonia hasta la celebración, cada detalle refleja el amor y 
    la alegría que compartimos. ¡Espero que disfrutes cada instante tanto como yo!`,
    images: [
      "/images/pao16.jpg",
      "/images/pao17.jpg",
      "/images/pao18.jpg",
      "/images/pao19.jpg",
      "/images/pao20.jpg",
    ],
    /**
   * El programa quedaría así... 
- Ceremonia de Bat Mitzvah 10:00 (podría poner un ícono de una estrella de David o una menorah)
- Recepción 15:00
(Poner un ícono de brindis)
- banquete 15:30
- baile 17:30
- vals 18:30
- pastel 19:45
- fiesta 20:00

   */
    events: [
      {
        id: "event1",
        time: "11:00 hrs.",
        title: "Ceremonia Bat Mitzvah",
        description: "Ceremonia de Acción de Gracias en Comunidad Am Israel.",
        icon: "ceremonia",
      },
      {
        id: "event2",
        time: "15:00 hrs.",
        title: "Recepción",
        description: "Comida, fiesta y celebración.",
        icon: "copas",
      },
      {
        id: "event4",
        time: "15:30 hrs.",
        title: "Banquete",
        description: "Primer baile y apertura de la pista de baile.",
        icon: "cena",
      },
      {
        id: "event5",
        time: "18:30 hrs.",
        title: "Vals",
        description: "Vals familiar y especial.",
        icon: "vals",
      },
      {
        id: "event6",
        time: "19:45 hrs.",
        title: "Corte de Pastel",
        description: "Momento dulce y especial.",
        icon: "pastel",
      },
      {
        id: "event7",
        time: "20:00 hrs.",
        title: "Fiesta",
        description: "Baile y diversión hasta el final.",
        icon: "fiesta",
      }
    ],
  },
  dressCode:{
    title: "Código de Vestimenta",
    message: "¡Vístete para impresionar!",
    subtitle: "Código de vestimenta formal",
    restriction: "Restricción: No niños",
    backgroundImage: "/images/dressCode1.png",
  },
  countdown: {
    targetDate: "December 27, 2025 17:00:00",
    backgroundImage: "/images/countdown-bg.jpg",
  },
  attendance: {
    whatsappNumber: "5219931532244", //+52 1 993 153 2244
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
        no: "Lo siento, no podré asistir.",
      },
    },
    images:[
      "/images/pao16.jpg",
      "/images/pao17.jpg",
      "/images/pao18.jpg",
      "/images/pao19.jpg",
      "/images/pao20.jpg",
    ],
    thankYouMessage:
      "¡Gracias por confirmar tu asistencia! Nos alegra que puedas acompañarnos en este día tan especial.",
  },
  gifts: {
    title: "Lista de Regalos",
    subtitle: "Tu presencia es el mejor regalo, pero si deseas contribuir, aquí tienes algunas ideas.",
    message:
      "Que estés conmigo este día, es lo más importante para nosotros, el obsequio que desees darme, es de tu elección. ¡Sorpréndeme con algo especial!",
    giftsOptions: [
      
    ],
  },
  gallery: {
    title: "Recuerdos Especiales",
    subtitle: "Momentos inolvidables",
    description:
      "Cada imagen captura la esencia de este día tan especial. ¡Gracias por ser parte de estos recuerdos inolvidables!",
    images: [
      {
        id: "image1",
        src: "/images/marifer09.jpeg",
        alt: "Miranda en sus XV años",
        caption: "",
      },
      {
        id: "image2",
        src: "/images/marifer08.jpeg",
        alt: "Baile de Quinceañera",
        caption: "",
      },
      {
        id: "image3",
        src: "/images/marifer07.jpeg",
        alt: "Corte de Pastel",
        caption: "",
      },
      {
        id: "image4",
        src: "/images/marifer06.jpeg",
        alt: "Celebración con Familia y Amigos",
        caption: "",
      },
      {
        id: "image6",
        src: "/images/marifer05.jpeg",
        alt: "Diversión en la Fiesta",
        caption: "",
      },
      {
        id: "image7",
        src: "/images/marifer04.jpeg",
        alt: "Baile con Padres",
        caption: "",
      },
      {
        id: "image8",
        src: "/images/marifer03.jpeg",
        alt: "Amigos y Familiares",
        caption: "",
      },  
      {
        id: "image9",
        src: "/images/marifer02.jpeg",
        alt: "Sonrisas Inolvidables",
        caption: "",
      },
      {
        id: "image10",
        src: "/images/marifer01.jpeg",
        alt: "Diversión Garantizada",
        caption: "",
      },
      
    ],
    imagesUrls: [
      "/images/rapunzel1.jpeg",
      "/images/rapunzel2.jpeg",
      "/images/rapunzel3.jpeg",
      "/images/rapunzel4.jpeg",
      "/images/rapunzel5.jpeg",
      "/images/rapunzel6.jpeg",
      "/images/rapunzel7.jpeg",
      "/images/rapunzel8.jpeg",
    ],
  },
  qrcodeSection:{
    title: "Escanea el Código QR",
    celebrant: "Miranda",
    message: "Para acceder fácilmente a la invitación en tu dispositivo móvil.",
    mainImage: "/images/qrcode-bg.jpg",
  },
  music: {
    src: "/music/quinceanera-song.mp3",
    title: "Canción de Quinceañera",
    artist: "Artista Invitado",
  },
  // 🎵 Configuración de audio
  audio: {
    src: "/audio/musica.mp3",
    fallbacks: ["/audio/musica.ogg", "/audio/musica.wav"],
    title: "Música de Fondo de Boda",
    startTime: 10, // 0:13 - Donde empieza la letra
    endTime: 200, // 1:25 - Final del segmento
    volume: 0.7, // 60% de volumen
    loop: true, // Loop en el rango especificado
    preload: "metadata", // Precargar solo metadatos
    enabled: true, // Control habilitado
    position: {
      desktop: { bottom: "2rem", right: "2rem" },
      mobile: { bottom: "1rem", right: "1rem" },
    },
    styling: {
      size: {
        desktop: "60px",
        mobile: "50px",
      },
      colors: {
        primary: "#e3aaaa",
        hover: "#d48c8c",
        background: "rgba(255, 255, 255, 0.8)",
        icon: "#333",
      },
    },
  },
  VIP_COLORS: {
    rosaAurora: '#E91E63',      // Rosa principal
    lavandaAurora: '#9C27B0',   // Púrpura principal
    oroAurora: '#FF9800',       // Naranja dorado
    blancoSeda: '#FFFFFF',      // Blanco puro
    cremaSuave: '#F5F5F5',      // Gris claro
    rosaIntensa: '#C2185B',     // Rosa intenso
    lavandaIntensa: '#7B1FA2',  // Púrpura intenso
    oroIntensio: '#F57C00',     // Naranja intenso
    rosaDelicada: '#F8BBD9'     // Rosa suave
  },
  customInvitations:{
    adminPassword: "admin1234",
    invitationUrl: "https://quince-vip-maria-fernanda.vercel.app/",
    suggested_messages: [
  "¡Querida amiga! Te invito a celebrar conmigo el día más mágico de mi vida. ¡Espero verte brillar junto a mí!",
  "¡Familia querida! Este día especial no sería lo mismo sin ustedes. ¡Los espero con mucho amor!",
  "¡Hola! Me encantaría que seas parte de mi celebración de XV años. ¡Será una noche inolvidable!",
  "¡Queridos padrinos! Su presencia es fundamental en este momento tan especial. ¡Los espero con cariño!",
  "¡Amigos del alma! Vengan a celebrar conmigo esta nueva etapa. ¡Será una fiesta increíble!",
    ]
  }
};
