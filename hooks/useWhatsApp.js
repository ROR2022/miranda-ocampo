// 💬 useWhatsApp Hook - Hook para manejar confirmaciones por WhatsApp

import { useCallback, useState } from 'react'
import { 
  openWhatsAppRSVP, 
  generateCustomMessage, 
  openWhatsAppSmart,
  handleWhatsAppError 
} from '../utils/whatsappUtils'

/**
 * Hook para manejar funcionalidades de WhatsApp
 * @returns {Object} Funciones para manejar WhatsApp
 */
export const useWhatsApp = () => {

  /**
   * Confirma asistencia vía WhatsApp con mensaje predeterminado
   */
  const confirmAttendance = useCallback(() => {
    try {
      openWhatsAppRSVP()
    } catch (error) {
      handleWhatsAppError(error)
    }
  }, [])

  /**
   * Confirma asistencia con mensaje personalizado
   * @param {Object} guestInfo - Información del invitado
   * @param {string} guestInfo.name - Nombre del invitado
   * @param {number} guestInfo.guestCount - Número de personas
   * @param {string} guestInfo.extraInfo - Información adicional
   */
  const confirmWithCustomMessage = useCallback((guestInfo = {}) => {
    try {
      const customMessage = generateCustomMessage(guestInfo)
      openWhatsAppSmart(customMessage)
    } catch (error) {
      handleWhatsAppError(error)
    }
  }, [])

  /**
   * Envía un mensaje personalizado vía WhatsApp
   * @param {string} message - Mensaje a enviar
   */
  const sendCustomMessage = useCallback((message) => {
    if (!message) {
      console.error("Mensaje requerido")
      return
    }

    try {
      openWhatsAppSmart(message)
    } catch (error) {
      handleWhatsAppError(error)
    }
  }, [])

  /**
   * Contacta a la agencia organizadora
   */
  const contactAgency = useCallback(() => {
    const agencyMessage = "¡Hola! Me interesa conocer más sobre sus servicios de invitaciones de boda."
    sendCustomMessage(agencyMessage)
  }, [sendCustomMessage])

  /**
   * Envía mensaje de felicitaciones
   */
  const sendCongratulations = useCallback(() => {
    const congratsMessage = "¡Felicidades Alejandra y Gerardo! Les deseamos mucha felicidad en esta nueva etapa. 💕"
    sendCustomMessage(congratsMessage)
  }, [sendCustomMessage])

  /**
   * Hook para manejar estado de carga (opcional)
   */
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Confirma asistencia con estado de carga
   */
  const confirmAttendanceWithLoading = useCallback(async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simular delay
      confirmAttendance()
    } finally {
      setIsLoading(false)
    }
  }, [confirmAttendance])

  return {
    confirmAttendance,
    confirmWithCustomMessage,
    sendCustomMessage,
    contactAgency,
    sendCongratulations,
    confirmAttendanceWithLoading,
    isLoading
  }
}
