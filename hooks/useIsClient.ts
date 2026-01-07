"use client"

import { useEffect, useState } from 'react'

/**
 * Hook para detectar cuando estamos en el cliente después de la hidratación
 * Útil para evitar errores de hidratación de Next.js
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
} 