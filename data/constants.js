// 📞 Constants - Configuraciones y constantes del proyecto

// 📱 Números de teléfono +52 1 686 261 8688
export const PHONE_NUMBERS = {
  rsvp: "525530603612" // Reemplazar con el número real de WhatsApp +52 1 5530603612
}

// 📍 Ubicaciones para Google Maps
export const LOCATIONS = {
  ceremony: "Calz de los Monarcas 140, Villas del Rey Segunda Etapa, 21354 Mexicali, B.C.",
  reception: "Calz de los Monarcas 140, Villas del Rey Segunda Etapa, 21354 Mexicali, B.C."
}

// 💬 Templates de mensajes para WhatsApp
export const WHATSAPP_MESSAGES = {
  rsvp: "¡Hola! Confirmo mi asistencia a la fiesta de XV años de Frida el 27 de septiembre de 2025."
}

// 🎨 Configuraciones de tema
export const THEME_CONFIG = {
  colors: {
    primary: "sage-green", // Verde salvia
    secondary: "gold", // Dorado
    background: "white"
  },
  fonts: {
    script: "Playfair Display",
    body: "Open Sans"
  }
}

// 📱 Configuraciones de navegación
export const NAVIGATION_SECTIONS = [
  { id: "home", label: "Inicio" },
  { id: "parents", label: "Padres" },
  { id: "date", label: "Fecha" },
  { id: "ceremony", label: "Ceremonia" },
  { id: "reception", label: "Recepción" },
  { id: "timeline", label: "Cronograma" },
  { id: "dresscode", label: "Vestimenta" },
  { id: "gifts", label: "Regalos" },
  { id: "gallery", label: "Galería" }
]

// 🖼️ Rutas de imágenes
export const IMAGE_PATHS = {
  couple: {
    main: "/images/couple-main.png",
    sunset: "/images/couple-sunset.png"
  },
  decorative: {
    floralBorder: "/images/floral-border.png",
    celebration: "/images/celebration.png"
  },
  gallery: [
    "/images/gallery-1.png",
    "/images/gallery-2.png"
  ]
}

// ⚙️ Configuraciones de la aplicación
export const APP_CONFIG = {
  title: "Itzel & Carlos - Invitación de Boda",
  description: "Te invitamos a celebrar nuestro amor - 13 de Septiembre 2025",
  language: "es"
}
