// 🗺️ useMapNavigation Hook - Hook para manejar navegación a mapas

import { useCallback } from 'react'
import { openGoogleMaps, handleMapError, isValidLocation } from '../utils/mapUtils'

/**
 * Hook para manejar la navegación a mapas de Google
 * @returns {Object} Funciones para manejar mapas
 */
export const useMapNavigation = () => {
  
  /**
   * Navega a una ubicación específica en Google Maps
   * @param {string} location - Clave de la ubicación (ceremony, reception)
   */
  const navigateToLocation = useCallback((location) => {
    if (!isValidLocation(location)) {
      console.error(`Ubicación inválida: ${location}`)
      return
    }

    try {
      openGoogleMaps(location)
    } catch (error) {
      handleMapError(location, error)
    }
  }, [])

  /**
   * Navega a la ceremonia
   */
  const goToCeremony = useCallback(() => {
    navigateToLocation('ceremony')
  }, [navigateToLocation])

  /**
   * Navega a la recepción
   */
  const goToReception = useCallback(() => {
    navigateToLocation('reception')
  }, [navigateToLocation])

  /**
   * Navega a una ubicación personalizada
   * @param {string} customQuery - Query personalizada para Google Maps
   */
  const navigateToCustomLocation = useCallback((customQuery) => {
    if (!customQuery) {
      console.error("Query personalizada requerida")
      return
    }

    try {
      const encodedQuery = encodeURIComponent(customQuery)
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`
      window.open(mapsUrl, "_blank")
    } catch (error) {
      console.error("Error al abrir ubicación personalizada:", error)
    }
  }, [])

  return {
    navigateToLocation,
    goToCeremony,
    goToReception,
    navigateToCustomLocation
  }
}
