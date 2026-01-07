// 💬 WhatsApp Utils - Utilidades para manejo de WhatsApp

import { PHONE_NUMBERS, WHATSAPP_MESSAGES } from '../data/constants'

/**
 * Genera un enlace de WhatsApp con mensaje predefinido
 * @param {string} phoneNumber - Número de teléfono (opcional, usa el de RSVP por defecto)
 * @param {string} message - Mensaje personalizado (opcional, usa el de RSVP por defecto)
 * @returns {string} URL de WhatsApp
 */
export const generateWhatsAppLink = (phoneNumber = null, message = null) => {
  const phone = phoneNumber || PHONE_NUMBERS.rsvp
  const msg = message || WHATSAPP_MESSAGES.rsvp
  
  if (!phone) {
    console.error("Número de teléfono no configurado")
    return ""
  }

  const encodedMessage = encodeURIComponent(msg)
  return `https://wa.me/${phone}?text=${encodedMessage}`
}

/**
 * Abre WhatsApp con mensaje de confirmación de asistencia
 * @param {string} customMessage - Mensaje personalizado (opcional)
 */
export const openWhatsAppRSVP = (customMessage = null) => {
  try {
    const message = customMessage || WHATSAPP_MESSAGES.rsvp
    const whatsappUrl = generateWhatsAppLink(PHONE_NUMBERS.rsvp, message)
    
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank")
    }
  } catch (error) {
    console.error("Error al abrir WhatsApp:", error)
    handleWhatsAppError(error)
  }
}

/**
 * Genera mensaje personalizado para WhatsApp
 * @param {Object} options - Opciones del mensaje
 * @param {string} options.guestName - Nombre del invitado
 * @param {number} options.guestCount - Número de acompañantes
 * @param {string} options.extraInfo - Información adicional
 * @returns {string} Mensaje personalizado
 */
export const generateCustomMessage = ({ guestName = "", guestCount = 1, extraInfo = "" }) => {
  let message = `¡Hola! ${guestName ? `Soy ${guestName} y ` : ""}confirmo mi asistencia a la boda de Alejandra y Gerardo el 28 de diciembre de 2025.`
  
  if (guestCount > 1) {
    message += ` Asistiré con ${guestCount - 1} acompañante${guestCount > 2 ? 's' : ''}.`
  }
  
  if (extraInfo) {
    message += ` ${extraInfo}`
  }

  return message
}

/**
 * Valida si un número de teléfono es válido
 * @param {string} phoneNumber - Número a validar
 * @returns {boolean}
 */
export const isValidPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return false
  
  // Regex básica para números de teléfono (10-15 dígitos)
  const phoneRegex = /^\d{10,15}$/
  return phoneRegex.test(phoneNumber.replace(/\D/g, ''))
}

/**
 * Formatea un número de teléfono para WhatsApp
 * @param {string} phoneNumber - Número sin formato
 * @returns {string} Número formateado
 */
export const formatPhoneForWhatsApp = (phoneNumber) => {
  // Remover todos los caracteres que no sean números
  return phoneNumber.replace(/\D/g, '')
}

/**
 * Maneja errores de WhatsApp
 * @param {Error} error - Error ocurrido
 */
export const handleWhatsAppError = (error) => {
  console.error("Error en WhatsApp:", error)
  
  // Fallback: mostrar alerta al usuario
  alert("No se pudo abrir WhatsApp. Por favor, verifica que tengas la aplicación instalada o intenta nuevamente.")
}

/**
 * Detecta si el usuario está en móvil para abrir WhatsApp nativo
 * @returns {boolean}
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Abre WhatsApp nativo en móvil o web en desktop
 * @param {string} message - Mensaje a enviar
 */
export const openWhatsAppSmart = (message = null) => {
  const finalMessage = message || WHATSAPP_MESSAGES.rsvp
  const phone = PHONE_NUMBERS.rsvp
  
  if (isMobileDevice()) {
    // En móvil, usar protocolo whatsapp://
    const nativeUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(finalMessage)}`
    window.location.href = nativeUrl
  } else {
    // En desktop, usar wa.me
    openWhatsAppRSVP(finalMessage)
  }
}
