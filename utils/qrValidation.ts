// 🔍 Utilidades de validación para URLs y QR

/**
 * Valida si una URL es válida para generar QR
 */
export const validateURL = (url: string): boolean => {
  if (!url || url.trim().length === 0) {
    return false;
  }

  // Regex mejorado para validar URLs
  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?[;&a-z\d%_\.~+=-]*)?(#[-a-z\d_]*)?$/i;
  
  // Soporte para protocolos especiales
  const specialProtocolRegex = /^(mailto:|tel:|sms:|whatsapp:|telegram:)/i;
  
  return urlRegex.test(url) || specialProtocolRegex.test(url);
};

/**
 * Normaliza una URL para asegurar que tenga protocolo
 */
export const normalizeURL = (url: string): string => {
  const trimmedUrl = url.trim();
  
  // Si ya tiene protocolo, devolverla tal como está
  if (/^(https?|mailto|tel|sms|whatsapp|telegram):/i.test(trimmedUrl)) {
    return trimmedUrl;
  }
  
  // Si es un email, agregar mailto:
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUrl)) {
    return `mailto:${trimmedUrl}`;
  }
  
  // Si es un número de teléfono, agregar tel:
  if (/^[\+]?[1-9][\d\s\-\(\)]{7,}$/.test(trimmedUrl)) {
    return `tel:${trimmedUrl}`;
  }
  
  // Por defecto, agregar https://
  return `https://${trimmedUrl}`;
};

/**
 * Obtiene el tipo de URL para mostrar iconos apropiados
 */
export const getURLType = (url: string): 'web' | 'email' | 'phone' | 'social' | 'unknown' => {
  if (!url) return 'unknown';
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.startsWith('mailto:')) return 'email';
  if (lowerUrl.startsWith('tel:') || lowerUrl.startsWith('sms:')) return 'phone';
  if (lowerUrl.includes('whatsapp') || lowerUrl.includes('telegram') || lowerUrl.includes('twitter') || lowerUrl.includes('facebook')) return 'social';
  if (lowerUrl.startsWith('http')) return 'web';
  
  return 'unknown';
};

/**
 * Obtiene sugerencias de URLs comunes
 */
export const getURLSuggestions = (): string[] => [
  'https://www.google.com',
  'https://www.facebook.com',
  'https://www.instagram.com',
  'https://www.youtube.com',
  'https://wa.me/1234567890',
  'mailto:ejemplo@correo.com',
  'tel:+1234567890'
];

/**
 * Valida si un color es hexadecimal válido
 */
export const validateHexColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

/**
 * Convierte un color a formato hexadecimal si es necesario
 */
export const normalizeColor = (color: string): string => {
  // Si ya es hex válido, devolverlo
  if (validateHexColor(color)) {
    return color;
  }
  
  // Convertir nombres de colores comunes
  const colorMap: Record<string, string> = {
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#FF0000',
    'green': '#00FF00',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'purple': '#800080',
    'pink': '#FFC0CB'
  };
  
  return colorMap[color.toLowerCase()] || '#000000';
};

/**
 * Genera un nombre de archivo para el QR descargado
 */
export const generateQRFileName = (url: string, format: 'png' | 'jpg'): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  const urlType = getURLType(url);
  const cleanUrl = url.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
  
  return `QR_${urlType}_${cleanUrl}_${timestamp}.${format}`;
};
