// 🗺️ Map Utils - Utilidades para manejo de mapas

import { LOCATIONS } from '../data/constants'

/**
 * Abre Google Maps con una ubicación específica
 * @param {string} location - Clave de la ubicación (ceremony, reception)
 * @param {string} customQuery - Query personalizada (opcional)
 */
export const openGoogleMaps = (location, customQuery = null) => {
  try {
    const query = customQuery || LOCATIONS[location]
    
    if (!query) {
      console.error(`Ubicación no encontrada: ${location}`)
      return
    }

    const encodedQuery = encodeURIComponent(query)
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`
    
    window.open(mapsUrl, "_blank")
  } catch (error) {
    console.error("Error al abrir Google Maps:", error)
  }
}

/**
 * Genera URL de Google Maps sin abrirla
 * @param {string} location - Clave de la ubicación
 * @returns {string} URL de Google Maps
 */
export const generateMapsUrl = (location) => {
  const query = LOCATIONS[location]
  if (!query) return ""
  
  const encodedQuery = encodeURIComponent(query)
  return `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`
}

/**
 * Valida si una ubicación existe en las constantes
 * @param {string} location - Clave de la ubicación
 * @returns {boolean}
 */
export const isValidLocation = (location) => {
  return location && LOCATIONS.hasOwnProperty(location)
}

/**
 * Obtiene la dirección completa de una ubicación
 * @param {string} location - Clave de la ubicación
 * @returns {string} Dirección completa
 */
export const getLocationAddress = (location) => {
  return LOCATIONS[location] || ""
}

/**
 * Maneja errores de apertura de mapas
 * @param {string} location - Ubicación que falló
 * @param {Error} error - Error ocurrido
 */
export const handleMapError = (location, error) => {
  console.error(`Error al abrir mapa para ${location}:`, error)
  
  // Fallback: mostrar alerta al usuario
  alert(`No se pudo abrir el mapa para ${location}. Por favor, intenta nuevamente.`)
}
